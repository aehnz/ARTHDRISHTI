# Security and deployment

## Controls

- Opaque HTTP-only `SameSite=Lax` session cookie; production forces the `Secure` attribute.
- Short-lived one-use OTP challenges, hashed challenge values, expiry, and bounded attempts.
- Persisted revocation and expiry checks on every authenticated request.
- Session-derived account/customer/scenario authorization on `/me/*` and legacy routes.
- Configured credentialed CORS allowlist; wildcard origins are not used.
- Safe error envelopes contain a request ID but no stack traces or credentials.
- Request, provider-failure, audit, and decision logs omit OTPs, cookies, API keys, and full financial records.
- Consent changes constrain spending, debt, anomaly, and AI uses without claiming source records were deleted.
- Bounded transaction/audit query sizes and pagination on high-volume endpoints.

## Environment

| Variable | Required | Meaning |
|---|---:|---|
| `ENVIRONMENT` | yes | `development`, `test`, or `production` |
| `REPOSITORY_BACKEND` | yes | `postgres` in production; `memory` for tests |
| `DATABASE_URL` | for PostgreSQL | SQLAlchemy PostgreSQL DSN |
| `CORS_ORIGINS` | yes | comma-separated trusted frontend origins |
| `SESSION_COOKIE_NAME` | no | opaque cookie name |
| `SESSION_COOKIE_SECURE` | no | forced true in production |
| `SESSION_TTL` | no | session duration in minutes |
| `OTP_TTL_SECONDS` | no | OTP challenge lifetime |
| `OTP_MAX_ATTEMPTS` | no | challenge attempt ceiling |
| `MOCK_OTP` | local only | normal-user mock provider code |
| `AI_PROVIDER` | no | `fallback` or `opusmax` |
| `OPUSMAX_BASE_URL` | no | backend-only provider endpoint |
| `OPUSMAX_MODEL` | with OpusMax | model fallback |
| `AI_FAST_MODEL` | no | ordinary explanation model |
| `AI_DEFAULT_MODEL` | no | default model |
| `AI_REASONING_MODEL` | no | governed decision explanation model |

The OpusMax credential is required only for live provider use and must be injected by a secret manager/runtime environment; it is intentionally not shown in example files.

## Deployment order

1. Provision PostgreSQL and a least-privilege application role.
2. Inject backend environment variables and secrets.
3. Run `alembic upgrade head` as a release task.
4. Run the deterministic seed only in demo/hackathon environments.
5. Start FastAPI behind HTTPS and a trusted reverse proxy.
6. Build/start Next.js with only `NEXT_PUBLIC_API_URL` exposed.
7. Probe `/api/v1/health/live` and `/api/v1/health/ready`.

## Honest scope

This system is production-shaped, governed, explainable, and extensible. It is not production banking certification, real KYC, real CIBIL integration, lender approval, regulatory certification, or validated fraud detection. External bank providers remain explicit unconfigured adapters.
