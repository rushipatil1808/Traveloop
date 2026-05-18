"use client";
import { useState, useCallback } from "react";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { ProgressBar, SectionLabel, Card } from "./components";
import api from "@/lib/api";

const DEFAULT_TASKS = {
  Mumbai: ["Visit Gateway of India","Marine Drive Sunset","Juhu Beach","Try Local Street Food","Siddhivinayak Temple"],
  Goa: ["Baga Beach","Dudhsagar Falls","Old Goa Churches","Night Market","Water Sports"],
  Delhi: ["Red Fort","India Gate","Qutub Minar","Chandni Chowk Food Tour","Humayun Tomb"],
  Jaipur: ["Hawa Mahal","Amber Fort","City Palace","Jantar Mantar","Local Bazaar Shopping"],
  Kerala: ["Alleppey Backwaters","Munnar Tea Gardens","Kochi Fort","Kathakali Show","Elephant Sanctuary"],
};

function getDefaultTasks(city) {
  const key = Object.keys(DEFAULT_TASKS).find(k => city?.toLowerCase().includes(k.toLowerCase()));
  if (key) return DEFAULT_TASKS[key].map((t,i) => ({ id:i+1, text:t, done:false }));
  return [`Explore ${city}`, `Local food in ${city}`, `Famous landmarks in ${city}`, `Shopping in ${city}`, `Hidden gems of ${city}`]
    .map((t,i) => ({ id:i+1, text:t, done:false }));
}

const EMPTY_ARRAY = [];

export default function CityChecklist({ tripId, stop, onCityComplete }) {
  const saved = stop.checklist_items || EMPTY_ARRAY;
  const savedStr = JSON.stringify(saved);
  const [prevStopId, setPrevStopId] = useState(stop.id);
  const [prevSavedStr, setPrevSavedStr] = useState(savedStr);
  const [items, setItems] = useState(() => saved.length ? saved : getDefaultTasks(stop.city_name));

  if (stop.id !== prevStopId || savedStr !== prevSavedStr) {
    setPrevStopId(stop.id);
    setPrevSavedStr(savedStr);
    setItems(saved.length ? saved : getDefaultTasks(stop.city_name));
  }

  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const completed = items.filter(i => i.done).length;
  const pct = items.length ? Math.round((completed / items.length) * 100) : 0;
  const allDone = pct === 100;

  const toggle = async (id) => {
    const next = items.map(i => i.id === id ? { ...i, done: !i.done } : i);
    setItems(next);
    setSaving(true);
    try {
      await api.tripStops.saveChecklist(tripId, stop.id, {
        checklist_items: next,
        completed: next.every(i => i.done),
      });
    } catch {}
    setSaving(false);
  };

  const generateAI = async () => {
    setGenerating(true);
    try {
      const res = await api.ai.generateItinerary({
        destinations: [stop.city_name],
        duration_days: 2,
        budget: 5000,
        travel_style: "cultural",
        group_type: "couple",
        group_size: 2,
      });
      const acts = res.itinerary?.[0]?.days?.[0]?.activities || [];
      if (acts.length) {
        const next = acts.slice(0,6).map((a,i) => ({ id:Date.now()+i, text:a.name, done:false }));
        setItems(next);
        await api.tripStops.saveChecklist(tripId, stop.id, { checklist_items: next, completed: false });
      }
    } catch {}
    setGenerating(false);
  };

  return (
    <Card>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem" }}>
        <SectionLabel>Checklist — {stop.city_name}</SectionLabel>
        <button onClick={generateAI} disabled={generating}
          style={{ display:"flex",alignItems:"center",gap:4,fontSize:"0.7rem",fontWeight:700,padding:"0.25rem 0.625rem",borderRadius:9999,background:"#fef3c7",color:"#b45309",border:"1px solid #fcd34d",cursor:"pointer" }}>
          <Sparkles size={11}/>{generating ? "..." : "AI Generate"}
        </button>
      </div>
      <ProgressBar value={completed} max={items.length} color={allDone ? "#34d399" : "#f47c7c"} />
      <p style={{ fontSize:"0.75rem",color:"#6b7280",margin:"0.5rem 0 0.75rem" }}>
        {completed}/{items.length} done · {pct}%
        {saving && <span style={{ marginLeft:8,color:"#9ea3ac" }}>saving…</span>}
      </p>
      <div style={{ display:"flex",flexDirection:"column",gap:"0.5rem" }}>
        {items.map(item => (
          <button key={item.id} onClick={() => toggle(item.id)}
            style={{ display:"flex",alignItems:"center",gap:"0.625rem",background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0 }}>
            {item.done
              ? <CheckCircle2 size={18} style={{ color:"#34d399",flexShrink:0 }}/>
              : <Circle size={18} style={{ color:"#d0d3d8",flexShrink:0 }}/>}
            <span style={{ fontSize:"0.875rem",color: item.done ? "#9ea3ac" : "#374151",textDecoration: item.done ? "line-through" : "none" }}>
              {item.text}
            </span>
          </button>
        ))}
      </div>
      {allDone && (
        <div style={{ marginTop:"1rem",padding:"0.75rem",borderRadius:"0.5rem",background:"#d1fae5",border:"1px solid #6ee7b7",textAlign:"center" }}>
          <p style={{ color:"#065f46",fontWeight:700,fontSize:"0.875rem" }}>✅ {stop.city_name} Completed!</p>
          {onCityComplete && (
            <button onClick={onCityComplete}
              style={{ marginTop:"0.5rem",fontSize:"0.75rem",fontWeight:700,padding:"0.375rem 1rem",borderRadius:9999,background:"#f47c7c",color:"white",border:"none",cursor:"pointer" }}>
              Ready to move to next destination? →
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
