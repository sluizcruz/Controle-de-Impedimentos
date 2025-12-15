const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const allowedDomain = process.env.ALLOWED_DOMAIN || "rethink.dev";
const colPath = "artifacts/demo/public/data/impediments";

async function verify(req, requireAuth) {
  if (!requireAuth) return null;
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) throw new Error("unauthorized");
  const idToken = h.slice(7);
  const decoded = await admin.auth().verifyIdToken(idToken);
  const email = String(decoded.email || "").toLowerCase();
  if (!email.endsWith(`@${allowedDomain}`)) throw new Error("forbidden");
  return decoded;
}

app.get("/impediments", async (req, res) => {
  try {
    const sprintId = String(req.query.sprintId || "").trim();
    if (!sprintId) return res.status(400).json({ error: "missing sprintId" });
    const snap = await db
      .collection(colPath)
      .where("sprintId", "==", sprintId)
      .orderBy("startTime", "desc")
      .get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: "error" });
  }
});

app.get("/health", (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.post("/impediments", async (req, res) => {
  try {
    await verify(req, true);
    const body = req.body || {};
    const data = {
      usId: String(body.usId || ""),
      usTitle: String(body.usTitle || ""),
      sprintId: String(body.sprintId || ""),
      startTime: admin.firestore.Timestamp.fromDate(new Date()),
      endTime: null,
      reason: String(body.reason || ""),
      userId: String(body.userId || ""),
      externalLink: String(body.externalLink || ""),
      description: String(body.description || ""),
      responsavel: String(body.responsavel || "")
    };
    if (!data.usId || !data.reason || !data.sprintId)
      return res.status(400).json({ error: "missing fields" });
    const ref = await db.collection(colPath).add(data);
    res.json({ id: ref.id });
  } catch (e) {
    res.status(401).json({ error: "unauthorized" });
  }
});

app.patch("/impediments/:id/end", async (req, res) => {
  try {
    await verify(req, true);
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "missing id" });
    const ref = db.collection(colPath).doc(id);
    await ref.update({ endTime: admin.firestore.Timestamp.fromDate(new Date()) });
    res.json({ ok: true });
  } catch (e) {
    res.status(401).json({ error: "unauthorized" });
  }
});

app.post("/impediments/:usId/reopen", async (req, res) => {
  try {
    await verify(req, true);
    const usId = req.params.usId;
    const body = req.body || {};
    const prevId = String(body.reopenedFrom || "");
    const data = {
      usId,
      usTitle: String(body.usTitle || ""),
      sprintId: String(body.sprintId || ""),
      startTime: admin.firestore.Timestamp.fromDate(new Date()),
      endTime: null,
      reason: String(body.reason || ""),
      userId: String(body.userId || ""),
      externalLink: String(body.externalLink || ""),
      description: String(body.description || ""),
      reopenedFrom: prevId || null,
      reopenedAt: admin.firestore.Timestamp.fromDate(new Date()),
      responsavel: String(body.responsavel || "")
    };
    if (!data.sprintId || !data.reason)
      return res.status(400).json({ error: "missing fields" });
    const ref = await db.collection(colPath).add(data);
    res.json({ id: ref.id });
  } catch (e) {
    res.status(401).json({ error: "unauthorized" });
  }
});

exports.api = functions.https.onRequest(app);
