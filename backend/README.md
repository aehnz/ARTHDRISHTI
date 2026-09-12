# ARTHDRISHTI Intelligence API

FastAPI modular monolith with PostgreSQL/SQLAlchemy repositories, Alembic migrations, persisted sessions and account assignments, transaction/provider boundaries, versioned financial intelligence, governed decisions, durable traces/audit, and controlled fallback/OpusMax explanations.

## Commands

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/alembic upgrade head
PYTHONPATH=. .venv/bin/python -m app.db.seed
PYTHONPATH=. .venv/bin/uvicorn app.main:app --reload --port 8000
PYTHONPATH=. .venv/bin/pytest -q tests
PYTHONPATH=. .venv/bin/python -m app.evaluation.run
```

Use `REPOSITORY_BACKEND=postgres` with `DATABASE_URL`. Production configuration rejects in-memory persistence and forces secure cookies. The default fallback AI requires no external credential. To use OpusMax, set `AI_PROVIDER=opusmax`, a model variable, and inject its credential only at runtime.

Primary contracts are `/api/v1/me/*`; authenticated account assignment always overrides client identity/scenario fields. See the repository `Documentation/` directory for architecture, schema, intelligence, AI, security, deployment, evaluation, and limitations.
