from fastapi import APIRouter, Depends
from auth_guard import require_admin
from models import Transaction
from dependencies import audit_service as service

# dependencies on the ROUTER = every route below is admin-only
router = APIRouter(prefix="/api/audit", tags=["Audit"], dependencies=[Depends(require_admin)])


@router.get("/transactions", response_model=list[Transaction])
def list_transactions():
    return service.list_transactions()   # example, done for you


@router.get("/transactions/{txn_id}", response_model=Transaction)
def get_transaction(txn_id: int):
    return service.get_transaction(txn_id)   # example, done for you
