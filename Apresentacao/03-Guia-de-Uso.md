# 🖥️ Guia de Uso do Sistema
## Passo a Passo para Usuários

---

## 1. Acessando o Sistema

### 1.1 Login
1. Acesse a URL do sistema
2. Clique no botão **"Login com Google"**
3. Selecione sua conta `@rethink.dev`
4. Aguarde o redirecionamento para o dashboard

> ⚠️ Apenas contas do domínio `@rethink.dev` são aceitas.

---

## 2. Iniciando uma Sprint

### 2.1 Configurar Nova Sprint

1. Localize a seção **Sprint ID** no topo
2. Digite o identificador da Sprint (ex: `Sprint-2024-50`)
3. Selecione a **Data de Início**
4. Clique em **"Iniciar Sprint"**

**Resultado esperado:**
- Badge verde "Sprint iniciada: DD/MM/AAAA até DD/MM/AAAA"
- Timeline mostrando 15 dias

---

## 3. Registrando um Impedimento

### 3.1 Formulário de Registro

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| ID da US | ✅ Sim | Código da tarefa (ex: SHP-123) |
| Título da US | ❌ Não | Descrição breve da tarefa |
| Motivo do Bloqueio | ✅ Sim | Selecione uma categoria |
| Responsável | ✅ Sim | Nome ou email de quem resolve |
| Link/ID na Ferramenta | ❌ Não | Link do Jira/Azure |
| Descrição | ❌ Não | Detalhes do problema |

### 3.2 Passos

1. Preencha o **ID da US** (ex: SHP-456)
2. Digite o **Título** da tarefa
3. Selecione o **Motivo** no dropdown
4. Informe o **Responsável**
5. (Opcional) Adicione link e descrição
6. Clique em **"Iniciar bloqueio"** 🔴

**Resultado esperado:**
- Item aparece na tabela "SHP Bloqueadas"
- Item aparece no Carrossel
- Métricas são atualizadas

---

## 4. Encerrando um Impedimento

### 4.1 Pela Tabela de Bloqueadas

1. Localize a SHP na tabela "SHP Bloqueadas"
2. Clique no botão **"Encerrar"** (verde)
3. Confirme a ação

**Resultado esperado:**
- Item move para "SHP Desbloqueadas"
- Tempo final é calculado
- Gráficos são atualizados

### 4.2 Pelo Carrossel
1. Navegue até o card da SHP no carrossel
2. Use os botões da tabela para encerrar

---

## 5. Reabrindo um Impedimento

### 5.1 Quando Usar
Reabra um impedimento quando:
- O mesmo problema voltar a ocorrer
- A solução não funcionou
- Houve regressão

### 5.2 Passos

1. Localize a SHP na tabela "SHP Desbloqueadas"
2. Clique em **"Reabrir"**
3. (Opcional) Ajuste o motivo e descrição
4. Clique em **"Reabrir"** no modal

**Resultado esperado:**
- Novo registro criado
- Link para registro original preservado
- SHP volta para "Bloqueadas"

---

## 6. Visualizando Histórico

### 6.1 Por SHP

1. Clique no **ID da SHP** (link azul) em qualquer tabela
2. Modal mostra todos os registros dessa SHP
3. Reaberuras são destacadas com "(Reaberto)"
4. Botão "Ver origem" destaca o registro original

### 6.2 Geral

1. Clique no botão **"Histórico"** no header
2. Veja todas as SHPs desbloqueadas

---

## 7. Entendendo os Gráficos

### 7.1 Gráfico de Pizza

**Desbloqueadas (esquerda)**
- Mostra distribuição de tempo por motivo
- Apenas impedimentos JÁ resolvidos
- Centro: total de horas

**Bloqueadas (direita)**
- Mostra situação ATUAL
- Apenas impedimentos ainda abertos
- Atualiza em tempo real

### 7.2 Gráfico de Timeline

- Eixo X: dias da Sprint
- Eixo Y: horas bloqueadas
- Cores: diferentes motivos
- Barras empilhadas = múltiplos impedimentos

### 7.3 Alternando Modo

Use os botões no topo dos gráficos:
- **Horas úteis**: apenas horário comercial (9h-18h)
- **Horas totais**: todas as horas corridas

---

## 8. Exportando Relatório

### 8.1 Exportar PDF

1. Clique em **"Exportar PDF"**
2. Nova janela abre com relatório
3. Use Ctrl+P ou o diálogo automático para imprimir/salvar

**Conteúdo do PDF:**
- Sprint ID
- Data de geração
- Tabela com todos os impedimentos

---

## 9. Cards de Métricas

### 9.1 Interação

| Card | Cor | Ação ao Clicar |
|------|-----|----------------|
| Tempo Total Bloqueado | Branco | Nenhuma |
| SHP Bloqueadas | Vermelho claro | Abre modal de bloqueadas |
| SHP Desbloqueadas | Verde claro | Abre modal de desbloqueadas |

---

## 10. Dicas Rápidas

| Ação | Atalho |
|------|--------|
| Ver bloqueados | Clique no card vermelho |
| Ver desbloqueados | Clique no card verde ou "Histórico" |
| Navegar carrossel | Setas ou dots |
| Pausar carrossel | Navegue manualmente |

---

## 11. Problemas Comuns

### "Necessário login para registrar"
➡️ Faça login com sua conta Google

### "Acesso permitido apenas para emails do domínio..."
➡️ Use uma conta `@rethink.dev`

### Gráficos não aparecem
➡️ Verifique se há dados na Sprint selecionada

### Dados não atualizam
➡️ O dashboard atualiza a cada 10 segundos automaticamente

---

*Guia do Usuário - v2.0*
