# Guia de Debug - Triagem Não Funcionando

## Problema

A API retorna "Não há informações suficientes" mesmo com sintomas claros.

## Causa Provável

O `patientContext` não está sendo montado corretamente no node **"Prepare Data"** do workflow n8n.

## Como Debugar

### 1. Verificar o que o Webhook Recebe

No n8n, abra o node **"Webhook - Receive Symptoms"** e teste com este payload:

```json
{
  "symptoms": [
    "dor no peito intensa",
    "falta de ar",
    "suor frio",
    "dor irradiando para braço esquerdo"
  ],
  "patientInfo": {
    "age": 55,
    "gender": "masculino",
    "chronicConditions": ["diabetes", "hipertensão"]
  },
  "additionalNotes": "Dor começou há 30 minutos, muito intensa, escala 9/10"
}
```

Clique em "Test webhook" e veja a saída.

### 2. Verificar o Output do Node "Prepare Data"

1. Execute o webhook com o payload acima
2. Clique no node **"Prepare Data"**
3. Vá na aba "Test"
4. Veja o output - deve ter:
   - `symptoms`: "dor no peito intensa, falta de ar, suor frio, dor irradiando para braço esquerdo"
   - `patientContext`: texto formatado com idade, gênero e sintomas
   - `groqBody`: objeto completo com model, messages, etc

### 3. Verificar o Body Enviado ao GROQ

Se o "Prepare Data" estiver correto, vá para o node **"AI Medical Analysis (GROQ)"**:

1. Na aba "Test"
2. Veja se em `jsonBody` temos `groqBody` completo
3. A aba "Request" deve mostrar exatamente o que foi enviado ao GROQ

## Como Corrigir

### Opção 1: Substituir o Node "Prepare Data"

Se o output do "Prepare Data" estiver com `patientContext` vazio, reimporte o arquivo com a correção:

Crie um novo arquivo `n8n/workflows/prepare-data-fix.js`:

```javascript
// Validar e preparar dados recebidos
const inputData = $input.item.json;

// Extrair sintomas e dados do paciente
const symptoms = inputData.symptoms || [];
const patientInfo = inputData.patientInfo || {};
const additionalNotes = inputData.additionalNotes || '';

// Construir contexto para IA
const symptomsList = Array.isArray(symptoms) ? symptoms.join(', ') : symptoms;

// DEBUG: Log dos dados
console.log('Input symptoms:', symptoms);
console.log('Patient info:', patientInfo);
console.log('Symptoms list:', symptomsList);

const patientContext = `Paciente: ${patientInfo.age || 'Idade não informada'} anos, ${patientInfo.gender || 'Sexo não informado'}
Sintomas relatados: ${symptomsList}
Observações adicionais: ${additionalNotes}`;

// Preparar body para GROQ com PROMPT COMPLETO
const groqBody = {
  model: 'llama-3.3-70b-versatile',
  messages: [
    {
      role: 'system',
      content: `Você é um médico experiente realizando triagem hospitalar. Aplique raciocínio clínico objetivo baseado em evidências.

PRINCÍPIOS:
1. Analise com critério clínico rigoroso
2. Identifique RED FLAGS de risco de vida
3. Considere idade, comorbidades, tempo de evolução
4. Use classificação realista
5. Respostas BREVES - máximo 1-2 frases

CLASSIFICAÇÕES:
EMERGÊNCIA: Risco iminente - dor torácica, dispneia grave, AVE, choque, hemorragia
URGENTE: Risco significativo em 1-2h - meningite, abdome agudo, febre >39C em <3a, asma grave
PRIORITÁRIO: Avaliação no dia - infecções leves, dor moderada, traumas leves
NÃO URGENTE: Consulta eletiva - resfriado, crônicas estáveis

RESPONDER SEMPRE EM JSON:
{
  "classification": "EMERGÊNCIA|URGENTE|PRIORITÁRIO|NÃO URGENTE",
  "severity_score": 1-10,
  "analysis": "Análise objetiva em 1-2 frases",
  "recommendations": ["máx 3 ações imediatas"],
  "red_flags": ["sinais de alerta ou []"],
  "suggested_specialty": "Especialidade ou PS",
  "requires_immediate_attention": boolean
}`,
    },
    {
      role: 'user',
      content: patientContext, // IMPORTANTE: Aqui vai o contexto do paciente
    },
  ],
  temperature: 0.3,
  max_tokens: 1000,
};

// DEBUG: Log do body
console.log('groqBody:', JSON.stringify(groqBody, null, 2));

return {
  symptoms: symptomsList,
  patientInfo: patientInfo,
  additionalNotes: additionalNotes,
  patientContext: patientContext,
  groqBody: groqBody,
  timestamp: new Date().toISOString(),
};
```

Copie este código e substitua no node "Prepare Data" do workflow.

### Opção 2: Verificar a URL de Webhook

1. Abra o node **"Webhook - Receive Symptoms"**
2. Copie a URL (formato: `https://seu-n8n.com/webhook/...`)
3. Certifique-se que está usando a URL de PRODUÇÃO (não `/webhook-test/`)
4. No `.env` da API, atualize `N8N_WEBHOOK_URL` com a URL correta

## Logs da API

Após fazer os ajustes, rode a API em modo watch:

```bash
npm run start:dev
```

Faça uma chamada POST ao `/triage` com o payload de emergência. No console da API, você verá:

```
[TriageService] Payload recebido: { symptoms: [...], patientInfo: {...}, ... }
[TriageService] Chamando n8n webhook: https://...
[TriageService] Status HTTP: 200
[TriageService] Corpo (primeiros 1000 chars): {...}
```

Se o `patient_data` na resposta vier vazio, o problema está no workflow. Se vier preenchido mas a classificação for errada, o prompt precisa de ajuste.

## Próximos Passos

1. Execute o teste com o payload de emergência
2. Olhe os logs da API
3. Vá ao n8n Executions e veja cada node
4. Me envie a saída do console quando tiver feito isso
