# GroqBot - WhatsApp Sales Assistant

## Overview

A full-stack WhatsApp sales automation chatbot with an AI-powered backend. Uses the Groq API for LLM responses and Baileys library to connect to WhatsApp. Provides a React dashboard to manage bot settings, view chat logs, and monitor WhatsApp connection status.

## Architecture

- **Frontend**: React + Vite + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: Express.js (TypeScript, runs via `tsx`)
- **Database**: PostgreSQL via Drizzle ORM
- **WhatsApp**: @whiskeysockets/baileys library
- **AI**: Groq SDK for LLM responses

The Express server serves both the API and the Vite frontend together from a single process on **port 5000**.

## Project Structure

```
├── server/          # Express backend
│   ├── index.ts     # App entry point (port 5000)
│   ├── routes.ts    # API route definitions
│   ├── storage.ts   # Database access layer (Drizzle)
│   ├── db.ts        # PostgreSQL connection
│   ├── whatsapp.ts  # Baileys WhatsApp connection
│   ├── vite.ts      # Vite dev server middleware
│   └── static.ts    # Production static file serving
├── src/             # React frontend
│   ├── App.tsx
│   ├── pages/
│   ├── components/
│   └── hooks/
├── shared/
│   ├── schema.ts    # Drizzle ORM table definitions
│   └── routes.ts    # Shared API route constants
├── baileys_auth_info/  # WhatsApp session credentials
├── vite.config.ts
├── drizzle.config.ts
└── tsconfig.json
```

## Development

```bash
npm run dev        # Start Express + Vite dev server on port 5000
npm run build      # Build production bundle
npm run db:push    # Push schema changes to PostgreSQL
```

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (Replit built-in DB)
- `VITE_SUPABASE_PROJECT_ID` — Supabase project ID (set in .env)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon key
- `VITE_SUPABASE_URL` — Supabase project URL

## Database Schema

Two tables managed by Drizzle ORM:
- `bot_settings` — Bot configuration (system prompt, Groq API key, company info, etc.)
- `chat_logs` — WhatsApp conversation history

## Deployment

Configured as a VM deployment (always-running) since WhatsApp requires a persistent connection.
- Build: `npm run build`
- Run: `node dist/index.cjs`
