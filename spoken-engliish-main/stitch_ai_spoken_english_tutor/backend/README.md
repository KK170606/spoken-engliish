# LingoFlow Backend

Small local API for LingoFlow. It also serves the full website from `../full-website`.

## Run

Before starting the API, create your own credentials. Secrets are intentionally
not included in GitHub.

1. Copy `.env.example` to `.env`.
2. Set `GROQ_API_KEY` to a Groq API key created for your account.
3. For Firebase Admin features, set `FIREBASE_SERVICE_ACCOUNT_JSON` to a newly
   generated Firebase service-account JSON value on one line.

For PowerShell, load the values for the current terminal session before starting:

```powershell
$env:GROQ_API_KEY = "your_groq_api_key"
$env:FIREBASE_SERVICE_ACCOUNT_JSON = Get-Content .\serviceAccountKey.json -Raw
```

Do not commit `.env` files or `serviceAccountKey.json`.

```bash
npm.cmd run start
```

Default URL:

```text
http://127.0.0.1:4000
```

Website:

- `GET /`
- `GET /index.html`
- `GET /styles.css`
- `GET /script.js`

Endpoints:

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/grammar`
- `GET /api/lesson`
- `POST /api/chat` with `{ "message": "I have went yesterday" }`
