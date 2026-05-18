"use client";
import { useState, useEffect } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { SectionLabel, Card, CategoryBadge } from "./components";
import api from "@/lib/api";

export default function ExpenseTracker({ tripId, trip }) {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ total_amount: 0, by_city: {}, by_category: {} });
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title:"", amount:"", category:"Food", city:trip?.stops?.[0]?.city_name || "Other" });

  const fetchExpenses = async () => {
    try {
      const data = await api.expenses.list(tripId);
      setExpenses(data.expenses || []);
      setSummary({ total_amount: data.total_amount || 0, by_city: data.by_city || {}, by_category: data.by_category || {} });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line
  useEffect(() => { fetchExpenses(); }, [tripId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.expenses.create(tripId, { ...formData, amount: parseFloat(formData.amount) });
      setIsAdding(false);
      setFormData({ title:"", amount:"", category:"Food", city:formData.city });
      fetchExpenses();
    } catch (err) { console.error(err); setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.expenses.delete(id);
      fetchExpenses();
    } catch (err) { console.error(err); }
  };

  const categories = ["Food", "Hotel", "Transport", "Activities", "Shopping", "Misc"];
  const cities = trip?.stops?.map(s => s.city_name) || ["Other"];

  return (
    <Card>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem" }}>
        <SectionLabel>Expense Tracker</SectionLabel>
        <button onClick={()=>setIsAdding(!isAdding)}
          style={{ display:"flex",alignItems:"center",gap:4,fontSize:"0.75rem",fontWeight:700,padding:"0.25rem 0.625rem",borderRadius:9999,background:"#d1fae5",color:"#065f46",border:"none",cursor:"pointer" }}>
          <PlusCircle size={14}/> Add Expense
        </button>
      </div>

      <div style={{ display:"flex",gap:"1rem",marginBottom:"1rem",padding:"1rem",background:"#f8f9fa",borderRadius:"0.5rem",border:"1px solid #e4e6ea" }}>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:"0.75rem",color:"#6b7280",fontWeight:600 }}>Total Expenses</p>
          <p style={{ fontSize:"1.5rem",fontWeight:800,color:"#1f2937" }}>₹{summary.total_amount.toLocaleString()}</p>
        </div>
        {trip?.total_budget > 0 && (
          <div style={{ flex:1,textAlign:"right" }}>
            <p style={{ fontSize:"0.75rem",color:"#6b7280",fontWeight:600 }}>Remaining Budget</p>
            <p style={{ fontSize:"1.5rem",fontWeight:800,color:(trip.total_budget - summary.total_amount) >= 0 ? "#34d399" : "#ef4444" }}>
              ₹{(trip.total_budget - summary.total_amount).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} style={{ marginBottom:"1rem",padding:"0.75rem",background:"#fff",borderRadius:"0.5rem",border:"1.5px solid #f47c7c" }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem",marginBottom:"0.5rem" }}>
            <input required placeholder="Expense title" value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} style={{ gridColumn:"span 2",padding:"0.375rem",borderRadius:"0.25rem",border:"1px solid #d0d3d8",fontSize:"0.875rem" }} />
            <input required type="number" placeholder="Amount (₹)" value={formData.amount} onChange={e=>setFormData({...formData,amount:e.target.value})} style={{ padding:"0.375rem",borderRadius:"0.25rem",border:"1px solid #d0d3d8",fontSize:"0.875rem" }} />
            <select value={formData.category} onChange={e=>setFormData({...formData,category:e.target.value})} style={{ padding:"0.375rem",borderRadius:"0.25rem",border:"1px solid #d0d3d8",fontSize:"0.875rem" }}>
              {categories.map(c=><option key={c}>{c}</option>)}
            </select>
            <select value={formData.city} onChange={e=>setFormData({...formData,city:e.target.value})} style={{ gridColumn:"span 2",padding:"0.375rem",borderRadius:"0.25rem",border:"1px solid #d0d3d8",fontSize:"0.875rem" }}>
              {cities.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display:"flex",justifyContent:"flex-end",gap:"0.5rem" }}>
            <button type="button" onClick={()=>setIsAdding(false)} style={{ padding:"0.25rem 0.75rem",fontSize:"0.75rem",borderRadius:"0.25rem",background:"white",border:"1px solid #d0d3d8",cursor:"pointer" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding:"0.25rem 0.75rem",fontSize:"0.75rem",borderRadius:"0.25rem",background:"#065f46",color:"white",border:"none",cursor:"pointer" }}>{loading?"Saving...":"Save"}</button>
          </div>
        </form>
      )}

      {loading && !isAdding ? (
        <p style={{ textAlign:"center",fontSize:"0.875rem",color:"#9ea3ac",padding:"1rem" }}>Loading expenses...</p>
      ) : expenses.length === 0 ? (
        <p style={{ textAlign:"center",fontSize:"0.875rem",color:"#9ea3ac",padding:"1rem" }}>No expenses recorded yet.</p>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:"0.5rem" }}>
          {expenses.map(exp => (
            <div key={exp.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.75rem",background:"white",borderRadius:"0.5rem",border:"1px solid #e4e6ea" }}>
              <div>
                <p style={{ fontWeight:600,fontSize:"0.875rem",color:"#1f2937" }}>{exp.title}</p>
                <div style={{ display:"flex",gap:"0.5rem",marginTop:2,alignItems:"center" }}>
                  <CategoryBadge label={exp.category} />
                  <span style={{ fontSize:"0.7rem",color:"#9ea3ac" }}>{exp.city}</span>
                </div>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:"0.75rem" }}>
                <p style={{ fontWeight:800,fontSize:"1rem",color:"#1f2937" }}>₹{exp.amount.toLocaleString()}</p>
                <button onClick={()=>handleDelete(exp.id)} style={{ background:"none",border:"none",cursor:"pointer",color:"#f47c7c",padding:4 }}><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
