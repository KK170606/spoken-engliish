# LingoFlow Backend

Small local API for LingoFlow. It also serves the full website from `../full-website`.

## Run

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
