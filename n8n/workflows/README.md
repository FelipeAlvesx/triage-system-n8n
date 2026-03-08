# N8N Workflows - Medical Triage Assistant

Este diretório contém os workflows do n8n para o sistema de triagem médica.

## Workflow: Medical Triage Assistant

### Descrição
Workflow responsável por receber dados de sintomas de pacientes, processar através de um modelo de IA GROQ (Llama 3.1 70B - gratuito) configurado como assistente médico, e retornar uma análise de triagem com classificação de urgência.

### Fluxo do Workflow

1. **Webhook - Receive Symptoms**: Recebe requisições POST com dados do paciente
2. **Prepare Data**: Valida e formata os dados recebidos
3. **AI Medical Analysis (GROQ)**: Processa com IA usando Llama 3.1 70B (modelo gratuito)
4. **Format Response**: Estrutura a resposta no formato padrão
5. **Respond to API**: Retorna o resultado para a API
6. **Error Handler**: Tratamento de erros (fluxo alternativo)

### Configuração no n8n

#### 1. Importar o Workflow
- Acesse sua instância do n8n
- Vá em **Workflows** > **Import from File**
- Selecione o arquivo `medical-triage-workflow.json`

#### 2. Configurar Credenciais GROQ (Gratuito)
- Crie uma conta em [https://console.groq.com](https://console.groq.com)
- Gere uma API Key no console do GROQ
- No n8n, vá em **Credentials** > **Add Credential**
- Selecione **Header Auth**
- Configure:
  - **Name**: GROQ API Key
  - **Header Name**: `Authorization`
  - **Header Value**: `Bearer sua-api-key-aqui`
- No node **AI Medical Analysis (GROQ)**, selecione essa credencial

#### 3. Ativar o Webhook
- Clique no node **Webhook - Receive Symptoms**
- Copie a URL do webhook (será algo como: `https://seu-n8n.com/webhook/medical-triage`)
- Ative o workflow

### Endpoint

**URL**: `POST https://seu-n8n.com/webhook/medical-triage`

**Headers**:
```
Content-Type: application/json
```

### Formato de Requisição

```json
{
  "symptoms": [
    "dor de cabeça intensa",
    "febre alta",
    "náusea"
  ],
  "patientInfo": {
    "age": 35,
    "gender": "feminino",
    "chronicConditions": ["hipertensão"]
  },
  "additionalNotes": "Sintomas começaram há 2 dias e estão piorando"
}
```

### Formato de Resposta

#### Sucesso (200)
```json
{
  "success": true,
  "timestamp": "2026-03-08T12:00:00.000Z",
  "patient_data": {
    "symptoms": "dor de cabeça intensa, febre alta, náusea",
    "patient_info": {
      "age": 35,
      "gender": "feminino",
      "chronicConditions": ["hipertensão"]
    }
  },
  "triage_result": {
    "classification": "URGENTE",
    "severity_score": 7,
    "analysis": "Paciente apresenta sinais que requerem avaliação médica urgente...",
    "recommendations": [
      "Buscar atendimento médico nas próximas 2-4 horas",
      "Manter hidratação",
      "Monitorar temperatura"
    ],
    "red_flags": [
      "Febre alta combinada com dor de cabeça intensa",
      "Paciente com hipertensão pré-existente"
    ],
    "suggested_specialty": "Clínico Geral ou Pronto Socorro",
    "requires_immediate_attention": true
  },
  "metadata": {
    "processed_at": "2026-03-08T12:00:00.000Z",
    "workflow_version": "1.0.0",
    "model": "GROQ - Llama 3.1 70B"
  }
}
```

#### Erro (500)
```json
{
  "success": false,
  "error": {
    "message": "Erro ao processar triagem médica",
    "details": "OpenAI API timeout",
    "timestamp": "2026-03-08T12:00:00.000Z"
  },
  "triage_result": {
    "classification": "PRIORITÁRIO",
    "severity_score": 5,
    "analysis": "Não foi possível processar a análise. Por favor, busque atendimento médico presencial.",
    "recommendations": ["Consultar um médico presencialmente"],
    "red_flags": ["Sistema de triagem temporariamente indisponível"],
    "suggested_specialty": "Clínico Geral",
    "requires_immediate_attention": false
  }
}
```

### Classificações de Urgência

- **EMERGÊNCIA**: Risco de vida, atendimento imediato
- **URGENTE**: Requer atendimento em 2-4 horas
- **PRIORITÁRIO**: Atendimento no mesmo dia
- **NÃO URGENTE**: Pode aguardar consulta agendada

### Considerações Importantes

1. **Segurança**: Este sistema é para triagem inicial, não substitui avaliação médica presencial
2. **Credenciais**: Mantenha sua API Key do GROQ segura
3. **Custos**: GROQ oferece tier gratuito generoso para uso pessoal/desenvolvimento
4. **Rate Limiting**: Configure limites de requisições conforme necessário
5. **Logs**: O n8n automaticamente loga todas as execuções

### Personalização

Você pode ajustar o comportamento do assistente editando:
- **Modelo**: No node HTTP Request, altere `"model"` para outros modelos GROQ disponíveis:
  - `llama-3.1-70b-versatile` (padrão - recomendado)
  - `llama-3.1-8b-instant` (mais rápido)
  - `mixtral-8x7b-32768` (contexto maior)
  - `gemma2-9b-it` (alternativa leve)
- **Temperatura**: Ajuste de 0 (mais determinístico) a 1 (mais criativo)
- **Max tokens**: Tamanho máximo da resposta

### Monitoramento

No n8n, você pode:
- Ver histórico de execuções
- Debuggar falhas
- Monitorar tempo de resposta
- Exportar logs para análise

### Vantagens do GROQ

✅ **Gratuito**: Tier gratuito generoso para desenvolvimento  
✅ **Rápido**: Inferência extremamente rápida (até 10x mais rápido que outros providers)  
✅ **Modelos Open Source**: Llama 3.1, Mixtral, Gemma  
✅ **API Compatível**: Formato similar ao OpenAI

### Versões

- **1.0.0**: Versão inicial com análise básica de triagem
