from fastapi import APIRouter
from models import Transaction
from dependencies import audit_service as service

router = APIRouter(prefix="/api/audit", tags=["Audit"])


@router.get("/transactions", response_model=list[Transaction])
def list_transactions():
    return service.list_transactions()   # example, done for you


# TODO: GET "/transactions/{txn_id}"  -> Transaction   (trace one transaction)
