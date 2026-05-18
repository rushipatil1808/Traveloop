"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Share2, ArrowLeft, MapPin, CheckCircle2, Circle, Clock, Plane, Calendar, Wallet, Check, ArrowRight, PlusCircle } from "lucide-react";
import api from "@/lib/api";
import { Toast, Spinner, Card } from "./components";
import ExpenseTracker from "./ExpenseTracker";
import AIRecommendations from "./AIRecommendations";

export default function TravelJourneyPlanner() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeStopId, setActiveStopId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchTrip = useCallback(async () => {
    try {
      const data = await api.trips.get(params.id);
      setTrip(data);
      if (data.stops?.length > 0 && !activeStopId) {
        setActiveStopId(data.stops[0].id);
      }
    } catch (err) { setError(err.message || "Failed to load trip"); }
    finally { setLoading(false); }
  }, [params.id, activeStopId]);

  // eslint-disable-next-line
  useEffect(() => { fetchTrip(); }, [fetchTrip]);

  if (loading) return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"6rem",gap:"1rem" }}>
      <Spinner size={40} />
      <p style={{ color:"#6b7280" }}>Loading your travel journey...</p>
    </div>
  );

  if (error || !trip) return (
    <div style={{ maxWidth:"40rem",margin:"4rem auto",padding:"2rem",textAlign:"center" }}>
      <h2 style={{ fontSize:"1.25rem",fontWeight:700,color:"#1f2937",marginBottom:"0.5rem" }}>Journey not found</h2>
      <p style={{ color:"#6b7280",marginBottom:"1.5rem" }}>{error}</p>
      <button onClick={() => router.push("/trips")} className="btn btn-coral"><ArrowLeft size={16} /> Back to My Trips</button>
    </div>
  );

  const activeStop = trip.stops?.find(s => s.id === activeStopId) || trip.stops?.[0];
  const activeStopIndex = trip.stops?.findIndex(s => s.id === activeStopId) || 0;
  const nextStop = trip.stops?.[activeStopIndex + 1];



  return (
    <div style={{ minHeight:"100vh", background:"#fafafa", padding:"2rem 1.5rem", fontFamily:"system-ui, -apple-system, sans-serif" }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        
        {/* SECTION 1: Trip Header */}
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"3rem",flexWrap:"wrap",gap:"1rem" }}>
          <div>
            <button onClick={() => router.push("/trips")} style={{ display:"flex",alignItems:"center",gap:"0.5rem",background:"none",border:"none",color:"#6b7280",cursor:"pointer",fontSize:"0.875rem",marginBottom:"1rem",fontWeight:500,padding:0 }}>
              <ArrowLeft size={16} /> Back to Trips
            </button>
            <h1 style={{ fontSize:"2.25rem",fontWeight:800,color:"#111827",marginBottom:"0.5rem",letterSpacing:"-0.02em" }}>{trip.name}</h1>
            <div style={{ display:"flex",gap:"1.25rem",alignItems:"center",flexWrap:"wrap",color:"#4b5563",fontSize:"0.875rem" }}>
              <span style={{ display:"flex",alignItems:"center",gap:6 }}><Calendar size={16} color="#f47c7c"/> {trip.start_date || "Start"} — {trip.end_date || "End"}</span>
              <span style={{ display:"flex",alignItems:"center",gap:6 }}><Wallet size={16} color="#f47c7c"/> ₹{(trip.total_budget || 0).toLocaleString()}</span>
              <span style={{ padding:"0.25rem 0.75rem",borderRadius:9999,background:"#fee2e2",color:"#b91c1c",fontWeight:600,textTransform:"capitalize",fontSize:"0.75rem" }}>{trip.travel_style || "Travel"}</span>
            </div>
          </div>
          <button onClick={async () => {
            try { const { share_token } = await api.trips.share(trip.id); navigator.clipboard.writeText(`${window.location.origin}/share/${share_token}`); showToast("Share link copied!"); } catch { showToast("Share failed", "error"); }
          }} style={{ display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.625rem 1.25rem",background:"white",border:"1px solid #d1d5db",borderRadius:"9999px",fontSize:"0.875rem",fontWeight:600,cursor:"pointer",boxShadow:"0 1px 2px rgba(0,0,0,0.05)",color:"#374151",transition:"all 0.2s" }}
          onMouseOver={e=>e.currentTarget.style.background="#f9fafb"} onMouseOut={e=>e.currentTarget.style.background="white"}>
            <Share2 size={16} /> Share Journey
          </button>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"3fr 7fr",gap:"3rem" }}>
          
          {/* SECTION 2: Journey Timeline */}
          <div style={{ display:"flex",flexDirection:"column",paddingRight:"1rem" }}>
            <h2 style={{ fontSize:"1rem",fontWeight:700,color:"#111827",marginBottom:"1.5rem",textTransform:"uppercase",letterSpacing:"0.05em" }}>Your Journey</h2>
            
            <div style={{ position:"relative" }}>
              {/* Vertical connecting line */}
              <div style={{ position:"absolute",left:"15px",top:"10px",bottom:"10px",width:"2px",background:"#e5e7eb",zIndex:0 }} />

              {trip.stops?.length === 0 && <p style={{ color:"#9ea3ac",fontSize:"0.875rem",padding:"1rem 0" }}>No destinations added.</p>}
              
              {trip.stops?.map((stop, i) => {
                const isActive = activeStopId === stop.id;
                const isCompleted = stop.city_completed;
                return (
                  <div key={stop.id} onClick={() => setActiveStopId(stop.id)}
                    style={{ position:"relative",display:"flex",gap:"1.25rem",marginBottom:"2rem",cursor:"pointer",zIndex:1,opacity: isActive ? 1 : 0.6,transition:"all 0.2s" }}>
                    
                    <div style={{ 
                      width:"32px",height:"32px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                      background: isCompleted ? "#10b981" : (isActive ? "#f47c7c" : "white"),
                      border: isCompleted || isActive ? "none" : "2px solid #d1d5db",
                      color:"white",boxShadow: isActive ? "0 0 0 4px #fee2e2" : "none"
                    }}>
                      {isCompleted ? <Check size={16} strokeWidth={3}/> : <MapPin size={16} color={isActive?"white":"#9ca3af"}/>}
                    </div>
                    
                    <div style={{ paddingTop:"4px" }}>
                      <h3 style={{ fontSize:"1.125rem",fontWeight:700,color:"#111827",marginBottom:"0.25rem" }}>{stop.city_name}</h3>
                      <p style={{ fontSize:"0.8125rem",color:"#6b7280",display:"flex",alignItems:"center",gap:6 }}><Clock size={12}/> Days {i*2 + 1} - {i*2 + 2}</p>
                    </div>
                  </div>
                );
              })}
              
              {/* Add Destination Inline */}
              <div style={{ position:"relative",display:"flex",gap:"1.25rem",marginTop:"1rem",zIndex:1 }}>
                <div style={{ width:"32px",height:"32px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:"#f3f4f6",border:"2px dashed #d1d5db" }}>
                  <PlusCircle size={16} color="#9ca3af"/>
                </div>
                <div style={{ flex:1,paddingTop:"4px" }}>
                  {!toast?.message?.includes("Adding destination") ? (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const val = e.target.city.value.trim();
                      if(!val) return;
                      showToast("Adding destination & AI tips...", "success");
                      try {
                        await api.tripStops.create(trip.id, { city_name: val, country: "Unknown", order_index: trip.stops?.length || 0 });
                        e.target.reset();
                        fetchTrip();
                      } catch(err) { showToast(err.message, "error"); }
                    }}>
                      <input name="city" placeholder="Add next stop..." style={{ width:"100%",padding:"0.5rem 0",border:"none",background:"transparent",borderBottom:"1px solid #d1d5db",fontSize:"0.875rem",outline:"none",fontWeight:600 }} />
                    </form>
                  ) : (
                    <p style={{ fontSize:"0.875rem",color:"#6b7280",fontStyle:"italic" }}>Adding...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: City Experience Card */}
          <div style={{ display:"flex",flexDirection:"column",gap:"2rem" }}>
            {activeStop ? (
              <>
                <div style={{ borderBottom:"2px solid #f3f4f6",paddingBottom:"1.5rem",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1rem" }}>
                  <div>
                    <h2 style={{ fontSize:"2rem",fontWeight:800,color:"#111827",marginBottom:"0.5rem" }}>Exploring {activeStop.city_name}</h2>
                    <p style={{ fontSize:"1rem",color:"#6b7280" }}>Your customized travel experience and plans.</p>
                  </div>
                  
                  {/* Premium Done Toggle */}
                  <button 
                    onClick={async () => {
                      try {
                        const newStatus = !activeStop.city_completed;
                        await api.tripStops.saveChecklist(trip.id, activeStop.id, { 
                          checklist_items: activeStop.checklist_items || [], 
                          completed: newStatus 
                        });
                        showToast(newStatus ? `${activeStop.city_name} Completed!` : "Reopened destination", "success");
                        fetchTrip();
                      } catch (err) {
                        showToast("Failed to update status", "error");
                      }
                    }}
                    style={{
                      display:"flex",
                      alignItems:"center",
                      gap:6,
                      fontSize:"0.875rem",
                      fontWeight:700,
                      padding:"0.5rem 1.25rem",
                      borderRadius:9999,
                      background: activeStop.city_completed ? "#d1fae5" : "white",
                      color: activeStop.city_completed ? "#065f46" : "#374151",
                      border: activeStop.city_completed ? "none" : "1px solid #d1d5db",
                      cursor:"pointer",
                      transition: "all 0.2s",
                      boxShadow:"0 1px 2px rgba(0,0,0,0.05)"
                    }}
                  >
                    {activeStop.city_completed ? <Check size={16} strokeWidth={3}/> : <Check size={16} strokeWidth={2}/>}
                    {activeStop.city_completed ? "Completed!" : "Mark Completed"}
                  </button>
                </div>

                <div style={{ display:"grid",gridTemplateColumns:"1fr",gap:"2rem" }}>
                  {/* SECTION 4: AI Smart Recommendations */}
                  <AIRecommendations tripId={trip.id} stop={activeStop} />

                  {/* SECTION 5: Expense Tracker */}
                  <div style={{ marginBottom:"2rem" }}>
                    <h3 style={{ fontSize:"1.125rem",fontWeight:700,color:"#111827",marginBottom:"1rem" }}>City Expenses</h3>
                    <ExpenseTracker tripId={trip.id} trip={{...trip, stops:[activeStop]}} />
                  </div>
                </div>

                {/* SECTION 8: Next Destination Experience */}
                {activeStop.city_completed && nextStop && (
                  <Card style={{ background:"#111827",color:"white",padding:"2rem",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                    <div>
                      <p style={{ fontSize:"0.875rem",color:"#9ca3af",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.5rem" }}>Next Up</p>
                      <h3 style={{ fontSize:"1.5rem",fontWeight:800,marginBottom:"0.5rem" }}>Ready for {nextStop.city_name}?</h3>
                      <p style={{ fontSize:"0.875rem",color:"#d1d5db",display:"flex",alignItems:"center",gap:8 }}><Plane size={14}/> Travel time: ~2 hrs. Book your tickets now.</p>
                    </div>
                    <button onClick={() => { window.scrollTo({top:0,behavior:'smooth'}); setActiveStopId(nextStop.id); }} style={{ display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.75rem 1.5rem",background:"white",color:"#111827",border:"none",borderRadius:"9999px",fontSize:"0.875rem",fontWeight:700,cursor:"pointer" }}>
                      Continue Journey <ArrowRight size={16}/>
                    </button>
                  </Card>
                )}
              </>
            ) : (
              <div style={{ textAlign:"center",padding:"4rem 0",color:"#9ca3af" }}>
                <MapPin size={48} style={{ margin:"0 auto 1rem",opacity:0.5 }}/>
                <p style={{ fontSize:"1.125rem" }}>Select a destination from your journey to explore.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @media (max-width: 1024px) {
          .tabs { overflow-x: auto; white-space: nowrap; }
          .grid-col-3, .grid-col-9 { grid-column: span 1 !important; }
        }
      `}</style>
    </div>
  );
}
