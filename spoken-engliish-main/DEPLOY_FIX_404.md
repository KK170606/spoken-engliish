# Fix Vercel 404 for combined frontend + backend

## Symptom
Vercel deployment returns **404** when trying to access the combined app (frontend + backend).

## Root cause
You deployed with **Project Root Directory = `spoken-engliish-main/`**.

In this repo, the backend/API + static frontend are configured under:
- `stitch_ai_spoken_english_tutor/vercel.json`

That `vercel.json` declares:
- static output from `full-website/`
- API function handler under `functions.api/[...path].js`

So when Vercel uses `spoken-engliish-main/` as the root, it typically does **not** include the `stitch_ai_spoken_english_tutor` configuration, and your `/api/...` routes won’t exist → **404**.

## Correct Vercel setting
In Vercel Dashboard → Project (`spoken-engliish`) → **Settings**:
- Set **Root directory / Project root** to: `stitch_ai_spoken_english_tutor`

Then **Redeploy**.

## Verification
After redeploy, test:
1. `GET /api/health`
   - Expected: `{ ok: true, app: "LingoFlow API" }`
2. `GET /`
   - Expected: static app served from `full-website/index.html`

## Notes
- Your backend code expects endpoints like `/api/chat`, `/api/progress`, `/api/quiz/generate`, etc.
- If `/api/health` fails even after changing the root, then Vercel is not using the intended `vercel.json` (or deployment cache didn’t update). Make sure you redeploy and that the selected root contains `vercel.json`.

