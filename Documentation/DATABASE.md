# PostgreSQL, migrations, and seed

## Schema

The initial Alembic revision creates users, customers, accounts, sessions, OTP challenges, onboarding, scenario fixtures, transactions, debts, goals, consents, protection events, audit events, decisions, decision traces, simulations, recommendations, financial snapshots, feature snapshots, AI conversations, and AI messages.

Important constraints include unique phone numbers, one scenario fixture per customer/scenario, one consent per scope/key, one protection result per account/transaction, unique transaction fingerprints, and one trace per decision. Transaction/account/timestamp, audit/customer/timestamp, expiry, merchant, category, actor, and trace lookup indexes support bounded application queries.

## Clean setup

```bash
cp backend/.env.example backend/.env
docker compose up -d postgres
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/alembic upgrade head
PYTHONPATH=. .venv/bin/python -m app.db.seed
PYTHONPATH=. .venv/bin/uvicorn app.main:app --reload --port 8000
```

Set `DATABASE_URL` to the deployed PostgreSQL DSN. Migration and seed commands are idempotent for the deterministic fixtures. The seed produces ten persisted user/account assignments, two synthetic customers, five source fixtures per customer, six months of ledger history per account, debts, and goals.

## Persistence policy

PostgreSQL is mandatory when `ENVIRONMENT=production`. In-memory adapters remain only for fast local/unit testing. Sessions are opaque persisted rows; logout revokes rather than physically erases the row. State/features use one current versioned snapshot per account. Recommendations are upserted per account. Loan simulations, decisions, and traces retain reproducible inputs and model/policy outputs. What-if runs append immutable simulation records. AI messages append to an account/user conversation.

## Restart policy

A backend restart does not invalidate an unexpired, unrevoked PostgreSQL session. Account assignments, financial source data, consent, protection resolutions, audit events, derived snapshots, decisions, and conversations remain available. Cookie loss, expiry, or logout requires authentication again.

## External data boundary

The configured implementation is the repository-backed synthetic provider. `BankTransactionProvider`, `OpenBankingTransactionProvider`, and `CSVTransactionProvider` are explicit unconfigured boundaries and raise `NotImplementedError`; they do not pretend to contact real banks.
