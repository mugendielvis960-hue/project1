# Vendo su Marketplace

A full-stack marketplace with a React frontend, Express API, MongoDB storage, and password-protected administrator actions.

## Run with Docker (recommended)

1. Copy `.env.example` to `.env`.
2. Replace `MONGO_ROOT_PASSWORD` with a random hexadecimal password (for example, `node -e "console.log(require('node:crypto').randomBytes(24).toString('hex'))"`) and set `ADMIN_PASSWORD` to a unique password of at least 16 characters. The MongoDB password is used only inside the private Compose network.
3. Replace `SESSION_SECRET` with a random secret of at least 32 characters. Generate one with:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

4. For local HTTP development, keep `COOKIE_SECURE=false`. For a public HTTPS deployment, set `COOKIE_SECURE=true` and put the app behind a trusted TLS reverse proxy.
5. Build and start the app:

   ```sh
   docker compose up --build -d
   ```

Open `http://localhost:5000`. Use **Admin sign in** with the configured password to create, edit, and delete products. MongoDB data is retained in the `mongo-data` Docker volume. Check service health with `docker compose ps` or `http://localhost:5000/api/health`.

Do not expose MongoDB directly to the public internet. Back up the `mongo-data` volume before upgrades or maintenance.

## Run without Docker

1. Install Node.js 22 or later and MongoDB.
2. Install the root and frontend dependencies:

   ```sh
   npm ci
   npm ci --prefix frontend
   ```

3. Create a root `.env` with `MONGODB_URI`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `PORT=5000`, and `COOKIE_SECURE=false` for local HTTP.
4. Start MongoDB, build the frontend, and run the server:

   ```sh
   npm run build
   npm start
   ```

The server serves both the API and compiled frontend from port 5000. For frontend development with Vite, use `npm run dev --prefix frontend` and run the backend separately with `npm run dev`.

## Deploy on Render

The root `render.yaml` defines a Render web service that builds and serves the frontend and API together. To deploy:

1. Push this repository to a Git provider and connect it to a Render account.
2. In Render, create a new **Blueprint** from the repository and review the `vendo-su-marketplace` web service.
3. Provide `MONGODB_URI` for a MongoDB Atlas database and a unique `ADMIN_PASSWORD` (at least 16 characters). Render generates `SESSION_SECRET` automatically. Keep all credentials in Render's environment settings, not in source control.
4. Deploy and use the generated `onrender.com` URL to verify the site and `/api/health`.
5. Register `vendo-su-marketplace.com` with a domain registrar if it is available. In the Render service's **Settings → Custom Domains**, add the domain and follow the exact DNS records Render displays at your registrar. Verify the domain in Render after DNS updates; Render provisions HTTPS.

The Blueprint uses Render's free web-service plan, which may sleep when idle and is intended for evaluation rather than guaranteed always-on production. Upgrade the Render plan and use an appropriately backed-up, secured MongoDB Atlas cluster before relying on the marketplace for production traffic. Registration fees and hosting/database costs are separate; this project does not register the domain or create external accounts.

## Validation

```sh
npm run lint
npm run check
npm test
npm run build
```

## Deployment notes

- Set strong, unique `ADMIN_PASSWORD` and `SESSION_SECRET` values using the deployment platform's secret manager.
- Set `COOKIE_SECURE=true` when served over HTTPS. Configure `TRUST_PROXY=true` only when the app is behind a trusted proxy that overwrites forwarded headers.
- Set `MONGODB_URI` to a private, backed-up MongoDB service for hosted deployments; the Compose MongoDB service is for the included single-host setup.
- Product listing is public. Mutating product data requires the administrator session cookie.
