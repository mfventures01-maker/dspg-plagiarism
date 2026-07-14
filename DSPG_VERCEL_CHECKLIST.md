# DSPG Vercel Compatibility & Deployment Checklist

This document reviews the Vercel serverless environment compatibility of the DSPG repository.

---

## 1. Vercel Compatibility Assessment

*   **Is the repository Vercel compatible?**
    *   **NO** (not directly without configuration additions).
*   **Why is it not directly compatible?**
    *   The backend is a monolithic Express application that listens on a port via `app.listen()`. Vercel hosts code as stateless, event-driven serverless functions.
    *   Vercel requires API endpoints to be structured as standalone handler files under the `/api` directory or configured via a custom rewrite controller in a `vercel.json` routing configuration.
*   **Minimum Required Change:**
    To deploy this monolithic Express application directly to Vercel without splitting it, a `vercel.json` file must be added to the root directory mapping all requests to the server bundle:
    ```json
    {
      "version": 2,
      "builds": [
        {
          "src": "server.ts",
          "use": "@vercel/node"
        }
      ],
      "routes": [
        {
          "src": "/api/(.*)",
          "dest": "server.ts"
        },
        {
          "src": "/(.*)",
          "dest": "/$1"
        }
      ]
    }
    ```
    Additionally, the static SPA routing in production mode (in `server.ts` where it serves the `dist/` directory) needs to let Vercel handle static asset serving, while the serverless function handles the `/api/analyze` and `/api/health` requests.

---

## 2. Environment Variables Inventory

There are no hardcoded secrets in the codebase. All credentials are load-time variables:

| Variable | Required | Description |
| :--- | :--- | :--- |
| **GEMINI_API_KEY** | **Yes** | Key to authenticate remote calls to the Google Gemini models. |
| **NODE_ENV** | **No** | Production/development toggle determining static asset mounting schemes. |
| **PORT** | **No** | Server port config (defaults to 3000). |
