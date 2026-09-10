# CLARIVON

CLARIVON is organized as a Vite frontend, an Express backend, and shared contracts.

## Structure

```text
CLARIVON/
├── frontend/   Vite + React application
├── backend/    Express API, services, database, and backend environment
├── shared/     Shared types and schemas
└── package.json
```

The SQLite database is stored at `backend/data/clarivon.db`. Do not move its WAL or SHM journal files while the backend is running.

## Commands

```bash
npm install
npm run dev             # frontend on 3000, backend on 3001
npm run dev:frontend
npm run dev:backend
npm run build
npm test
```

## Backend AI configuration

Analysis runs through the server-only provider configured in `backend/.env`. The key is never read from a `VITE_` variable or returned to the browser.

```bash
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-3.6-flash
GROQ_API_KEY=your-groq-key
GROQ_MODEL=openai/gpt-oss-20b
AI_PROVIDER=gemini
```

Open exactly `backend/.env` and paste your Gemini key after `GEMINI_API_KEY=` and your Groq key after `GROQ_API_KEY=`. Keep both values in that file only; never add them to frontend code or a `VITE_` variable. Restart the backend after changing the file. Gemini is tried first, with Groq used when Gemini is unavailable or rate-limited.
