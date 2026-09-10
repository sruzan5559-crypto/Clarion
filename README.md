# CLARIVON-

## Backend AI configuration

Analysis runs through the server-only provider configured in `.env`. The key is never read from a `VITE_` variable or returned to the browser.

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-4o-mini
```

Set `AI_PROVIDER` to `anthropic` or `gemini` with the corresponding `ANTHROPIC_API_KEY` or `GEMINI_API_KEY` when using another provider. Restart the backend after changing `.env`.
