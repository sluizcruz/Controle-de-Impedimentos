# 🏗️ Arquitetura Técnica
## Documentação para Desenvolvedores

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │    React    │   │  TypeScript │   │   Vite      │       │
│  └─────────────┘   └─────────────┘   └─────────────┘       │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │ Tailwind CSS│   │   Chart.js  │   │   Vitest    │       │
│  └─────────────┘   └─────────────┘   └─────────────┘       │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        FIREBASE                              │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │   Firestore │   │    Auth     │   │   Hosting   │       │
│  └─────────────┘   └─────────────┘   └─────────────┘       │
│  ┌─────────────┐                                            │
│  │  Functions  │ ──► Express API                            │
│  └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Estrutura de Diretórios

```
controle-de-impedimentos/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Header/
│   │   ├── SprintControl/
│   │   ├── MetricsCards/
│   │   ├── Charts/
│   │   ├── Tables/
│   │   ├── ActiveCarousel/
│   │   ├── ImpedimentForm/
│   │   └── LoginOverlay/
│   ├── hooks/               # Custom Hooks
│   │   ├── useAuth.ts
│   │   ├── useImpediments.ts
│   │   └── useSprint.ts
│   ├── services/            # Serviços externos
│   │   └── firebase.ts
│   ├── types/               # TypeScript interfaces
│   │   └── index.ts
│   ├── constants/           # Constantes do sistema
│   │   └── index.ts
│   ├── utils/               # Funções utilitárias
│   │   ├── dateUtils.ts
│   │   └── dateUtils.test.ts
│   ├── test/                # Setup de testes
│   │   └── setup.ts
│   ├── App.tsx              # Componente raiz
│   └── main.tsx             # Entry point
├── functions/               # Firebase Functions
│   ├── index.js             # Express API
│   └── package.json
├── Apresentacao/            # Documentação
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.js
└── firebase.json
```

---

## 3. Fluxo de Dados

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Component  │ ──► │     Hook     │ ──► │   Service    │
└──────────────┘     └──────────────┘     └──────────────┘
       ▲                    │                    │
       │                    │                    ▼
       │                    │            ┌──────────────┐
       │                    └────────────│   Firestore  │
       │                                 └──────────────┘
       │                                        │
       └────────────────────────────────────────┘
                      (Realtime Updates)
```

### Exemplo: Criar Impedimento

1. `ImpedimentForm` coleta dados do usuário
2. Chama `addImpediment()` do hook `useImpediments`
3. Hook chama `createImpediment()` do serviço `firebase.ts`
4. Serviço adiciona documento no Firestore
5. Listener `onSnapshot` recebe atualização
6. Hook atualiza estado local
7. Componentes re-renderizam

---

## 4. Estrutura de Dados

### 4.1 Impediment

```typescript
interface Impediment {
  id: string              // ID do documento Firestore
  usId: string            // ID da User Story (SHP-123)
  usTitle: string         // Título da US
  sprintId: string        // Sprint-YYYY-WW
  startTime: Date         // Início do bloqueio
  endTime: Date | null    // Fim (null = ativo)
  reason: BlockReason     // Categoria do impedimento
  userId: string          // UID do usuário que criou
  responsavel: string     // Nome do responsável
  externalLink: string    // Link Jira/Azure
  description: string     // Descrição do problema
  reopenedFrom?: string   // ID do impedimento original
  reopenedAt?: Date       // Data da reabertura
}
```

### 4.2 BlockReason (Enum)

```typescript
type BlockReason =
  | 'Ambiente'
  | 'Bug Interno'
  | 'Dependência Externa'
  | 'Falta de Especificação'
  | 'Getnet'
  | 'OCC'
  | 'Outro'
```

### 4.3 SprintState (localStorage)

```typescript
interface SprintState {
  sprintId: string    // Sprint-2024-50
  startDate: string   // YYYY-MM-DD
  endDate: string     // YYYY-MM-DD
  iniciada: boolean
}
```

---

## 5. Hooks

### 5.1 useAuth

```typescript
function useAuth(): {
  user: AuthUser | null      // Usuário logado
  loading: boolean           // Carregando auth
  error: string | null       // Erro de login
  isDemo: boolean            // Modo demo ativo
  signIn: () => Promise<void>
  signOutUser: () => Promise<void>
}
```

### 5.2 useImpediments

```typescript
function useImpediments(sprintId: string, userId: string | null): {
  impediments: Impediment[]   // Lista de impedimentos
  loading: boolean
  error: string | null
  metrics: SprintMetrics      // Métricas calculadas
  blockedItems: Impediment[]  // Apenas bloqueados
  unblockedItems: Impediment[] // Apenas desbloqueados
  addImpediment: (data) => Promise<boolean>
  finishImpediment: (id) => Promise<boolean>
  reopen: (impediment, newData) => Promise<boolean>
}
```

### 5.3 useSprint

```typescript
function useSprint(): {
  sprint: Sprint | null
  sprintId: string
  isStarted: boolean
  loading: boolean
  setSprintId: (id: string) => void
  startSprint: (startDate: Date) => void
  getSprintWindow: () => SprintWindow
}
```

---

## 6. Serviço Firebase

### 6.1 Métodos Disponíveis

| Método | Descrição |
|--------|-----------|
| `initializeFirebase()` | Inicializa app Firebase |
| `isDemoMode()` | Retorna se está em modo demo |
| `signInWithGoogle()` | Login com Google |
| `signOut()` | Logout |
| `isEmailAllowed(email)` | Valida domínio |
| `onAuthChange(callback)` | Escuta mudanças de auth |
| `getIdToken()` | Obtém token JWT |
| `subscribeToImpediments(sprintId, cb)` | Escuta impedimentos |
| `createImpediment(sprintId, data, userId)` | Cria impedimento |
| `endImpediment(id)` | Encerra impedimento |
| `reopenImpediment(original, newData, userId)` | Reabre impedimento |

---

## 7. API REST (Firebase Functions)

### Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Health check |
| GET | `/api/impediments?sprintId=X` | Lista impedimentos |
| POST | `/api/impediments` | Cria impedimento |
| PATCH | `/api/impediments/:id/end` | Encerra impedimento |
| POST | `/api/impediments/:usId/reopen` | Reabre impedimento |

### Autenticação
- Header: `Authorization: Bearer <token>`
- Token JWT do Firebase Auth

---

## 8. Testes

### 8.1 Executar Testes

```bash
# Todos os testes
npm run test

# Com cobertura
npm run test:coverage

# Watch mode
npm run test
```

### 8.2 Estrutura de Testes

```
src/
├── utils/
│   └── dateUtils.test.ts      # Testes de funções
├── components/
│   ├── Header/
│   │   └── Header.test.tsx    # Testes de componente
│   └── MetricsCards/
│       └── MetricsCards.test.tsx
```

---

## 9. Build e Deploy

### 9.1 Desenvolvimento

```bash
npm run dev    # Inicia servidor em localhost:3000
```

### 9.2 Produção

```bash
npm run build  # Gera pasta dist/
```

### 9.3 Deploy

```bash
npm run deploy # Build + Firebase deploy
```

### 9.4 CI/CD

Pipeline GitHub Actions:
1. Checkout código
2. Setup Node.js 20
3. Install dependências
4. Run testes
5. Build produção
6. Deploy Firebase Hosting

---

## 10. Variáveis de Ambiente

### Desenvolvimento (.env.local)

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ALLOWED_DOMAIN=rethink.dev
```

### Produção (GitHub Secrets)

- `FIREBASE_SERVICE_ACCOUNT`: JSON da service account

---

*Documentação Técnica - v2.0*
