from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from customer_controller import router as customer_router
from account_controller import router as account_router, transfer_router
from audit_controller import router as audit_router

app = FastAPI(title="Banking API")

# CORS: a browser blocks a page from one origin (React dev server, port 5173) from reading
# responses from another origin (this API, port 8000) unless the API says it is allowed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],   # GET, POST, PUT, DELETE...
    allow_headers=["*"],   # e.g. Content-Type: application/json
)

app.include_router(customer_router)
app.include_router(account_router)
app.include_router(transfer_router)
app.include_router(audit_router)
