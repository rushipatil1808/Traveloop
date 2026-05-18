"use client";
import { useState } from "react";
import { Sparkles, MapPin } from "lucide-react";
import { Card } from "./components";
import api from "@/lib/api";

export default function AIRecommendations({ tripId, stop }) {
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState(stop.ai_recommendations || []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.ai.generateItinerary({
        destinations: [stop.city_name],
        duration_days: 1,
        budget: 5000,
      });
      const newRecs = res.recommendations || [
        `Visit local heritage sites in ${stop.city_name} around sunset.`,
        `Try authentic street food near the main square.`,
        `Book transport early as peak hours get crowded.`
      ];
      setRecs(newRecs);
      await api.tripStops.saveAiRecommendations(tripId, stop.id, newRecs);
    } catch(err) { console.error(err); }
    setLoading(false);
  };

  return (
    <Card style={{ background:"#fefce8",border:"1px solid #fef08a" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem" }}>
        <h3 style={{ color:"#a16207",fontSize:"0.875rem",fontWeight:700,display:"flex",alignItems:"center",gap:6 }}>
          <Sparkles size={16} color="#eab308"/> AI Smart Insights
        </h3>
        <button onClick={generate} disabled={loading}
          style={{ fontSize:"0.75rem",fontWeight:600,padding:"0.25rem 0.75rem",borderRadius:9999,background:"white",color:"#ca8a04",border:"1px solid #fde047",cursor:"pointer" }}>
          {loading ? "Thinking..." : "Generate Insights"}
        </button>
      </div>
      
      {recs.length === 0 ? (
        <div style={{ textAlign:"center",padding:"1.5rem 1rem" }}>
          <p style={{ fontSize:"0.875rem",color:"#a16207",marginBottom:"0.75rem" }}>Unlock AI-powered local tips and hidden gems.</p>
          {!loading && <button onClick={generate} style={{ fontSize:"0.875rem",fontWeight:600,padding:"0.5rem 1.25rem",borderRadius:9999,background:"#eab308",color:"white",border:"none",cursor:"pointer" }}>Discover Now</button>}
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:"0.75rem" }}>
          {recs.map((r,i)=>(
            <div key={i} style={{ display:"flex",gap:"0.5rem",alignItems:"flex-start",padding:"0.75rem",background:"white",borderRadius:"0.5rem",boxShadow:"0 1px 2px rgba(0,0,0,0.05)" }}>
              <MapPin size={14} color="#eab308" style={{ marginTop:2,flexShrink:0 }}/>
              <p style={{ fontSize:"0.875rem",color:"#4b5563",lineHeight:1.4 }}>{r}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
