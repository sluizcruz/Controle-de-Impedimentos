# 📋 Regras de Negócio
## Documento Técnico de Regras

---

## RN001 - Registro de Impedimento

### Descrição
Todo impedimento deve ser registrado com informações mínimas obrigatórias.

### Regras
| Código | Regra |
|--------|-------|
| RN001.1 | Campo **ID da US** é obrigatório |
| RN001.2 | Campo **Responsável** é obrigatório |
| RN001.3 | Campo **Motivo** é obrigatório e deve ser um dos 6 valores pré-definidos |
| RN001.4 | A **data de início** é registrada automaticamente no momento do cadastro |
| RN001.5 | O **usuário** que registrou é armazenado automaticamente |
| RN001.6 | O impedimento é vinculado à **Sprint ativa** |

### Validações
```
SE (usId VAZIO OU responsavel VAZIO OU motivo VAZIO)
  ENTÃO exibir erro e não salvar
FIM-SE
```

---

## RN002 - Encerramento de Impedimento

### Descrição
Impedimentos podem ser encerrados quando o bloqueio é resolvido.

### Regras
| Código | Regra |
|--------|-------|
| RN002.1 | Apenas impedimentos com `endTime = null` podem ser encerrados |
| RN002.2 | Ao encerrar, `endTime` recebe a data/hora atual |
| RN002.3 | O tempo de bloqueio é calculado: `endTime - startTime` |
| RN002.4 | Apenas usuários autenticados podem encerrar impedimentos |

---

## RN003 - Reabertura de Impedimento

### Descrição
Impedimentos previamente encerrados podem ser reabertos se o problema voltar a ocorrer.

### Regras
| Código | Regra |
|--------|-------|
| RN003.1 | Reabertura cria **novo registro**, não modifica o original |
| RN003.2 | Campo `reopenedFrom` armazena o ID do impedimento original |
| RN003.3 | Campo `reopenedAt` armazena a data da reabertura |
| RN003.4 | O motivo pode ser alterado na reabertura |
| RN003.5 | Nova descrição pode ser adicionada |

### Exemplo de Fluxo
```
Impedimento Original (ID: abc123)
  - Status: Encerrado
  - Duração: 3 horas

Reabre impedimento:
  - Novo ID: xyz789
  - reopenedFrom: abc123
  - reopenedAt: 2024-12-14T10:00:00
  - Status: Ativo
```

---

## RN004 - Cálculo de Horas Úteis

### Descrição
O sistema calcula apenas horas dentro do horário de expediente.

### Regras
| Código | Regra |
|--------|-------|
| RN004.1 | Horário útil: **09:00 às 18:00** |
| RN004.2 | Horas fora do expediente são **ignoradas** |
| RN004.3 | Finais de semana **podem** ser contabilizados (configurável) |
| RN004.4 | O usuário pode alternar entre "Horas úteis" e "Horas totais" |

### Algoritmo
```
FUNÇÃO calcularHorasUteis(inicio, fim):
  total = 0
  PARA cada dia ENTRE inicio E fim:
    inicioUtil = MAX(09:00, inicio)
    fimUtil = MIN(18:00, fim)
    SE (fimUtil > inicioUtil):
      total += (fimUtil - inicioUtil)
    FIM-SE
  FIM-PARA
  RETORNAR total
FIM-FUNÇÃO
```

---

## RN005 - Limite Diário (Cap)

### Descrição
O total de horas bloqueadas por dia é limitado para evitar distorções estatísticas.

### Regras
| Código | Regra |
|--------|-------|
| RN005.1 | Limite máximo por dia: **8 horas** |
| RN005.2 | Múltiplos impedimentos no mesmo dia são somados |
| RN005.3 | Se soma > 8h, aplica-se fator proporcional |

### Exemplo
```
Dia X:
  - Impedimento A: 6 horas
  - Impedimento B: 4 horas
  - Total bruto: 10 horas
  - Total com cap: 8 horas

Fator = 8/10 = 0.8
  - A ajustado: 6 × 0.8 = 4.8h
  - B ajustado: 4 × 0.8 = 3.2h
  - Total: 8h
```

