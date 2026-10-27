# routeFlow

## Local development

```bash
npm install
npm run api
npm run dev
```

The Vite app runs on `http://127.0.0.1:5173` and proxies `/api/*` requests to the API at `http://127.0.0.1:3000`.

## Email check API

### `POST /api/email/check`

Request body:

```json
{
  "email": "person@example.com"
}
```

Successful response:

```json
{
  "allowed": true,
  "disposable": false,
  "domain": "example.com"
}
```

Disposable response:

```json
{
  "allowed": false,
  "disposable": true,
  "domain": "mailinator.com"
}
```

Invalid email response (`400`):

```json
{
  "allowed": false,
  "disposable": false,
  "error": "Invalid email address"
}
```

Temporary domain-list failure response (`503`):

```json
{
  "allowed": false,
  "disposable": false,
  "error": "Email validation is temporarily unavailable"
}
```

The API starts with the packaged `disposable-email-domains` snapshot and refreshes from `https://disposable.github.io/disposable-email-domains/domains.json` every 24 hours. If a refresh fails, it keeps the last known good list instead of allowing all emails.

## Deployment notes

- Run the API with `npm run api`.
- Ensure requests to `/api` are routed to the Node process.
- Optional environment variable:
  - `DISPOSABLE_DOMAINS_URL`: override the disposable-domain JSON source URL.
