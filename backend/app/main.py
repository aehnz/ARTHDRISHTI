from __future__ import annotations

import logging
import time
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import router
from app.core.container import create_container
from app.core.config import get_settings
from app.core.logging import configure_logging

settings = get_settings()
configure_logging()
logger = logging.getLogger("arthdrishti.api")

app = FastAPI(title="ARTHDRISHTI Intelligence API", description="Production-shaped financial intelligence modular monolith with persistent identity, governed decisions, explainability, and controlled AI communication.", version="3.0.0", docs_url="/docs", redoc_url="/redoc")
app.state.container = create_container(settings)
app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins, allow_credentials=True, allow_methods=["GET", "POST", "PATCH", "OPTIONS"], allow_headers=["Content-Type", "Authorization", "X-Request-ID"])
app.include_router(router)


@app.middleware("http")
async def request_observability(request: Request, call_next):
    request_id = request.headers.get("x-request-id", str(uuid4()))
    request.state.request_id = request_id
    started = time.perf_counter()
    response = await call_next(request)
    response.headers["x-request-id"] = request_id
    logger.info("request method=%s path=%s status=%s duration_ms=%.1f request_id=%s", request.method, request.url.path, response.status_code, (time.perf_counter() - started) * 1000, request_id)
    return response


@app.exception_handler(HTTPException)
async def http_error(request: Request, exc: HTTPException) -> JSONResponse:
    if isinstance(exc.detail, dict) and "code" in exc.detail:
        error = exc.detail
    else:
        error = {"code": "REQUEST_FAILED", "message": str(exc.detail)}
    return JSONResponse(status_code=exc.status_code, content={"error": {**error, "requestId": getattr(request.state, "request_id", None)}})


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
    details = [{"location": list(error["loc"]), "message": error["msg"], "type": error["type"]} for error in exc.errors()]
    return JSONResponse(status_code=422, content={"error": {"code": "VALIDATION_ERROR", "message": "Request validation failed.", "details": details, "requestId": getattr(request.state, "request_id", None)}})


@app.exception_handler(Exception)
async def unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("unhandled_error path=%s type=%s", request.url.path, type(exc).__name__)
    return JSONResponse(status_code=500, content={"error": {"code": "INTERNAL_ERROR", "message": "The intelligence service could not complete the request.", "requestId": getattr(request.state, "request_id", None)}})
