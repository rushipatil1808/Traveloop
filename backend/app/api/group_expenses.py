from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from typing import List, Dict, Any
from app.api.deps import get_current_user
from app.database import (
    clean_doc,
    clean_docs,
    next_id,
    trips,
    expenses as db_expenses,
    settlements as db_settlements,
    tripmembers as db_members,
    budgets as db_budgets,
)
from app.schemas.group_expense import (
    GroupExpense,
    GroupExpenseCreate,
    GroupExpenseUpdate,
    TripMember,
    TripMemberCreate,
    Settlement,
    SettlementCreate,
)
from app.utils.logger import logger

router = APIRouter()

# Helper to verify trip existence and user ownership
def require_trip(trip_id: int, user_id: int) -> dict:
    trip = clean_doc(trips.find_one({"id": trip_id, "user_id": user_id}))
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

# ==================================================
# 1. MEMBER BALANCES & CALCULATIONS ENGINE
# ==================================================

def calculate_group_state(trip_id: int) -> Dict[str, Any]:
    # 1. Fetch all members
    member_list = clean_docs(db_members.find({"trip_id": trip_id}))
    
    # 2. Fetch all group expenses
    expense_list = clean_docs(db_expenses.find({"trip_id": trip_id, "is_group": True}))
    
    # 3. Fetch all settlements
    settlement_list = clean_docs(db_settlements.find({"trip_id": trip_id}))
    
    # Initialize calculated values
    member_map = {}
    for m in member_list:
        member_map[m["name"]] = {
            "id": m["id"],
            "name": m["name"],
            "avatar": m.get("avatar") or m["name"][:2].upper(),
            "total_paid": 0.0,
            "total_owed": 0.0,
            "balance": 0.0
        }
        
    # Calculate expense splits
    total_spent = 0.0
    for e in expense_list:
        amount = float(e.get("amount", 0.0))
        total_spent += amount
        paid_by = e.get("paid_by")
        split_between = e.get("split_between", [])
        
        # Credit the payer
        if paid_by in member_map:
            member_map[paid_by]["total_paid"] += amount
            
        # Debit the split members
        if split_between:
            split_share = amount / len(split_between)
            for name in split_between:
                if name in member_map:
                    member_map[name]["total_owed"] += split_share

    # Calculate raw balances (paid - owed)
    for name, m in member_map.items():
        m["balance"] = m["total_paid"] - m["total_owed"]

    # Adjust balances based on settlements
    for s in settlement_list:
        from_user = s.get("from_user")
        to_user = s.get("to_user")
        amt = float(s.get("amount", 0.0))
        
        # Debtor who paid gets credit (balance increases / debt decreases)
        if from_user in member_map:
            member_map[from_user]["balance"] += amt
            
        # Creditor who received cash gets debit (balance decreases / credit decreases)
        if to_user in member_map:
            member_map[to_user]["balance"] -= amt

    # Run optimal settlement algorithm (Greedy debt simplification)
    debtors = []
    creditors = []
    for name, m in member_map.items():
        bal = round(m["balance"], 2)
        if bal < -0.01:
            debtors.append({"name": name, "balance": bal})
        elif bal > 0.01:
            creditors.append({"name": name, "balance": bal})
            
    # Sort descending by absolute size
    debtors.sort(key=lambda x: abs(x["balance"]), reverse=True)
    creditors.sort(key=lambda x: x["balance"], reverse=True)
    
    suggested_settlements = []
    d_idx = 0
    c_idx = 0
    
    while d_idx < len(debtors) and c_idx < len(creditors):
        debtor = debtors[d_idx]
        creditor = creditors[c_idx]
        
        d_bal = abs(debtor["balance"])
        c_bal = creditor["balance"]
        
        settle_amt = round(min(d_bal, c_bal), 2)
        if settle_amt > 0.01:
            suggested_settlements.append({
                "from_user": debtor["name"],
                "to_user": creditor["name"],
                "amount": settle_amt
            })
            
        debtor["balance"] += settle_amt
        creditor["balance"] -= settle_amt
        
        if abs(debtor["balance"]) < 0.01:
            d_idx += 1
        if abs(creditor["balance"]) < 0.01:
            c_idx += 1

    return {
        "members": list(member_map.values()),
        "total_spent": total_spent,
        "suggested_settlements": suggested_settlements,
        "expenses": expense_list,
        "settlements": settlement_list
    }

# ==================================================
# 2. GROUP EXPENSES ROUTES
# ==================================================

@router.get("/expenses/{trip_id}")
async def get_group_expenses(
    trip_id: int,
    current_user: object = Depends(get_current_user)
):
    try:
        require_trip(trip_id, current_user.id)
        # Ensure at least one member exists (the trip owner)
        existing_owner = db_members.find_one({"trip_id": trip_id, "name": current_user.full_name})
        if not existing_owner:
            db_members.insert_one({
                "id": next_id("tripmembers"),
                "trip_id": trip_id,
                "name": current_user.full_name,
                "avatar": current_user.full_name[:2].upper(),
                "created_at": datetime.utcnow()
            })
            
        state = calculate_group_state(trip_id)
        return {
            "expenses": state["expenses"],
            "total_spent": state["total_spent"],
            "members": state["members"],
            "suggested_settlements": state["suggested_settlements"]
        }
    except Exception as e:
        logger.error(f"Error fetching group expenses: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch group expenses")

