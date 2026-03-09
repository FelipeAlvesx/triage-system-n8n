# Triage App API

API de triagem medica com NestJS integrada ao n8n.

## Visao Geral

Este projeto recebe sintomas via API, envia para um workflow no n8n, o n8n consulta um modelo de IA no GROQ e retorna uma classificacao de triagem.

Fluxo principal:

1. Cliente chama `POST /triage` na API Nest.
2. API Nest encaminha payload para webhook do n8n.
3. n8n processa com GROQ e responde JSON de triagem.
4. API responde ao cliente com o resultado.

## Stack

- NestJS 11
- TypeScript
- n8n (workflow HTTP webhook)
- GROQ (chat completions)

## Estrutura

```text
src/
  triage/
    triage.controller.ts
    triage.service.ts
    triage.module.ts
n8n/
  workflows/
    medical-triage-workflow.json
    README.md
  GROQ_SETUP.md
```

## Requisitos

- Node.js 20+
- npm
- Instancia n8n ativa
- API key do GROQ

## Setup Local

1. Instale dependencias:

```bash
npm install
```

2. Configure variaveis em `.env` na raiz do projeto:

```env
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/medical-triage
N8N_TIMEOUT_MS=3500
N8N_MAX_ATTEMPTS=2
TRIAGE_STRICT_MODE=false
```

3. Rode em desenvolvimento:

```bash
npm run start:dev
```

API padrao em `http://localhost:3000`.

## Configuracao do n8n

1. Importe `n8n/workflows/medical-triage-workflow.json`.
2. Configure a credencial do GROQ no node `AI Medical Analysis (GROQ)`.
3. Ative o workflow.
4. Use a URL de producao (`/webhook/...`) no `N8N_WEBHOOK_URL`.

Documentacao detalhada:

- `n8n/workflows/README.md`
- `n8n/GROQ_SETUP.md`

## Endpoint da API

### `POST /triage`

Exemplo de payload:

```json
{
  "symptoms": ["febre alta", "dor de cabeca intensa", "nausea"],
  "patientInfo": {
    "age": 35,
    "gender": "feminino",
    "chronicConditions": ["hipertensao"]
  },
  "additionalNotes": "Sintomas ha 2 dias, piorando nas ultimas 12 horas"
}
```

Exemplo de chamada:

```bash
curl -X POST http://localhost:3000/triage \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["febre alta", "dor de cabeca intensa", "nausea"],
    "patientInfo": {"age": 35, "gender": "feminino"},
    "additionalNotes": "Sintomas ha 2 dias"
  }'
```

## Comportamento de Resiliencia

`TriageService` implementa:

- timeout configuravel (`N8N_TIMEOUT_MS`)
- retry curto (`N8N_MAX_ATTEMPTS`)
- fallback quando n8n falha (se `TRIAGE_STRICT_MODE=false`)

Quando `TRIAGE_STRICT_MODE=true`, a API retorna erro HTTP em vez de fallback.

## Scripts

```bash
npm run start
npm run start:dev
npm run build
npm run test
npm run test:e2e
npm run lint
```

## Troubleshooting Rapido

- Retorno em fallback: valide URL de webhook, workflow ativo e credencial GROQ.
- `webhook-test` nao funciona em producao: use `/webhook/...`.
- Erro de modelo no GROQ: troque o `model` no workflow para um modelo ativo.
- Resposta vazia: verifique se o fluxo chega ao node `Respond to API` no n8n.
