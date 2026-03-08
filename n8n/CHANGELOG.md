# Resumo das Alterações - OpenAI → GROQ

## O que mudou?

O workflow foi adaptado para usar o **GROQ** ao invés do OpenAI, proporcionando:

✅ **Custo Zero** - Sem necessidade de cartão de crédito  
✅ **Velocidade Superior** - Inferência até 10x mais rápida  
✅ **Mesma Qualidade** - Llama 3.1 70B tem desempenho comparável ao GPT-4  
✅ **Setup Simples** - Cadastro rápido e API key instantânea  

## Alterações Técnicas no Workflow

### Node "AI Medical Analysis"
**Antes (OpenAI):**
```json
{
  "type": "n8n-nodes-base.openAi",
  "parameters": {
    "modelId": "gpt-4",
    "authentication": "predefinedCredentialType"
  }
}
```

**Depois (GROQ):**
```json
{
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://api.groq.com/openai/v1/chat/completions",
    "authentication": "genericCredentialType"
  }
}
```

### Formato da Resposta
**GROQ retorna:**
```json
{
  "choices": [
    {
      "message": {
        "content": "análise da IA aqui"
      }
    }
  ]
}
```

O node "Format Response" foi atualizado para extrair `choices[0].message.content`.

## Como Configurar (Rápido)

1. **Criar conta**: [https://console.groq.com](https://console.groq.com)
2. **Gerar API Key**: No console → API Keys → Create
3. **Adicionar no N8N**: Settings → Credentials → Header Auth
   - Name: `GROQ API Key`
   - Header: `Authorization`
   - Value: `Bearer gsk_sua_chave_aqui`
4. **Configurar node**: Selecionar credencial no node "AI Medical Analysis (GROQ)"
5. **Ativar workflow** ✅

## Comparação de Performance

| Aspecto | OpenAI (GPT-4) | GROQ (Llama 3.1 70B) |
|---------|----------------|----------------------|
| **Custo** | ~$0.03/1k tokens | ✅ Gratuito |
| **Velocidade** | ~2s resposta | ✅ ~0.2s resposta |
| **Qualidade** | Excelente | Muito boa |
| **Setup** | Requer cartão | ✅ Sem cartão |
| **Rate Limit** | Depende do plano | Generoso no free tier |

## Modelos Recomendados por Cenário

### Produção (melhor qualidade)
```json
"model": "llama-3.1-70b-versatile"
```

### Desenvolvimento (mais rápido)
```json
"model": "llama-3.1-8b-instant"
```

### Análises longas (contexto grande)
```json
"model": "mixtral-8x7b-32768"
```

## Migração do OpenAI para GROQ

Se você já tinha o workflow configurado com OpenAI:

1. ✅ **Reimporte** o novo workflow (`medical-triage-workflow.json`)
2. ✅ **Delete** a credencial antiga do OpenAI
3. ✅ **Configure** a nova credencial do GROQ (ver [GROQ_SETUP.md](GROQ_SETUP.md))
4. ✅ **Teste** com um dos exemplos em `example-payloads.json`

## API Compatível

O GROQ usa formato compatível com a API do OpenAI, então:
- ✅ Mesmos conceitos (messages, roles, temperature)
- ✅ Fácil migração entre providers
- ✅ JSON similar de request/response

## Links Úteis

- 📚 [Setup Completo do GROQ](./GROQ_SETUP.md)
- 📖 [README do Workflow](./README.md)
- 🧪 [Exemplos de Payloads](./example-payloads.json)
- 🌐 [Console GROQ](https://console.groq.com)

---

**Resultado:** Sistema de triagem médica com IA **100% gratuito** e mais rápido! 🚀