@router.post("/expenses/{trip_id}")
async def create_group_expense(
    trip_id: int,
    expense_data: GroupExpenseCreate,
    current_user: object = Depends(get_current_user)
):
    try:
        require_trip(trip_id, current_user.id)
        now = datetime.utcnow()
        doc = expense_data.dict()
        doc.update({
            "id": next_id("expenses"),
            "trip_id": trip_id,
            "is_group": True,
            "created_at": now
        })
        db_expenses.insert_one(doc)
        return clean_doc(doc)
    except Exception as e:
        logger.error(f"Error creating group expense: {e}")
        raise HTTPException(status_code=500, detail="Failed to create group expense")

@router.put("/expenses/{expense_id}")
async def update_group_expense(
    expense_id: int,
    expense_update: GroupExpenseUpdate,
    current_user: object = Depends(get_current_user)
):
    try:
        expense = clean_doc(db_expenses.find_one({"id": expense_id}))
        if not expense:
            raise HTTPException(status_code=404, detail="Group expense not found")
        require_trip(expense["trip_id"], current_user.id)
        
        update_data = {k: v for k, v in expense_update.dict(exclude_unset=True).items() if v is not None}
        db_expenses.update_one({"id": expense_id}, {"$set": update_data})
        return clean_doc(db_expenses.find_one({"id": expense_id}))
    except Exception as e:
        logger.error(f"Error updating group expense: {e}")
        raise HTTPException(status_code=500, detail="Failed to update group expense")

@router.delete("/expenses/{expense_id}")
async def delete_group_expense(
    expense_id: int,
    current_user: object = Depends(get_current_user)
):
    try:
        expense = clean_doc(db_expenses.find_one({"id": expense_id}))
        if not expense:
            raise HTTPException(status_code=404, detail="Group expense not found")
        require_trip(expense["trip_id"], current_user.id)
        
        db_expenses.delete_one({"id": expense_id})
        return {"message": "Group expense deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting group expense: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete group expense")

# ==================================================
# 3. MEMBER MANAGEMENT ROUTES
# ==================================================

@router.post("/members/{trip_id}")
async def add_group_member(
    trip_id: int,
    member_data: TripMemberCreate,
    current_user: object = Depends(get_current_user)
):
    try:
        require_trip(trip_id, current_user.id)
        
        # Prevent duplicate names
        existing = db_members.find_one({"trip_id": trip_id, "name": member_data.name.strip()})
        if existing:
            raise HTTPException(status_code=400, detail="Member with this name already exists")
            
        doc = member_data.dict()
        doc.update({
            "id": next_id("tripmembers"),
            "trip_id": trip_id,
            "created_at": datetime.utcnow()
        })
        db_members.insert_one(doc)
        return clean_doc(doc)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding group member: {e}")
        raise HTTPException(status_code=500, detail="Failed to add group member")

@router.delete("/members/{member_id}")
async def remove_group_member(
    member_id: int,
    current_user: object = Depends(get_current_user)
):
    try:
        member = clean_doc(db_members.find_one({"id": member_id}))
        if not member:
            raise HTTPException(status_code=404, detail="Group member not found")
        require_trip(member["trip_id"], current_user.id)
        
        # Clean up any expenses or settlements paid by or split with this member
        # (or let it remain to avoid calculations breaking, but we will simply delete the member)
        db_members.delete_one({"id": member_id})
        return {"message": "Member removed successfully"}
    except Exception as e:
        logger.error(f"Error removing group member: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove group member")

# ==================================================
# 4. SETTLEMENT MANAGEMENT ROUTES
# ==================================================

@router.post("/settlements/{trip_id}")
async def create_settlement(
    trip_id: int,
    settlement_data: SettlementCreate,
    current_user: object = Depends(get_current_user)
):
    try:
        require_trip(trip_id, current_user.id)
        doc = settlement_data.dict()
        doc.update({
            "id": next_id("settlements"),
            "trip_id": trip_id,
            "settled_at": datetime.utcnow()
        })
        db_settlements.insert_one(doc)
        return clean_doc(doc)
    except Exception as e:
        logger.error(f"Error settling payment: {e}")
        raise HTTPException(status_code=500, detail="Failed to settle payment")

@router.get("/settlements/{trip_id}")
async def get_settlements(
    trip_id: int,
    current_user: object = Depends(get_current_user)
):
    try:
        require_trip(trip_id, current_user.id)
        settlement_list = clean_docs(db_settlements.find({"trip_id": trip_id}))
        return settlement_list
    except Exception as e:
        logger.error(f"Error fetching settlements: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch settlements")
