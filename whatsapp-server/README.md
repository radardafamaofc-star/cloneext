# WhatsApp Bot Server (Deploy Externo)

Este é o servidor Node.js que roda o Baileys e conecta ao mesmo Supabase usado pelo painel.

## Pré-requisitos

- Node.js 18+
- npm ou yarn

## Instalação

```bash
cd whatsapp-server
npm install
```

## Configuração

Crie um arquivo `.env` na pasta `whatsapp-server/`:

```env
SUPABASE_URL=https://jlyqbwfuvdewvhaednvd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

> ⚠️ Use a **Service Role Key** (não a anon key) para que o servidor tenha permissão total para ler/escrever nas tabelas.

## Executar

```bash
npm start
```

## Deploy

Recomendamos usar:
- **Railway** (railway.app) — deploy com Git
- **Render** (render.com) — deploy com Docker
- **VPS** (DigitalOcean, Hetzner) — com PM2

### Com PM2 (VPS):
```bash
npm install -g pm2
pm2 start index.js --name whatsapp-bot
pm2 save
pm2 startup
```

## Como funciona

1. O servidor inicia e conecta ao Baileys
2. Gera um QR Code e salva na tabela `whatsapp_status` do Supabase
3. O painel (Lovable) lê o QR Code e exibe para o usuário escanear
4. Quando conectado, o status muda para "connected"
5. Mensagens recebidas são processadas pela Groq AI
6. Logs são salvos na tabela `chat_logs`
7. Configurações são lidas da tabela `bot_settings`
