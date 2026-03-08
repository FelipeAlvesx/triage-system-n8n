# Como Configurar GROQ no N8N (Gratuito)

O GROQ oferece modelos de IA open source extremamente rápidos e gratuitos, perfeitos para desenvolvimento e produção de pequena escala.

## 1. Criar Conta no GROQ

1. Acesse [https://console.groq.com](https://console.groq.com)
2. Clique em **Sign Up** 
3. Complete o cadastro (pode usar GitHub/Google)
4. Confirme seu email

## 2. Gerar API Key

1. No console do GROQ, vá para **API Keys**
2. Clique em **Create API Key**
3. Dê um nome (ex: "N8N Medical Triage")
4. Copie a API Key (formato: `gsk_...`)
5. ⚠️ **IMPORTANTE**: Guarde a chave em local seguro, ela só é mostrada uma vez

## 3. Configurar Credencial no N8N

### Passo a Passo:

1. Abra seu N8N
2. Vá em **Settings** (engrenagem no menu) > **Credentials**
3. Clique em **Add Credential**
4. Procure e selecione **"Header Auth"**
5. Preencha:
   ```
   Name: GROQ API Key
   Header Name: Authorization
   Header Value: Bearer gsk_sua_chave_aqui
   ```
   ⚠️ **Importante**: Não esqueça de colocar `Bearer ` antes da chave!

6. Clique em **Save**

## 4. Configurar no Workflow

1. Importe o workflow `medical-triage-workflow.json`
2. Abra o workflow no editor
3. Clique no node **"AI Medical Analysis (GROQ)"**
4. Na aba **Credentials**, selecione **GROQ API Key** (a credencial que você acabou de criar)
5. Salve o workflow
6. Ative o workflow

## 5. Testar

Execute um teste no workflow:

```bash
curl -X POST https://seu-n8n.com/webhook/medical-triage \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["febre", "dor de cabeça"],
    "patientInfo": {
      "age": 30,
      "gender": "masculino"
    },
    "additionalNotes": "Sintomas há 2 dias"
  }'
```

## Modelos Disponíveis no GROQ

| Modelo | Descrição | Uso Recomendado |
|--------|-----------|-----------------|
| `llama-3.1-70b-versatile` | ✅ **Padrão** - Melhor qualidade | Triagem médica, análise complexa |
| `llama-3.1-8b-instant` | Mais rápido, menor | Respostas rápidas, alta demanda |
| `mixtral-8x7b-32768` | Contexto grande (32k tokens) | Análises longas, histórico extenso |
| `gemma2-9b-it` | Leve e eficiente | Testes, desenvolvimento |

### Como Trocar o Modelo

No workflow, node "AI Medical Analysis (GROQ)", edite o JSON Body:
```json
"model": "llama-3.1-8b-instant"  // troque aqui
```

## Limites do Tier Gratuito

O GROQ oferece limites generosos no tier gratuito:
- ✅ Sem custos para uso pessoal/desenvolvimento
- ✅ Alta velocidade de inferência
- ✅ Modelos open source de alta qualidade

Para produção em larga escala, consulte os planos pagos do GROQ.

## Solução de Problemas

### Erro 401 - Unauthorized
- Verifique se a API Key está correta
- Certifique-se de adicionar `Bearer ` antes da chave
- Confirme que a credencial está selecionada no node

### Erro 429 - Rate Limit
- Você atingiu o limite de requisições
- Adicione intervalo entre as chamadas
- Considere fazer upgrade no plano GROQ

### Erro de Conexão
- Verifique sua conexão com internet
- Confirme que a URL está correta: `https://api.groq.com/openai/v1/chat/completions`
- Teste se o GROQ está online: [https://status.groq.com](https://status.groq.com)

## Vantagens do GROQ vs OpenAI

| Característica | GROQ | OpenAI |
|----------------|------|---------|
| Custo | ✅ Gratuito | 💰 Pago |
| Velocidade | ⚡ Muito rápido | Normal |
| Privacidade | ✅ Sem treino com dados | Pode usar dados |
| Modelos | Open source | Proprietários |
| Setup | Simples | Requer cartão |

## Links Úteis

- 📚 [Documentação GROQ](https://console.groq.com/docs)
- 🚀 [Console GROQ](https://console.groq.com)
- 💬 [Discord GROQ](https://discord.gg/groq)
- 📊 [Status Page](https://status.groq.com)
