"use client";
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { SectionLabel, Card, ActivityRow, Spinner } from "./components";
import api from "@/lib/api";

const CITY_EXAMPLES = {
  mumbai: ["Gateway of India", "Marine Drive Sunset", "Juhu Beach", "Try Vada Pav"],
  goa: ["Baga Beach Sunset", "Dudhsagar Waterfalls", "Old Goa Churches", "Scuba Diving"],
  delhi: ["Red Fort Visit", "India Gate Walk", "Chandni Chowk Tour", "Qutub Minar"],
  jaipur: ["Hawa Mahal", "Amber Fort Tour", "Chokhi Dhani Dinner", "Bapu Bazaar"],
  kerala: ["Alleppey Backwaters", "Munnar Tea Gardens", "Kathakali Show", "Fort Kochi Walk"],
  ahamdabad: ["Sabarmati Ashram", "Adalaj Stepwell", "Kankaria Lake", "Gujarati Thali"],
  pune: ["Shaniwar Wada", "Aga Khan Palace", "Dagdusheth Temple", "FC Road Food"]
};

export default function DailyItinerary({ tripId, stop, onUpdate }) {
  const activities = stop.direct_activities || [];
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name:"", time:"09:00", duration:60, cost:0, category:"Sightseeing" });

  const cityName = stop.city_name?.toLowerCase() || "";
  const cityKey = Object.keys(CITY_EXAMPLES).find(k => cityName.includes(k));
  const examples = cityKey 
    ? CITY_EXAMPLES[cityKey] 
    : [`Explore ${stop.city_name}`, `Local Food`, `Famous Landmark`];

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.tripStops.addActivity(tripId, stop.id, formData);
      onUpdate();
      setIsAdding(false);
      setFormData({ name:"", time:"09:00", duration:60, cost:0, category:"Sightseeing" });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (act) => {
    try {
      await api.tripStops.deleteActivity(tripId, stop.id, act.id);
      onUpdate();
    } catch (err) { console.error(err); }
  };

  return (
    <Card>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem" }}>
        <SectionLabel>Daily Itinerary — {stop.city_name}</SectionLabel>
        <button onClick={()=>setIsAdding(!isAdding)}
          style={{ display:"flex",alignItems:"center",gap:4,fontSize:"0.75rem",fontWeight:700,padding:"0.25rem 0.625rem",borderRadius:9999,background:"#ffe0df",color:"#d44d44",border:"none",cursor:"pointer" }}>
          <PlusCircle size={14}/> Add
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} style={{ marginBottom:"1rem",padding:"0.75rem",background:"#f8f9fa",borderRadius:"0.5rem",border:"1px solid #e4e6ea" }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem",marginBottom:"0.5rem" }}>
            <input required placeholder={examples.length > 0 ? `e.g. ${examples[0]}` : "Activity name"} value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} style={{ gridColumn:"span 2",padding:"0.375rem",borderRadius:"0.25rem",border:"1px solid #d0d3d8",fontSize:"0.875rem" }} />
            
            {/* Dynamic Examples Chips */}
            <div style={{ gridColumn:"span 2", display:"flex", gap:"0.375rem", flexWrap:"wrap", marginTop:"0.125rem", marginBottom:"0.25rem", alignItems:"center" }}>
              <span style={{ fontSize:"0.7rem", color:"#9ca3af", marginRight:"0.25rem" }}>Try:</span>
              {examples.map(ex => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setFormData({ ...formData, name: ex })}
                  style={{
                    fontSize: "0.7rem",
                    background: "white",
                    border: "1px solid #d1d5db",
                    borderRadius: "9999px",
                    padding: "0.2rem 0.5rem",
                    cursor: "pointer",
                    color: "#4b5563",
                    transition: "all 0.15s ease",
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#f47c7c"; e.currentTarget.style.borderColor = "#fca5a5"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#4b5563"; e.currentTarget.style.borderColor = "#d1d5db"; }}
                >
                  {ex}
                </button>
              ))}
            </div>

            <input type="time" required value={formData.time} onChange={e=>setFormData({...formData,time:e.target.value})} style={{ padding:"0.375rem",borderRadius:"0.25rem",border:"1px solid #d0d3d8",fontSize:"0.875rem" }} />
            <select value={formData.category} onChange={e=>setFormData({...formData,category:e.target.value})} style={{ padding:"0.375rem",borderRadius:"0.25rem",border:"1px solid #d0d3d8",fontSize:"0.875rem" }}>
              {["Sightseeing","Food","Hotel","Transport","Adventure","Shopping"].map(c=><option key={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Cost (₹)" value={formData.cost || ""} onChange={e=>setFormData({...formData,cost:e.target.value})} style={{ padding:"0.375rem",borderRadius:"0.25rem",border:"1px solid #d0d3d8",fontSize:"0.875rem" }} />
            <input type="number" placeholder="Duration (min)" value={formData.duration || ""} onChange={e=>setFormData({...formData,duration:e.target.value})} style={{ padding:"0.375rem",borderRadius:"0.25rem",border:"1px solid #d0d3d8",fontSize:"0.875rem" }} />
          </div>
          <div style={{ display:"flex",justifyContent:"flex-end",gap:"0.5rem" }}>
            <button type="button" onClick={()=>setIsAdding(false)} style={{ padding:"0.25rem 0.75rem",fontSize:"0.75rem",borderRadius:"0.25rem",background:"white",border:"1px solid #d0d3d8",cursor:"pointer" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding:"0.25rem 0.75rem",fontSize:"0.75rem",borderRadius:"0.25rem",background:"#f47c7c",color:"white",border:"none",cursor:"pointer" }}>{loading?"Saving...":"Save"}</button>
          </div>
        </form>
      )}

      {activities.length === 0 ? (
        <p style={{ textAlign:"center",fontSize:"0.875rem",color:"#9ea3ac",padding:"1rem 0" }}>No activities added for {stop.city_name} yet.</p>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:"0.5rem" }}>
          {activities.sort((a,b)=>a.time.localeCompare(b.time)).map(act => (
            <ActivityRow key={act.id} act={act} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </Card>
  );
}
