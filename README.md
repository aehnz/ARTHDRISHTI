# ARTHDRISHTI

ARTHDRISHTI is a production-shaped financial-intelligence platform for Bharat: understand before recommending, govern before acting, explain before influencing, and protect before selling.

Iteration 3 keeps the existing Next.js product UI visually frozen and moves the full source-of-truth chain behind stable session-bound APIs:

```text
account data -> normalized ledger -> features -> financial state
-> risk / stress / anomaly / health -> recommendation -> decision
-> governance -> trace / audit -> grounded AI explanation
```

## Run locally with PostgreSQL

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

In another terminal:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. Choose **Explore Demo Accounts** on login or use the normal mock phone/OTP flow. All ten seeded accounts use the same authentication, intelligence, governance, audit, explainability, and AI stack as normal accounts; the authenticated banking shell has no scenario switcher.

## Verify

```bash
cd backend
PYTHONPATH=. .venv/bin/pytest -q tests
TEST_DATABASE_URL="$DATABASE_URL" PYTHONPATH=. .venv/bin/pytest -q tests/test_iteration3_postgres.py
PYTHONPATH=. .venv/bin/python -m app.evaluation.run
cd ..
npm run lint
npx tsc --noEmit
npm run build
```

API docs are at `/docs` and `/redoc`; liveness/readiness are `/api/v1/health/live` and `/api/v1/health/ready`.

## Documentation

- [Architecture](Documentation/ARCHITECTURE.md)
- [Database, migrations, and seed](Documentation/DATABASE.md)
- [Intelligence and evaluation](Documentation/INTELLIGENCE.md)
- [AI and OpusMax](Documentation/AI.md)
- [Security and deployment](Documentation/SECURITY_AND_DEPLOYMENT.md)
- [Ten-account evaluation](Documentation/ITERATION3_EVALUATION.md)

The included customers, transactions, models, and results are synthetic. The product does not claim real bank/KYC integration, CIBIL or bureau data, lender approval, guaranteed outcomes, production fraud accuracy, or regulatory certification.
