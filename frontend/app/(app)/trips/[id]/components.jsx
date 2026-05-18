"use client";
import { useEffect } from "react";
import { CheckCircle2, Circle, Clock, Trash2, Edit2 } from "lucide-react";

export function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "success" ? "#d1fae5" : type === "error" ? "#fee2e2" : "#dbeafe";
  const color = type === "success" ? "#065f46" : type === "error" ? "#991b1b" : "#1e40af";
  return (
    <div style={{ position:"fixed",bottom:"1.5rem",right:"1.5rem",zIndex:9999,background:bg,color,borderRadius:"0.5rem",padding:"0.75rem 1.25rem",fontWeight:600,fontSize:"0.875rem",boxShadow:"0 4px 16px rgba(0,0,0,0.15)",maxWidth:"360px" }}>
      {message}
    </div>
  );
}

export function Spinner({ size = 20 }) {
  return (
    <>
      <div style={{ width:size,height:size,border:"2.5px solid #e4e6ea",borderTopColor:"#f47c7c",borderRadius:"50%",animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

export function ProgressBar({ value, max, color = "#f47c7c" }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ height:8,background:"#e4e6ea",borderRadius:9999,overflow:"hidden" }}>
      <div style={{ height:"100%",width:`${pct}%`,background:color,borderRadius:9999,transition:"width 0.4s ease" }} />
    </div>
  );
}

const CAT_COLORS = {
  Food:{ bg:"#fef3c7",text:"#92400e" }, Hotel:{ bg:"#dbeafe",text:"#1e40af" },
  Transport:{ bg:"#f3f4f6",text:"#4b5563" }, Activities:{ bg:"#d1fae5",text:"#065f46" },
  Shopping:{ bg:"#ede9fe",text:"#5b21b6" }, Misc:{ bg:"#ffe4e6",text:"#9f1239" },
  sightseeing:{ bg:"#ccfbf1",text:"#0d9488" }, food:{ bg:"#fef3c7",text:"#d97706" },
  adventure:{ bg:"#ffedd5",text:"#ea580c" }, cultural:{ bg:"#f3e8ff",text:"#9333ea" },
  accommodation:{ bg:"#dbeafe",text:"#2563eb" }, transport:{ bg:"#f3f4f6",text:"#4b5563" },
};

export function CategoryBadge({ label }) {
  const c = CAT_COLORS[label] || { bg:"#f3f4f6",text:"#4b5563" };
  return (
    <span style={{ fontSize:"0.7rem",padding:"0.15rem 0.5rem",borderRadius:9999,background:c.bg,color:c.text,fontWeight:700,textTransform:"capitalize" }}>
      {label}
    </span>
  );
}

export function ActivityRow({ act, onEdit, onDelete }) {
  return (
    <div style={{ display:"flex",gap:"0.75rem",alignItems:"center",padding:"0.625rem 0.75rem",borderRadius:"0.5rem",background:"#f8f9fa",border:"1px solid #e4e6ea" }}>
      <div style={{ minWidth:50,color:"#6b7280",fontSize:"0.75rem",fontWeight:600 }}>{act.time}</div>
      <div style={{ flex:1,minWidth:0 }}>
        <p style={{ fontWeight:600,fontSize:"0.875rem",color:"#1f2937",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{act.name}</p>
        <div style={{ display:"flex",gap:"0.5rem",marginTop:2,flexWrap:"wrap" }}>
          <CategoryBadge label={act.type || act.category} />
          {act.duration && <span style={{ fontSize:"0.7rem",color:"#9ea3ac" }}>{act.duration}min</span>}
        </div>
      </div>
      <div style={{ textAlign:"right",flexShrink:0 }}>
        <p style={{ fontWeight:700,fontSize:"0.875rem",color:"#374151" }}>₹{(act.cost||0).toLocaleString()}</p>
      </div>
      {onEdit && <button onClick={()=>onEdit(act)} style={{ background:"none",border:"none",cursor:"pointer",color:"#6b7280",padding:4 }}><Edit2 size={13}/></button>}
      {onDelete && <button onClick={()=>onDelete(act)} style={{ background:"none",border:"none",cursor:"pointer",color:"#f47c7c",padding:4 }}><Trash2 size={13}/></button>}
    </div>
  );
}

export function SectionLabel({ children }) {
  return <h2 style={{ color:"#6b7280",fontSize:"0.7rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"0.75rem" }}>{children}</h2>;
}

export function Card({ children, style }) {
  return <div style={{ background:"white",borderRadius:"0.75rem",boxShadow:"0 2px 8px rgba(0,0,0,0.08)",padding:"1rem",...style }}>{children}</div>;
}

export function CircularProgress({ value, size = 60, strokeWidth = 6, color = "#f47c7c" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="#e4e6ea" strokeWidth={strokeWidth} fill="none"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", fontWeight: 700, color: "#1f2937" }}>
        {value}%
      </div>
    </div>
  );
}
