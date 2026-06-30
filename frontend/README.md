# Smart E‑Waste Frontend

Production-ready React frontend for the **Smart E‑Waste Collection and Management System** (User / Collector / Admin portals).

## Tech

- React (Vite)
- Tailwind CSS
- Axios (JWT auth via `Authorization: Bearer <token>`)
- React Router
- Toast notifications (`react-hot-toast`)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure API base URL:

- Copy `.env.example` to `.env`
- Set `VITE_API_BASE_URL` to your backend URL (example: `http://localhost:3000`)

3. Run locally:

```bash
npm run dev
```

## Notes

- Auth token is stored in `localStorage` under `ewaste_token`.
- Axios attaches the token automatically on every request.
- All screens fetch data from the API (no hardcoded demo datasets).