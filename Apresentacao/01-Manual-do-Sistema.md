# 📘 Manual do Sistema
## Controle de Impedimentos da Sprint

---

## 1. Visão Geral

O **Controle de Impedimentos** é um sistema de gestão e monitoramento de bloqueios que afetam o andamento das tarefas durante uma Sprint ágil. Permite que equipes identifiquem, registrem e analisem impedimentos em tempo real.

### 1.1 Objetivo
- Registrar e rastrear impedimentos em tempo real
- Medir o impacto dos bloqueios na produtividade da equipe
- Identificar padrões e causas recorrentes
- Gerar relatórios visuais para tomada de decisão

### 1.2 Público-Alvo
- **Scrum Masters**: Monitoramento e resolução de impedimentos
- **Product Owners**: Visibilidade do impacto nos entregáveis
- **Desenvolvedores**: Registro rápido de bloqueios
- **Gestores**: Análise de tendências e métricas

---

## 2. Regras de Negócio

### 2.1 Definição de Impedimento

> **Impedimento** é qualquer obstáculo que impede a equipe de progredir em uma tarefa planejada para a Sprint.

### 2.2 Ciclo de Vida do Impedimento

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   ABERTO    │ ───► │   ATIVO     │ ───► │  ENCERRADO  │
└─────────────┘      └─────────────┘      └─────────────┘
    │                                            │
    │                                            ▼
    │                                    ┌─────────────┐
    └────────────────────────────────────│  REABERTO   │
                                         └─────────────┘
```

| Estado | Descrição |
|--------|-----------|
| **ABERTO** | Impedimento recém-registrado |
| **ATIVO** | Impedimento em análise/resolução |
| **ENCERRADO** | Impedimento resolvido |
| **REABERTO** | Impedimento que voltou a ocorrer |

### 2.3 Classificação de Motivos

O sistema possui 6 categorias pré-definidas de impedimentos:

| Motivo | Cor | Descrição | Exemplos |
|--------|-----|-----------|----------|
| **Ambiente** | 🟢 Verde | Problemas de infraestrutura | Servidor fora do ar, ambiente de teste indisponível |
| **Bug Interno** | 🔴 Vermelho | Erros no código do sistema | Null pointer, exceções não tratadas |
| **Dependência Externa** | 🟠 Laranja | Aguardando terceiros | API de parceiro, resposta de fornecedor |
| **Falta de Especificação** | 🔵 Azul | Requisitos incompletos | Critérios de aceite ausentes, dúvidas de negócio |
| **Getnet** | 🟣 Roxo | Integração com Getnet | Timeout, falhas de comunicação |
| **OCC** | 🩵 Ciano | Integração com OCC | Regras de negócio, fluxos OCC |

### 2.4 Cálculo de Tempo Bloqueado

#### Horário Útil (Padrão)
- **Início**: 09:00h
- **Fim**: 18:00h
- **Horas por dia**: 9 horas

O sistema calcula apenas horas úteis de bloqueio, ignorando:
- Horários antes das 09:00h
- Horários após as 18:00h
- Finais de semana

#### Exemplo de Cálculo
```
Início do bloqueio: Sexta-feira 17:00h
Fim do bloqueio: Segunda-feira 10:00h

