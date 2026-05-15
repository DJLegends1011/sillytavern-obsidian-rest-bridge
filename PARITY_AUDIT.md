# Supported-Route Parity Audit

Reference upstream: `coddingtonbear/obsidian-local-rest-api`

## Audited Routes

- `GET /`
- `GET /vault/`
- `GET /vault/{path}`
- `PUT/POST/PATCH /vault/{path}`
- `DELETE /vault/{path}`
- `GET /tags/`
- `POST /search/simple/`
- `POST /search/`
- `GET /commands/`

## Audit Checklist

| Area | Result | Notes |
| --- | --- | --- |
| Bearer auth on protected routes | pass | 401 when missing or wrong. |
| Root auth status | pass | `authenticated` reflects bearer token presence. |
| Vault path normalization | pass | Traversal blocked with 403. |
| Missing file behavior | pass | 404 JSON error. |
| Unsupported route behavior | pass | Explicit 501 for Obsidian-runtime-only routes. |
| Search parity | partial | `POST /search/` is intentionally simplified full-text search. |
| Commands parity | partial | `GET /commands/` only; execution unsupported. |
