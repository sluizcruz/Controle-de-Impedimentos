# 📚 Documentação do Sistema
## Controle de Impedimentos da Sprint

---

## Índice de Documentos

Esta pasta contém a documentação completa do sistema para apresentação e referência.

| # | Documento | Descrição | Público-Alvo |
|---|-----------|-----------|--------------|
| 01 | [Manual do Sistema](01-Manual-do-Sistema.md) | Visão geral, funcionalidades e glossário | Todos |
| 02 | [Regras de Negócio](02-Regras-de-Negocio.md) | 12 regras detalhadas do sistema | Product Owners, Analistas |
| 03 | [Guia de Uso](03-Guia-de-Uso.md) | Passo a passo para usuários | Usuários finais |
| 04 | [Arquitetura Técnica](04-Arquitetura-Tecnica.md) | Estrutura, APIs e código | Desenvolvedores |

---

## Resumo do Sistema

**Controle de Impedimentos** é uma aplicação para rastrear e analisar bloqueios durante sprints ágeis.

### Funcionalidades Principais

✅ Registro de impedimentos em tempo real  
✅ Categorização por 6 tipos de motivos  
✅ Cálculo de horas úteis de bloqueio  
✅ Dashboard com gráficos interativos  
✅ Carrossel de bloqueios ativos  
✅ Histórico por tarefa com rastreio de reaberturas  
✅ Exportação de relatórios em PDF  
✅ Integração com Jira  
✅ Autenticação Google segura  

### Stack Tecnológico

| Frontend | Backend | Infraestrutura |
|----------|---------|----------------|
| React 18 | Firebase Functions | Firebase Hosting |
| TypeScript | Express.js | Firebase Firestore |
| Vite | Node.js 20 | GitHub Actions CI/CD |
| Tailwind CSS | | |
| Chart.js | | |

---

## Como Usar Esta Documentação

### Para Apresentações
1. Inicie pelo [Manual do Sistema](01-Manual-do-Sistema.md)
2. Mostre os gráficos e funcionalidades visualmente
3. Use o [Guia de Uso](03-Guia-de-Uso.md) para demonstrações

### Para Analistas
1. Consulte as [Regras de Negócio](02-Regras-de-Negocio.md)
2. Cada regra tem código único (RN001, RN002, etc.)

### Para Desenvolvedores
1. Leia a [Arquitetura Técnica](04-Arquitetura-Tecnica.md)
2. Entenda os hooks, serviços e estrutura de dados

---

*Documentação v2.0 - Dezembro 2024*