---

## RN006 - Sprint

### Descrição
Impedimentos são organizados por Sprints.

### Regras
| Código | Regra |
|--------|-------|
| RN006.1 | Duração padrão da Sprint: **15 dias** |
| RN006.2 | ID da Sprint: `Sprint-AAAA-SS` (ano-semana) |
| RN006.3 | Data de início não pode ser **futura** |
| RN006.4 | Ao iniciar Sprint, data de fim é calculada automaticamente |
| RN006.5 | Estado da Sprint é persistido em localStorage |

### Cálculo da Data de Fim
```
dataFim = dataInicio + 15 dias
```

---

## RN007 - Autenticação

### Descrição
Controle de acesso ao sistema.

### Regras
| Código | Regra |
|--------|-------|
| RN007.1 | Login obrigatório via **Google OAuth** |
| RN007.2 | Apenas emails do domínio **@rethink.dev** são aceitos |
| RN007.3 | Usuários de outros domínios são **desconectados automaticamente** |
| RN007.4 | Token de autenticação expira conforme política do Google |

### Validação de Domínio
```
FUNÇÃO validarEmail(email):
  SE email TERMINA COM "@rethink.dev":
    RETORNAR verdadeiro
  SENÃO:
    desconectar()
    exibir mensagem de erro
    RETORNAR falso
  FIM-SE
FIM-FUNÇÃO
```

---

## RN008 - Classificação Automática de Motivo

### Descrição
Ao sincronizar com Jira, os motivos são inferidos a partir de labels.

### Mapeamento
| Label Jira | Motivo Sistema |
|------------|----------------|
| `getnet` | Getnet |
| `occ` | OCC |
| `ambiente` | Ambiente |
| `bug`, `bug-interno` | Bug Interno |
| `dep-externa`, `dependência externa` | Dependência Externa |
| `falta-especificacao`, `falta de especificação` | Falta de Especificação |
| *(outros)* | Outro |

---

## RN009 - Métricas

### Descrição
Cálculo das métricas do dashboard.

### Regras
| Código | Regra |
|--------|-------|
| RN009.1 | **Tempo Total** = soma de todas as horas (com cap diário) |
| RN009.2 | **SHP Bloqueadas** = contagem distinta de usId com endTime = null |
| RN009.3 | **SHP Desbloqueadas** = contagem distinta de usId sem impedimentos ativos |

### Critério para "Crítico"
```
SE (tempoBloqueo >= 8 horas):
  destacar linha em VERMELHO
FIM-SE
```

---

## RN010 - Ordenação de Tabelas

### Descrição
Regras de ordenação padrão das tabelas.

### Regras
| Tabela | Ordenação |
|--------|-----------|
| Bloqueadas | Maior tempo bloqueado primeiro (DESC) |
| Desbloqueadas | Data de desbloqueio mais recente primeiro (DESC) |
| Modal Histórico | Data de início ascendente (ASC) |

---

## RN011 - Gráfico de Timeline

### Descrição
Regras para o gráfico de barras empilhadas.

### Regras
| Código | Regra |
|--------|-------|
| RN011.1 | Período: todos os dias da Sprint |
| RN011.2 | Cada barra representa um dia |
| RN011.3 | Cores representam motivos |
| RN011.4 | Barras são empilhadas (stack) |
| RN011.5 | Máximo por dia: 8 horas |
| RN011.6 | Labels de início/fim destacados em verde |

---

## RN012 - Carrossel

### Descrição
Comportamento do carrossel de bloqueios ativos.

### Regras
| Código | Regra |
|--------|-------|
| RN012.1 | Rotação automática a cada **5 segundos** |
| RN012.2 | Navegação manual para a rotação automática |
| RN012.3 | Ordenação: maior tempo bloqueado primeiro |
| RN012.4 | Mostra apenas impedimentos com `endTime = null` |

---

*Documento de Regras de Negócio - v2.0*
