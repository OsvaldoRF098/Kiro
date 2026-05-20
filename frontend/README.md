# Countries Explorer — Frontend

React application (Vite) that displays country information, supports search, deletion, restoration, and PDF downloads.

## Environment Variables (Railway)

Configure the following environment variable in your Railway service:

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API service | `https://your-backend.railway.app` |

> **Note:** Vite environment variables must be prefixed with `VITE_` to be accessible in the browser.

## Running Locally

1. Copy `.env.example` to `.env` and set `VITE_API_URL` to your local backend URL (e.g. `http://localhost:3001`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Building for Production

```bash
npm run build
```

The optimized static files will be output to the `dist/` directory.

## Deployment on Railway

1. Create a new Railway service pointing to the `frontend/` directory.
2. Set the `VITE_API_URL` environment variable to the URL of your deployed backend service.
3. Railway will run `npm run build` and serve the `dist/` directory.