Tempo calculado:
- Sexta: 17:00 → 18:00 = 1 hora
- Sábado/Domingo: ignorado
- Segunda: 09:00 → 10:00 = 1 hora
Total: 2 horas úteis
```

### 2.5 Limite Diário

O sistema aplica um **cap de 8 horas por dia** para evitar distorções nas métricas quando múltiplos impedimentos ocorrem simultaneamente.

### 2.6 Sprint

#### Definição
- Duração padrão: **15 dias**
- Identificador: `Sprint-AAAA-SS` (ano-semana)
- Exemplo: `Sprint-2024-50`

#### Regras
- Apenas **uma Sprint ativa** por vez
- Data de início não pode ser **futura**
- Impedimentos são **vinculados** a uma Sprint específica
- Ao iniciar nova Sprint, dados anteriores são preservados

---

## 3. Funcionalidades do Sistema

### 3.1 Dashboard Principal

#### Métricas Exibidas
| Métrica | Descrição |
|---------|-----------|
| **Tempo Total Bloqueado** | Soma de horas úteis de todos os impedimentos |
| **SHP Bloqueadas** | Quantidade de tarefas atualmente bloqueadas |
| **SHP Desbloqueadas** | Quantidade de tarefas que foram desbloqueadas |

#### Indicadores Visuais
- **Vermelho**: Impedimentos bloqueados há mais de 8 horas (críticos)
- **Verde**: Itens desbloqueados

### 3.2 Gráficos

#### Gráfico de Pizza - Motivos
- Exibe distribuição do tempo por categoria
- Separado em "Desbloqueadas" e "Bloqueadas"
- Centro mostra total de horas

#### Gráfico de Timeline
- Barras empilhadas por dia da Sprint
- Cada cor representa um motivo
- Limite de 8h por dia aplicado

### 3.3 Carrossel de Bloqueios Ativos
- Rotação automática a cada 5 segundos
- Navegação manual por setas ou dots
- Mostra: SHP, Motivo, Tempo Bloqueado

### 3.4 Tabelas

#### Tabela de Bloqueadas
- Ordenação: maior tempo bloqueado primeiro
- Ações: Encerrar, Ver histórico
- Destaque vermelho para itens críticos

#### Tabela de Desbloqueadas
- Ordenação: desbloqueio mais recente primeiro
- Ações: Reabrir, Ver histórico

### 3.5 Formulário de Registro

#### Campos Obrigatórios
- **ID da US** (ex: SHP-123)
- **Responsável** (nome ou email)
- **Motivo do Bloqueio** (seleção)

#### Campos Opcionais
- Título da US
- Link/ID na Ferramenta (JIRA, Azure DevOps)
- Descrição do Problema

### 3.6 Reabertura de Impedimentos

Quando um impedimento é reaberto:
1. Novo registro é criado mantendo referência ao original
2. Campo `reopenedFrom` armazena ID do registro anterior
3. Histórico completo é preservado
4. Nova descrição pode ser adicionada

---

## 4. Autenticação e Segurança

### 4.1 Login
- Autenticação via **Google OAuth**
- Restrição por domínio: apenas emails `@rethink.dev`

### 4.2 Permissões
| Ação | Visitante | Autenticado |
|------|-----------|-------------|
| Visualizar dashboard | ❌ | ✅ |
| Registrar impedimento | ❌ | ✅ |
| Encerrar impedimento | ❌ | ✅ |
| Reabrir impedimento | ❌ | ✅ |
| Exportar PDF | ❌ | ✅ |

### 4.3 Modo Demo
Para demonstrações, o sistema pode rodar em modo offline com dados simulados.

---

## 5. Exportação de Relatórios

### 5.1 Exportar PDF
O relatório PDF inclui:
- Cabeçalho com Sprint ID e data de geração
- Tabela com todos os impedimentos
- Colunas: SHP, Título, Motivo, Início, Fim, Duração, Descrição

---

## 6. Integrações

### 6.1 Jira
O sistema pode sincronizar impedimentos com o Jira via script `jira-sync.js`:
- Busca issues com status "Blocked" ou label "blocked"
- Mapeia labels para motivos do sistema
- Cria registros automaticamente no Firestore

### 6.2 Firebase
- **Firestore**: Banco de dados em tempo real
- **Authentication**: Login Google
- **Hosting**: Deploy automatizado
- **Functions**: API REST para operações CRUD

---

## 7. Glossário

| Termo | Definição |
|-------|-----------|
| **SHP** | Identificador da tarefa/user story |
| **Sprint** | Período de trabalho (geralmente 2 semanas) |
| **Impedimento** | Bloqueio que impede progresso |
| **US** | User Story (história de usuário) |
| **Horário Útil** | Período de trabalho (9h-18h) |
| **Cap** | Limite máximo (8h/dia) |

---

*Versão 2.0 - Dezembro 2024*
