  # Cloudflare Hardening Checklist

Use this when promoting the Laravel API behind Cloudflare on shared hosting.

## SSL/TLS
- Set SSL/TLS mode to `Full (strict)`.
- Enable `Always Use HTTPS`.
- Enable `Automatic HTTPS Rewrites`.
- Enable HSTS only after HTTPS is confirmed stable end to end.

## DNS and Proxying
- Proxy only the public API hostname through Cloudflare.
- Do not expose database, phpMyAdmin, staging dumps, or internal hosts in public DNS.
- If hosting allows it, allow only Cloudflare IPs at the origin.

## WAF / Firewall Rules
- Block requests to `/.env`, `/.git`, `/vendor`, `/storage/logs`, backup files, and hidden dotfiles.
- Challenge suspicious exploit payloads targeting `/api/*`.
- Challenge high-frequency login abuse on `/api/v1/auth/login`.
- Challenge or rate-limit spam on:
  - `/api/v1/comments`
  - `/api/v1/contacts`
  - `/api/v1/newsletters`
  - `/api/v1/transactions`

## Rate Limiting
- Add Cloudflare rate limits for:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/comments`
  - `POST /api/v1/contacts`
  - `POST /api/v1/newsletters`
  - `POST /api/v1/transactions`
- Keep authenticated admin endpoints uncached and monitored.

## Caching
- Do not cache authenticated/admin API responses.
- Do not cache auth token endpoints.
- Cache only explicitly approved public GET responses if needed later.

## Deployment Verification
- Confirm `https://api.yourdomain.com/api/v1/health` returns over HTTPS only.
- Confirm the origin is not exposing app internals directly.
- Confirm the frontend origin is the only browser origin allowed by CORS.
