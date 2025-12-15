const axios = require('axios')
const admin = require('firebase-admin')

const {
  JIRA_BASE_URL,
  JIRA_EMAIL,
  JIRA_API_TOKEN,
  APP_ID = 'demo',
  JQL = 'updated >= -1d'
} = process.env

admin.initializeApp()
const db = admin.firestore()

const jira = axios.create({
  baseURL: `${JIRA_BASE_URL}/rest/api/3`,
  headers: {
    Authorization: 'Basic ' + Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64'),
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

const labelToReason = (labels = []) => {
  const s = labels.map(l => String(l).toLowerCase())
  if (s.includes('getnet')) return 'Getnet'
  if (s.includes('occ')) return 'OCC'
  if (s.includes('ambiente')) return 'Ambiente'
  if (s.includes('bug') || s.includes('bug-interno')) return 'Bug Interno'
  if (s.includes('dep-externa') || s.includes('dependencia') || s.includes('dependência externa')) return 'Dependência Externa'
  if (s.includes('falta-especificacao') || s.includes('falta de especificação')) return 'Falta de Especificação'
  return 'Outro'
}

const getIssueWithChangelog = async (key) => {
  const { data } = await jira.get(`/issue/${key}`, { params: { expand: 'changelog' } })
  return data
}

const extractBlocks = (issue) => {
  const blocks = []
  let activeStart = null
  const histories = issue.changelog?.histories || []
  for (const h of histories) {
    const when = new Date(h.created)
    for (const item of h.items || []) {
      if (item.field === 'status') {
        const to = String(item.toString || '').toLowerCase()
        const from = String(item.fromString || '').toLowerCase()
        if (!activeStart && (to === 'blocked' || to.includes('impedido'))) activeStart = when
        if (activeStart && (from === 'blocked' || from.includes('impedido')) && !(to === 'blocked' || to.includes('impedido'))) {
          blocks.push({ startTime: activeStart, endTime: when })
          activeStart = null
        }
      }
      if (item.field === 'labels') {
        const to = String(item.to || '').toLowerCase()
        const from = String(item.from || '').toLowerCase()
        if (!activeStart && to.includes('blocked')) activeStart = when
        if (activeStart && from.includes('blocked')) {
          blocks.push({ startTime: activeStart, endTime: when })
          activeStart = null
        }
      }
    }
  }
  const statusName = String(issue.fields?.status?.name || '').toLowerCase()
  const labelsArr = (issue.fields?.labels || []).map(l => String(l).toLowerCase())
  const isBlocked = statusName === 'blocked' || labelsArr.includes('blocked')
  if (isBlocked && activeStart) blocks.push({ startTime: activeStart, endTime: null })
  if (isBlocked && blocks.length === 0) blocks.push({ startTime: new Date(issue.fields.updated || Date.now()), endTime: null })
  return blocks
}

const sprintWeeklyId = () => {
  const d = new Date()
  const year = d.getFullYear()
  const oneJan = new Date(d.getFullYear(),0,1)
  const week = Math.ceil((((d - oneJan) / 86400000) + oneJan.getDay()+1)/7)
  return `sprint-${year}-${String(week).padStart(2,'0')}`
}

const upsertImpediments = async (issue, sprintId) => {
  const blocks = extractBlocks(issue)
  const reason = labelToReason(issue.fields?.labels)
  const baseUrl = String(JIRA_BASE_URL || '').replace('/rest/api/3','')
  const externalLink = baseUrl ? `${baseUrl}/browse/${issue.key}` : ''
  const description = typeof issue.fields?.description === 'string' ? issue.fields.description : ''
  const col = db.collection(`artifacts/${APP_ID}/public/data/impediments`)
  const batch = db.batch()
  blocks.forEach((b) => {
    const docId = `${issue.key}-${sprintId}-${b.startTime ? new Date(b.startTime).getTime() : Date.now()}`
    const ref = col.doc(docId)
    batch.set(ref, {
      usId: issue.key,
      usTitle: issue.fields?.summary || '',
      sprintId,
      startTime: b.startTime,
      endTime: b.endTime || null,
      reason,
      userId: 'jira-sync',
      externalLink,
      description
    }, { merge: true })
  })
  await batch.commit()
}

;(async () => {
  const { data } = await jira.post('/search', { jql: JQL, maxResults: 100 })
  const keys = (data.issues || []).map(i => i.key)
  const sprintId = sprintWeeklyId()
  for (const key of keys) {
    const issue = await getIssueWithChangelog(key)
    await upsertImpediments(issue, sprintId)
  }
  process.exit(0)
})().catch(e => { console.error(e?.message || e); process.exit(1) })