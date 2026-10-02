import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from admin_controller import router as admin_router
from auth_controller import router as auth_router
from customer_controller import router as customer_router
from account_controller import router as account_router, transfer_router
from audit_controller import router as audit_router
from dependencies import account_repo, audit_repo, auth_service, reset_repo, security_repo


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs once when the server starts (before the first request):
    # indexes so the common lookups stay fast as data grows, and an admin login so someone can sign in.
    account_repo.ensure_indexes()
    audit_repo.ensure_indexes()
    security_repo.ensure_indexes()
    reset_repo.ensure_indexes()
    auth_service.ensure_admin(os.getenv("ADMIN_USERNAME", "admin"), os.getenv("ADMIN_PASSWORD", "admin123"))
    yield   # the app runs here; code after yield would run on shutdown


app = FastAPI(title="Banking API", lifespan=lifespan)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    """Extra safety headers on every response."""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"   # browser must trust our Content-Type
    response.headers["X-Frame-Options"] = "DENY"             # no one can show the API inside their page
    response.headers["Referrer-Policy"] = "no-referrer"
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"       # never cache balances or tokens
    return response


# Compress big JSON answers (over 1 KB): less data over the network.
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS: a browser blocks a page from one origin (React dev server, port 5173) from reading
# responses from another origin (this API, port 8000) unless the API says it is allowed.
# ALLOWED_ORIGINS in .env (comma separated) adds the real website's address when deployed.
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_methods=["*"],   # GET, POST, PUT, DELETE...
    allow_headers=["*"],   # e.g. Content-Type: application/json, Authorization: Bearer <token>
    expose_headers=["X-Total-Count"],   # lets the browser read our page-count header
)

app.include_router(auth_router)
app.include_router(customer_router)
app.include_router(account_router)
app.include_router(transfer_router)
app.include_router(audit_router)
app.include_router(admin_router)
