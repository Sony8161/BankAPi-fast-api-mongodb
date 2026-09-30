from fastapi import FastAPI
from customer_controller import router as customer_router
from account_controller import router as account_router, transfer_router
from audit_controller import router as audit_router

app = FastAPI(title="Banking API")
app.include_router(customer_router)
app.include_router(account_router)
app.include_router(transfer_router)
app.include_router(audit_router)
