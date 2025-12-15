# 📊 Controle de Impedimentos da Sprint

Dashboard para gerenciamento e monitoramento de bloqueios (impedimentos) durante sprints ágeis.

## 🚀 Funcionalidades

- ✅ Registro de bloqueios com categorização por motivo
- ✅ Dashboard visual com gráficos de pizza e barras
- ✅ Cálculo de horas úteis de bloqueio (9h-18h)
- ✅ Timeline da sprint (15 dias)
- ✅ Carrossel de bloqueios ativos
- ✅ Histórico por SHP com rastreamento de reaberturas
- ✅ Exportação para PDF
- ✅ Autenticação Google com restrição de domínio
- ✅ Integração com Jira

## 🛠️ Stack Tecnológico

| Componente | Tecnologia |
|------------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Estilização** | Tailwind CSS |
| **Gráficos** | Chart.js + react-chartjs-2 |
| **Backend** | Firebase Functions (Node.js 20 + Express) |
| **Database** | Firebase Firestore |
| **Autenticação** | Firebase Auth (Google OAuth) |
| **Hosting** | Firebase Hosting |
| **CI/CD** | GitHub Actions |

## 📁 Estrutura do Projeto

```
controle-de-impedimentos/
├── src/
│   ├── components/      # Componentes React
│   ├── hooks/          # Hooks customizados
│   ├── services/       # Serviços (Firebase, etc)
│   ├── types/          # Tipos TypeScript
│   ├── constants/      # Constantes centralizadas
│   ├── utils/          # Funções utilitárias
│   ├── App.tsx         # Componente principal
│   └── main.tsx        # Entry point
├── functions/          # Firebase Functions (API)
├── tests/             # Testes automatizados
└── public/            # Assets estáticos
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 20+
- npm ou yarn

### Desenvolvimento
```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Rodar testes
npm run test

# Build de produção
npm run build
```

### Deploy
```bash
# Deploy para Firebase
npm run deploy
```

## 🔐 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env.local` com:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_ALLOWED_DOMAIN=seudominio.com
```

## 📊 Motivos de Bloqueio

| Motivo | Descrição |
|--------|-----------|
| Ambiente | Problemas de infraestrutura/ambiente |
| Bug Interno | Bugs encontrados no código |
| Dependência Externa | Aguardando terceiros |
| Getnet | Problemas com integração Getnet |
| OCC | Problemas com OCC |
| Falta de Especificação | Requisitos incompletos |

## 📝 Licença

Projeto interno - Todos os direitos reservados.
