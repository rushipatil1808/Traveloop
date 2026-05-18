"use client";
import { useState, useEffect, useCallback } from "react";
import { 
  Users, Plus, Trash2, ArrowUpRight, ArrowDownLeft, CheckCircle, 
  DollarSign, PieChart, AlertCircle, Edit, Calendar, UserPlus, CreditCard, ChevronRight, CheckSquare, Square
} from "lucide-react";
import api from "@/lib/api";

const CATEGORY_COLORS = {
  Food: "#10b981",       // emerald
  Hotel: "#3b82f6",      // blue
  Transport: "#f59e0b",  // amber
  Activities: "#8b5cf6", // violet
  Shopping: "#ec4899",   // pink
  Misc: "#6b7280"        // gray
};

export default function GroupExpenses({ tripId, trip, onToast }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ expenses: [], total_spent: 0, members: [], suggested_settlements: [] });
  const [settlements, setSettlements] = useState([]);
  
  // UI States
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Forms
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    paid_by: "",
    split_between: [],
    notes: "",
    date: new Date().toISOString().split("T")[0]
  });

  const [settlementForm, setSettlementForm] = useState({
    from_user: "",
    to_user: "",
    amount: ""
  });

  const [newMemberName, setNewMemberName] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await api.groupExpenses.list(tripId);
      setData(res);
      const setlRes = await api.groupExpenses.listSettlements(tripId);
      setSettlements(setlRes);
      
      // Auto-set default payer/splits in form
      if (res.members?.length > 0) {
        setExpenseForm(prev => ({
          ...prev,
          paid_by: res.members[0].name,
          split_between: res.members.map(m => m.name)
        }));
      }
    } catch (err) {
      onToast(err.message || "Failed to load group expenses", "error");
    } finally {
      setLoading(false);
    }
  }, [tripId, onToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  // Handle Select All/None for splits
  const toggleSplitMember = (name) => {
    setExpenseForm(prev => {
      const split = prev.split_between.includes(name)
        ? prev.split_between.filter(n => n !== name)
        : [...prev.split_between, name];
      return { ...prev, split_between: split };
    });
  };

  const selectAllSplits = (all = true) => {
    setExpenseForm(prev => ({
      ...prev,
      split_between: all ? data.members.map(m => m.name) : []
    }));
  };

  // Submit Expense
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount || expenseForm.split_between.length === 0) {
      onToast("Please fill all fields and select at least one member to split.", "error");
      return;
    }

    try {
      const payload = {
        trip_id: parseInt(tripId),
        title: expenseForm.title.trim(),
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        paid_by: expenseForm.paid_by,
        split_between: expenseForm.split_between,
        notes: expenseForm.notes.trim() || null,
        date: expenseForm.date
      };

      if (editingExpense) {
        await api.groupExpenses.update(editingExpense.id, payload);
        onToast("Expense updated successfully!");
      } else {
        await api.groupExpenses.create(tripId, payload);
        onToast("Expense added successfully!");
      }

      setIsAddExpenseOpen(false);
      setEditingExpense(null);
      // Reset form
      setExpenseForm({
        title: "",
        amount: "",
        category: "Food",
        paid_by: data.members[0]?.name || "",
        split_between: data.members.map(m => m.name) || [],
        notes: "",
        date: new Date().toISOString().split("T")[0]
      });
      fetchData();
    } catch (err) {
      onToast(err.message || "Failed to save expense", "error");
    }
  };

  // Edit Expense
  const startEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      paid_by: expense.paid_by,
      split_between: expense.split_between,
      notes: expense.notes || "",
      date: expense.date || new Date().toISOString().split("T")[0]
    });
    setIsAddExpenseOpen(true);
  };

  // Delete Expense
  const handleDeleteExpense = async (id) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await api.groupExpenses.delete(id);
      onToast("Expense deleted successfully!");
      fetchData();
    } catch (err) {
      onToast(err.message || "Failed to delete expense", "error");
    }
  };

  // Submit Member
  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    try {
      await api.groupExpenses.addMember(tripId, {
        trip_id: parseInt(tripId),
        name: newMemberName.trim(),
        avatar: newMemberName.trim().substring(0, 2).toUpperCase()
      });
      onToast(`${newMemberName} added to the group!`);
      setNewMemberName("");
      setIsAddMemberOpen(false);
      fetchData();
    } catch (err) {
      onToast(err.message || "Failed to add member", "error");
    }
  };

  // Remove Member
  const handleRemoveMember = async (id, name) => {
    if (!confirm(`Remove ${name} from trip? This does not delete historical entries.`)) return;
    try {
      await api.groupExpenses.removeMember(id);
      onToast("Member removed.");
      fetchData();
    } catch (err) {
      onToast(err.message || "Failed to remove member", "error");
    }
  };

  // Submit Settlement
  const handleSettlementSubmit = async (e) => {
    e.preventDefault();
    if (!settlementForm.from_user || !settlementForm.to_user || !settlementForm.amount) {
      onToast("Please complete all settlement fields.", "error");
      return;
    }
    if (settlementForm.from_user === settlementForm.to_user) {
      onToast("Sender and recipient cannot be the same.", "error");
      return;
    }

    try {
      await api.groupExpenses.createSettlement(tripId, {
        trip_id: parseInt(tripId),
        from_user: settlementForm.from_user,
        to_user: settlementForm.to_user,
        amount: parseFloat(settlementForm.amount)
      });
      onToast("Settlement payment recorded successfully!");
      setIsSettleOpen(false);
      setSettlementForm({ from_user: "", to_user: "", amount: "" });
      fetchData();
    } catch (err) {
      onToast(err.message || "Failed to record settlement", "error");
    }
  };

  // Quick Analytics Calculations
  const categorySpending = {};
  Object.keys(CATEGORY_COLORS).forEach(c => { categorySpending[c] = 0; });
  data.expenses.forEach(e => {
    if (categorySpending[e.category] !== undefined) {
      categorySpending[e.category] += e.amount;
    } else {
      categorySpending[e.category] = e.amount;
    }
  });

  const highestSpender = data.members?.reduce((max, m) => 
    (m.total_paid > (max?.total_paid || 0)) ? m : max, null
  );

  // Budget calculations
  const budget = trip?.total_budget || 20000;
  const totalSpent = data.total_spent;
  const remaining = budget - totalSpent;
  const overspending = remaining < 0;

  if (loading && data.members.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4rem", gap: "1rem" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid #fee2e2", borderTopColor: "#f47c7c", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Calculating group balance...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem", width: "100%", animation: "fadeIn 0.3s ease-out" }}>
      
      {/* ── SECTION 1: TRIP EXPENSE OVERVIEW CARD ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        
        {/* Main Stats Card */}
        <div style={{ background: "white", padding: "1.75rem", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: "-10px", top: "-10px", color: "#fee2e2", opacity: 0.25 }}>
            <DollarSign size={120} strokeWidth={1} />
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Group Trip Summary</span>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem", marginBottom: "1rem" }}>{trip?.name || "Our Trip"}</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>Total Group Spent</p>
              <h4 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#f47c7c", margin: "0.25rem 0 0" }}>₹{totalSpent.toLocaleString()}</h4>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>Total Expenses</p>
              <h4 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: "0.25rem 0 0" }}>{data.expenses.length}</h4>
            </div>
          </div>
        </div>

        {/* Dynamic Budget Tracker Card */}
        <div style={{ background: "white", padding: "1.75rem", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Trip Budget Tracker</span>
              {overspending && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "0.25rem 0.625rem", borderRadius: "9999px", background: "#fef2f2", color: "#ef4444", fontSize: "0.75rem", fontWeight: 700 }}>
                  <AlertCircle size={12} /> Over Budget!
                </span>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "0.5rem" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>₹{budget.toLocaleString()}</h3>
              <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Limit</span>
            </div>
          </div>

          <div style={{ margin: "1rem 0" }}>
            <div style={{ height: "8px", width: "100%", background: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
              <div style={{ 
                height: "100%", 
                width: `${Math.min((totalSpent / budget) * 100, 100)}%`, 
                background: overspending ? "#ef4444" : "linear-gradient(90deg, #f47c7c, #fda4af)",
                borderRadius: "9999px",
                transition: "width 0.3s ease-in-out" 
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b", marginTop: "0.5rem" }}>
              <span>{Math.round((totalSpent / budget) * 100)}% Spent</span>
              <span>Remaining: ₹{remaining.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Spend Analytics */}
        <div style={{ background: "white", padding: "1.75rem", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Quick Analytics</span>
            <h4 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem", marginBottom: "0.75rem" }}>Spending Power</h4>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>Highest Spender</p>
              <h5 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", margin: "0.125rem 0 0", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#fee2e2", color: "#f47c7c", fontSize: 10, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
                  {highestSpender?.avatar || "⚡"}
                </span>
                {highestSpender?.name || "No data yet"} <span style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>(Paid ₹{highestSpender?.total_paid || 0})</span>
              </h5>
            </div>
          </div>
        </div>

      </div>

      {/* ── MAIN GROUP VIEW GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: "2.5rem" }}>
        
        {/* Left Side: Expense List & settlements */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Header Action */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>Group Logbook</h3>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button 
                onClick={() => {
                  setEditingExpense(null);
                  setIsAddExpenseOpen(true);
                }} 
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f47c7c", color: "white", padding: "0.5rem 1.25rem", borderRadius: "9999px", fontSize: "0.875rem", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(244,124,124,0.2)", transition: "all 0.2s" }}
                onMouseOver={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseOut={e => e.currentTarget.style.transform = "none"}
              >
                <Plus size={16} /> Add Expense
              </button>
              <button 
                onClick={() => setIsSettleOpen(true)} 
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "white", color: "#334155", padding: "0.5rem 1.25rem", borderRadius: "9999px", fontSize: "0.875rem", fontWeight: 700, border: "1px solid #cbd5e1", cursor: "pointer", transition: "all 0.2s" }}
                onMouseOver={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseOut={e => e.currentTarget.style.background = "white"}
              >
                <CreditCard size={16} /> Settle Debt
              </button>
            </div>
          </div>

          {/* Expenses Feed */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {data.expenses.length === 0 ? (
              <div style={{ textAlignment: "center", textAlign: "center", padding: "4rem 2rem", background: "white", borderRadius: "20px", border: "1px dashed #e2e8f0" }}>
                <Users size={36} style={{ color: "#94a3b8", margin: "0 auto 1rem", opacity: 0.5 }} />
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#475569", marginBottom: "0.25rem" }}>No shared expenses yet</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.875rem", maxWidth: "280px", margin: "0 auto" }}>Add your first group expense to split bills easily among friends.</p>
              </div>
            ) : (
              data.expenses.map(exp => (
                <div key={exp.id} style={{ background: "white", padding: "1.25rem", borderRadius: "18px", border: "1px solid #f1f5f9", boxShadow: "0 2px 8px rgba(0,0,0,0.01)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1.5rem", transition: "transform 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.transform = "translateX(2px)"}
                  onMouseOut={e => e.currentTarget.style.transform = "none"}
                >
                  
                  {/* Category icon & Details */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
                    <div style={{ 
                      width: "48px", 
                      height: "48px", 
                      borderRadius: "14px", 
                      background: `${CATEGORY_COLORS[exp.category]}15`, 
                      color: CATEGORY_COLORS[exp.category],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {exp.category[0]}
                    </div>
                    <div>
                      <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", margin: "0 0 0.25rem 0" }}>{exp.title}</h4>
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", fontSize: "0.75rem", color: "#64748b" }}>
                        <span style={{ background: "#f8fafc", padding: "2px 8px", borderRadius: "9999px" }}>{exp.category}</span>
                        <span>Paid by <strong style={{ color: "#334155" }}>{exp.paid_by}</strong></span>
                        <span>•</span>
                        <span>Split with <strong style={{ color: "#334155" }}>{exp.split_between?.length} member(s)</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexShrink: 0 }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "1.125rem", fontWeight: 800, color: "#0f172a" }}>₹{parseFloat(exp.amount).toLocaleString()}</span>
                      {exp.date && <p style={{ margin: "2px 0 0", fontSize: "0.7rem", color: "#94a3b8" }}>{exp.date}</p>}
                    </div>
                    
                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      <button 
                        onClick={() => startEditExpense(exp)} 
                        style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "6px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                        onMouseOver={e => e.currentTarget.style.background = "#f1f5f9"}
                        onMouseOut={e => e.currentTarget.style.background = "none"}
                        title="Edit Expense"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteExpense(exp.id)} 
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "6px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                        onMouseOver={e => e.currentTarget.style.background = "#fef2f2"}
                        onMouseOut={e => e.currentTarget.style.background = "none"}
                        title="Delete Expense"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Settle Up Log */}
          {settlements.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Settlement Log</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", background: "white", padding: "1.25rem", borderRadius: "18px", border: "1px solid #f1f5f9" }}>
                {settlements.map((s, idx) => (
                  <div key={s.id || idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.875rem", borderBottom: idx === settlements.length - 1 ? "none" : "1px solid #f8fafc", paddingBottom: idx === settlements.length - 1 ? 0 : "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#334155" }}>
                      <CheckCircle size={16} color="#10b981" />
                      <span>
                        <strong style={{ color: "#0f172a" }}>{s.from_user}</strong> paid <strong style={{ color: "#0f172a" }}>{s.to_user}</strong>
                      </span>
                    </div>
                    <span style={{ fontWeight: 800, color: "#10b981" }}>₹{s.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Members & Balance Settlement Paths */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Members Title */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>Group Buddies</h3>
            <button 
              onClick={() => setIsAddMemberOpen(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: "#f47c7c", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer" }}
            >
              <UserPlus size={14} /> Add Buddy
            </button>
          </div>

          {/* Members Feed with Color coded cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {data.members.map(member => {
              const isPositive = member.balance >= 0.01;
              const isNegative = member.balance <= -0.01;
              const isNeutral = !isPositive && !isNegative;
              
              return (
                <div key={member.id} style={{ 
                  background: "white", 
                  padding: "1rem 1.25rem", 
                  borderRadius: "16px", 
                  border: `1px solid ${isPositive ? "#d1fae5" : (isNegative ? "#fee2e2" : "#f1f5f9")}`,
                  background: isPositive ? "#f0fdf4" : (isNegative ? "#fef2f2" : "white"),
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center" 
                }}>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: isPositive ? "#d1fae5" : (isNegative ? "#fee2e2" : "#e2e8f0"), color: isPositive ? "#065f46" : (isNegative ? "#b91c1c" : "#475569"), display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", fontSize: "0.8125rem", fontWeight: 800 }}>
                      {member.avatar || member.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>{member.name}</h4>
                      <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>Paid: ₹{member.total_paid || 0}</p>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    {isPositive && (
                      <span style={{ fontSize: "0.875rem", fontWeight: 800, color: "#166534", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                        <ArrowUpRight size={14} /> gets ₹{member.balance.toFixed(0)}
                      </span>
                    )}
                    {isNegative && (
                      <span style={{ fontSize: "0.875rem", fontWeight: 800, color: "#991b1b", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                        <ArrowDownLeft size={14} /> owes ₹{Math.abs(member.balance).toFixed(0)}
                      </span>
                    )}
                    {isNeutral && (
                      <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#64748b" }}>Settled</span>
                    )}
                    
                    {/* Delete member (only show if not owner and not main creator) */}
                    {member.name !== trip?.user_name && data.members.length > 1 && (
                      <button 
                        onClick={() => handleRemoveMember(member.id, member.name)} 
                        style={{ display: "block", marginLeft: "auto", background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: "0.6875rem", padding: "2px 0 0", marginTop: "2px" }}
                        onMouseOver={e => e.currentTarget.style.color = "#ef4444"}
                        onMouseOut={e => e.currentTarget.style.color = "#cbd5e1"}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Simplified Settlements suggestions engine */}
          {data.suggested_settlements.length > 0 && (
            <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", padding: "1.5rem", borderRadius: "20px", color: "white", display: "flex", flexDirection: "column", gap: "1rem", boxShadow: "0 8px 30px rgba(15,23,42,0.15)" }}>
              <div>
                <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#f47c7c", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Debt Simplification</h4>
                <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>Optimal way to clear all group payments.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {data.suggested_settlements.map((s, idx) => (
                  <div key={idx} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", padding: "0.875rem", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8125rem", color: "#e2e8f0" }}>
                      <strong>{s.from_user}</strong> owes <strong>{s.to_user}</strong>
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "1rem", fontWeight: 800, color: "#10b981" }}>₹{s.amount}</span>
                      <button 
                        onClick={() => {
                          setSettlementForm({ from_user: s.from_user, to_user: s.to_user, amount: s.amount.toString() });
                          setIsSettleOpen(true);
                        }}
                        style={{ border: "none", background: "#f47c7c", color: "white", padding: "4px 8px", borderRadius: "6px", fontSize: "0.6875rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        Settle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Category Analytics Charts representation */}
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "20px", border: "1px solid #f1f5f9" }}>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Spending by Category</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {Object.keys(categorySpending).map(cat => {
                const spent = categorySpending[cat];
                const pct = totalSpent > 0 ? (spent / totalSpent) * 100 : 0;
                if (spent === 0) return null;
                
                return (
                  <div key={cat}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#334155", fontWeight: 600, marginBottom: "4px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: CATEGORY_COLORS[cat] }} />
                        {cat}
                      </span>
                      <span>₹{spent.toLocaleString()} ({Math.round(pct)}%)</span>
                    </div>
                    <div style={{ height: 6, background: "#f1f5f9", borderRadius: "9999px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: CATEGORY_COLORS[cat], borderRadius: "9999px" }} />
                    </div>
                  </div>
                );
              })}
              {totalSpent === 0 && (
                <p style={{ color: "#94a3b8", fontSize: "0.75rem", margin: 0, textAlign: "center" }}>No spending logged yet.</p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ── MODAL 1: ADD / EDIT EXPENSE ── */}
      {isAddExpenseOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, animation: "fadeIn 0.2s ease-out" }}>
          <form onSubmit={handleExpenseSubmit} style={{ background: "white", padding: "2.25rem", borderRadius: "24px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", gap: "1.25rem", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              {editingExpense ? "Edit Shared Expense" : "Add Shared Expense"}
            </h3>
            
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Expense Title</label>
              <input 
                value={expenseForm.title}
                onChange={e => setExpenseForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Baga Beach Shack dinner"
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "0.875rem", outline: "none" }}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Amount (₹)</label>
                <input 
                  type="number"
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "0.875rem", outline: "none" }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Category</label>
                <select 
                  value={expenseForm.category}
                  onChange={e => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "0.875rem", outline: "none", background: "white" }}
                >
                  {Object.keys(CATEGORY_COLORS).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Paid By</label>
                <select 
                  value={expenseForm.paid_by}
                  onChange={e => setExpenseForm(prev => ({ ...prev, paid_by: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "0.875rem", outline: "none", background: "white" }}
                >
                  {data.members.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Date</label>
                <input 
                  type="date"
                  value={expenseForm.date}
                  onChange={e => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                  style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "0.875rem", outline: "none" }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Split Between</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="button" onClick={() => selectAllSplits(true)} style={{ border: "none", background: "none", color: "#f47c7c", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>Select All</button>
                  <button type="button" onClick={() => selectAllSplits(false)} style={{ border: "none", background: "none", color: "#64748b", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>Clear All</button>
                </div>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "0.75rem", maxHeight: "120px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                {data.members.map(m => {
                  const isChecked = expenseForm.split_between.includes(m.name);
                  return (
                    <div 
                      key={m.id} 
                      onClick={() => toggleSplitMember(m.name)}
                      style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8125rem", cursor: "pointer", padding: "4px 0" }}
                    >
                      {isChecked ? <CheckSquare size={16} color="#f47c7c" /> : <Square size={16} color="#cbd5e1" />}
                      <span style={{ color: isChecked ? "#0f172a" : "#64748b", fontWeight: isChecked ? 700 : 500 }}>{m.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Notes / Description</label>
              <textarea 
                value={expenseForm.notes}
                onChange={e => setExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes or memories..."
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "0.875rem", outline: "none", height: "60px", resize: "none" }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button 
                type="button" 
                onClick={() => {
                  setIsAddExpenseOpen(false);
                  setEditingExpense(null);
                }} 
                style={{ flex: 1, padding: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "12px", background: "none", fontSize: "0.875rem", fontWeight: 700, color: "#475569", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={{ flex: 1, padding: "0.75rem", border: "none", borderRadius: "12px", background: "#f47c7c", color: "white", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(244,124,124,0.2)" }}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL 2: SETTLE UP PAYMENT ── */}
      {isSettleOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, animation: "fadeIn 0.2s ease-out" }}>
          <form onSubmit={handleSettlementSubmit} style={{ background: "white", padding: "2.25rem", borderRadius: "24px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Settle Shared Debt</h3>
            
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Who Paid? (Debtor)</label>
              <select 
                value={settlementForm.from_user}
                onChange={e => setSettlementForm(prev => ({ ...prev, from_user: e.target.value }))}
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "0.875rem", outline: "none", background: "white" }}
                required
              >
                <option value="">Select Debtor</option>
                {data.members.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Who Received? (Creditor)</label>
              <select 
                value={settlementForm.to_user}
                onChange={e => setSettlementForm(prev => ({ ...prev, to_user: e.target.value }))}
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "0.875rem", outline: "none", background: "white" }}
                required
              >
                <option value="">Select Creditor</option>
                {data.members.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Amount Settled (₹)</label>
              <input 
                type="number"
                value={settlementForm.amount}
                onChange={e => setSettlementForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "0.875rem", outline: "none" }}
                required
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button 
                type="button" 
                onClick={() => setIsSettleOpen(false)} 
                style={{ flex: 1, padding: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "12px", background: "none", fontSize: "0.875rem", fontWeight: 700, color: "#475569", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={{ flex: 1, padding: "0.75rem", border: "none", borderRadius: "12px", background: "#10b981", color: "white", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(16,185,129,0.2)" }}
              >
                Confirm Settle
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL 3: ADD MEMBER ── */}
      {isAddMemberOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, animation: "fadeIn 0.2s ease-out" }}>
          <form onSubmit={handleMemberSubmit} style={{ background: "white", padding: "2.25rem", borderRadius: "24px", width: "100%", maxWidth: "360px", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Add Group Buddy</h3>
            
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Buddy Name</label>
              <input 
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
                placeholder="e.g. Amit Patil"
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "0.875rem", outline: "none" }}
                required
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button 
                type="button" 
                onClick={() => setIsAddMemberOpen(false)} 
                style={{ flex: 1, padding: "0.75rem", border: "1px solid #cbd5e1", borderRadius: "12px", background: "none", fontSize: "0.875rem", fontWeight: 700, color: "#475569", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={{ flex: 1, padding: "0.75rem", border: "none", borderRadius: "12px", background: "#f47c7c", color: "white", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(244,124,124,0.2)" }}
              >
                Add Buddy
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

    </div>
  );
}
