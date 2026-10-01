import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth_controller import router as auth_router
from customer_controller import router as customer_router
from account_controller import router as account_router, transfer_router
from audit_controller import router as audit_router
from dependencies import auth_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs once when the server starts (before the first request):
    # make sure an admin login exists, so there is always someone who can sign in.
    auth_service.ensure_admin(os.getenv("ADMIN_USERNAME", "admin"), os.getenv("ADMIN_PASSWORD", "admin123"))
    yield   # the app runs here; code after yield would run on shutdown


app = FastAPI(title="Banking API", lifespan=lifespan)

# CORS: a browser blocks a page from one origin (React dev server, port 5173) from reading
# responses from another origin (this API, port 8000) unless the API says it is allowed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],   # GET, POST, PUT, DELETE...
    allow_headers=["*"],   # e.g. Content-Type: application/json, Authorization: Bearer <token>
)

app.include_router(auth_router)
app.include_router(customer_router)
app.include_router(account_router)
app.include_router(transfer_router)
app.include_router(audit_router)
