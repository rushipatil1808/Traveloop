"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

const FALLBACK_RECOMMENDATIONS = [
  {
    name: "Goa", tag: "Beach", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=80",
    cost: "₹3K/day", reason: "Perfect for relaxation & nightlife",
  },
  {
    name: "Manali", tag: "Adventure", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80",
    cost: "₹2.8K/day", reason: "Snow peaks & river rafting",
  },
  {
    name: "Kerala", tag: "Nature", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=80",
    cost: "₹2.5K/day", reason: "Backwaters & ayurveda retreats",
  },
  {
    name: "Santorini", tag: "Romantic", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80",
    cost: "₹15K/day", reason: "Iconic sunsets & white villas",
  },
];

const DESTINATION_IMAGES = {
  Goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&q=80",
  Manali: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80",
  Kerala: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&q=80",
  Jaipur: "https://images.unsplash.com/photo-1477584322813-ac72a64c48f9?w=400&q=80",
  Rishikesh: "https://images.unsplash.com/photo-1598977123418-45f04b614133?w=400&q=80",
  Santorini: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&q=80",
};

const getDestinationImage = (dest) => {
  return DESTINATION_IMAGES[dest] || "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&q=80";
};

const STATUS_BADGE = {
  upcoming: { bg: "#dbeafe", text: "#1e40af" },
  planning: { bg: "#fef3c7", text: "#92400e" },
  completed: { bg: "#d1fae5", text: "#065f46" },
};

export default function DashboardPage() {
  const [user, setUser] = useState({ full_name: "Traveler" });
  const [trips, setTrips] = useState([]);
  const [recommendations, setRecommendations] = useState(FALLBACK_RECOMMENDATIONS);
  const [aiLoadingId, setAiLoadingId] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);

  const handleAiClick = (location) => {
    setAiLoadingId(location);
    setTimeout(() => {
      const rec = recommendations.find(r => (r.name || r.destination) === location);
      if (!rec) {
        setAiLoadingId(null);
        return;
      }
      const tag = rec.tag || rec.best_time || "Travel";
      const reason = rec.reason;
      const cost = rec.cost || `₹${(rec.estimated_cost/1000).toFixed(0)}K`;
      setAiInsight({
        location,
        text: `Based on your travel profile, ${location} is a fantastic match! Its ${tag.toLowerCase()} vibes perfectly align with what you enjoy. I recommend planning a 4-5 day itinerary focusing on the ${reason.toLowerCase()} to get the most value out of your ${cost} budget.`
      });
      setAiLoadingId(null);
    }, 1500);
  };

  useEffect(() => {
    let userId = null;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          queueMicrotask(() => {
            setUser(parsed);
          });
          userId = parsed.id;
        } catch (e) {}
      }
    }

    const fetchTrips = async () => {
      try {
        const data = await api.trips.list();
        setTrips(Array.isArray(data) ? data : []);
      } catch (err) {
        // Silently handle backend failure to avoid Next.js dev overlay
        console.warn("Backend unreachable. Showing local trips.", err);
        const local = JSON.parse(localStorage.getItem("local_trips") || "[]");
        setTrips(local);
      }
    };

    const fetchRecommendations = async (uid) => {
      if (!uid) return;
      try {
        const res = await api.ai.recommendations(uid);
        if (res && Array.isArray(res.recommendations) && res.recommendations.length > 0) {
          setRecommendations(res.recommendations);
        }
      } catch (err) {
        console.warn("Could not fetch recommendations, using fallback.", err);
      }
    };

    fetchTrips();
    if (userId) {
      fetchRecommendations(userId);
    }
  }, []);

  // Compute stats dynamically
  const totalTrips = trips.length;
  const citiesVisited = trips.reduce((acc, t) => acc + ((t.cities || t.destinations || []).length), 0);
  const totalBudget = trips.reduce((acc, t) => acc + (t.budget || t.total_budget || 0), 0);
  const totalBudgetFormatted = totalBudget > 100000 ? `₹${(totalBudget/100000).toFixed(1)}L` : `₹${(totalBudget/1000).toFixed(0)}K`;

  const STATS = [
    { label: "Total Trips", value: totalTrips.toString(), icon: "🗺️", color: "#f47c7c" },
    { label: "Cities Visited", value: citiesVisited.toString(), icon: "🏙️", color: "#34d399" },
    { label: "Total Budget Spent", value: totalBudgetFormatted, icon: "💰", color: "#60a5fa" },
    { label: "Days Travelled", value: "-", icon: "📅", color: "#fbbf24" },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Welcome Header */}
      <div style={{
        background: "white",
        borderRadius: "0.5rem",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
      }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.25rem" }}>
            Welcome back, {user.full_name?.split(" ")[0]} 👋
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
            Here&apos;s your travel overview for this year
          </p>
        </div>
        <Link href="/trips/new" style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
          padding: "0.625rem 1.25rem", borderRadius: "0.375rem", fontSize: "0.875rem",
          fontWeight: 600, background: "#f47c7c", color: "white", textDecoration: "none",
          boxShadow: "0 2px 4px rgba(244, 124, 124, 0.3)"
        }}>
          + Plan New Trip
        </Link>
      </div>

      {/* Stats Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem",
      }}>
        {STATS.map((s) => (
          <div key={s.label} style={{
            background: "white", borderRadius: "0.5rem", padding: "1.25rem 1.5rem",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", borderLeft: "4px solid", borderLeftColor: s.color
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.75rem" }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937", lineHeight: 1, marginBottom: "0.25rem" }}>{s.value}</div>
                <div style={{ fontSize: "0.8125rem", color: "#6b7280", fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}
        className="dash-grid">
        {/* My Trips */}
        <div style={{ background: "white", borderRadius: "0.5rem", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e4e6ea", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontWeight: 700, color: "#1f2937", fontSize: "1rem" }}>My Trips</h2>
            <Link href="/trips" style={{ color: "#f47c7c", fontSize: "0.8125rem", textDecoration: "none", fontWeight: 600 }}>
              View All →
            </Link>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", textAlign: "left" }}>
            <thead>
              <tr>
                {["Trip", "Cities", "Status", "Budget"].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", borderBottom: "2px solid #e4e6ea", fontWeight: 600, color: "#374151", background: "#f8f9fa", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trips.length > 0 ? trips.slice(0, 3).map((t) => (
                <tr key={t.id} style={{ cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "0.875rem 1rem", borderBottom: "1px solid #e4e6ea", color: "#1f2937" }}>
                    <div style={{ fontWeight: 600, color: "#1f2937", fontSize: "0.875rem" }}>{t.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#9ea3ac" }}>
                      {t.start_date} → {t.end_date}
                    </div>
                  </td>
                  <td style={{ padding: "0.875rem 1rem", borderBottom: "1px solid #e4e6ea", fontSize: "0.8125rem", color: "#6b7280" }}>{(t.cities || t.destinations || []).join(", ") || "No cities"}</td>
                  <td style={{ padding: "0.875rem 1rem", borderBottom: "1px solid #e4e6ea", color: "#1f2937" }}>
                    <span style={{ padding: "0.25rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, background: STATUS_BADGE[t.status || "planning"]?.bg, color: STATUS_BADGE[t.status || "planning"]?.text, textTransform: "capitalize" }}>
                      {t.status || "Planning"}
                    </span>
                  </td>
                  <td style={{ padding: "0.875rem 1rem", borderBottom: "1px solid #e4e6ea", fontSize: "0.875rem", fontWeight: 600, color: "#1f2937" }}>₹{((t.budget || t.total_budget || 0) / 1000).toFixed(0)}K</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
                    You haven&apos;t created any trips yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div style={{ background: "white", borderRadius: "0.5rem", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", padding: "1.5rem" }}>
          <h2 style={{ fontWeight: 700, color: "#1f2937", fontSize: "1rem", marginBottom: "1.25rem" }}>
            Quick Actions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { href: "/trips/new", icon: "🗺️", label: "Plan a New Trip", desc: "Create multi-city itinerary" },
              { href: "/chat", icon: "🤖", label: "Ask AI Assistant", desc: "Get personalized travel advice" },
              { href: "/search", icon: "🔍", label: "Explore Destinations", desc: "Find your next adventure" },
              { href: "/trips", icon: "✅", label: "Manage Checklists", desc: "Track packing & tasks" },
            ].map((a) => (
              <Link key={a.href} href={a.href}
                style={{
                  display: "flex", alignItems: "center", gap: "0.875rem",
                  padding: "0.875rem", borderRadius: "0.5rem",
                  border: "1.5px solid #e4e6ea", textDecoration: "none",
                  transition: "all 0.2s",
                  background: "white",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#f47c7c"; e.currentTarget.style.background = "#fff5f5"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e4e6ea"; e.currentTarget.style.background = "white"; }}>
                <span style={{ fontSize: "1.5rem" }}>{a.icon}</span>
                <div>
                  <p style={{ fontWeight: 600, color: "#1f2937", fontSize: "0.875rem" }}>{a.label}</p>
                  <p style={{ color: "#9ea3ac", fontSize: "0.775rem" }}>{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div style={{ background: "white", borderRadius: "0.5rem", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", padding: 0, overflow: "hidden", marginBottom: "1.5rem" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e4e6ea", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontWeight: 700, color: "#1f2937", fontSize: "1rem" }}>🤖 AI Recommendations</h2>
            <p style={{ color: "#9ea3ac", fontSize: "0.8rem" }}>Based on your travel style</p>
          </div>
          <Link href="/search" style={{ color: "#f47c7c", fontSize: "0.8125rem", textDecoration: "none", fontWeight: 600 }}>
            Explore More →
          </Link>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 0,
        }}>
          {recommendations.map((r, i) => {
            const name = r.name || r.destination;
            const tag = r.tag || r.best_time || "Travel";
            const cost = r.cost || `₹${(r.estimated_cost/1000).toFixed(0)}K`;
            const reason = r.reason;
            const img = r.img || getDestinationImage(name);
            return (
              <div key={name} onClick={() => handleAiClick(name)} style={{
                borderRight: i < recommendations.length - 1 ? "1px solid #e4e6ea" : "none",
                padding: "1rem",
                cursor: "pointer",
                transition: "background 0.2s",
                background: "white"
              }} onMouseEnter={e => e.currentTarget.style.background = "#fffbeb"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
                <img src={img} alt={name}
                  style={{ width: "100%", height: "130px", objectFit: "cover", borderRadius: "0.375rem", marginBottom: "0.75rem" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: 700, color: "#1f2937", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    {name} {aiLoadingId === name && <span style={{ fontSize: "0.7rem", color: "#f47c7c" }}>Thinking...</span>}
                  </span>
                  <span style={{ padding: "0.25rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, background: "#ffe0df", color: "#d44d44", textTransform: "capitalize" }}>{tag}</span>
                </div>
                <p style={{ fontSize: "0.775rem", color: "#9ea3ac", marginBottom: "0.25rem" }}>{reason}</p>
                <p style={{ fontSize: "0.8125rem", color: "#374151", fontWeight: 600 }}>{cost}</p>
              </div>
            );
          })}
        </div>
      </div>

      {aiInsight && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }} onClick={() => setAiInsight(null)}>
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.75rem", maxWidth: "420px", width: "100%", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              ✨ AI Insight: {aiInsight.location}
            </h3>
            <p style={{ color: "#4b5563", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
              {aiInsight.text}
            </p>
            <button onClick={() => setAiInsight(null)} style={{ width: "100%", padding: "0.75rem", background: "linear-gradient(135deg, #f47c7c, #ff9a9e)", color: "white", border: "none", borderRadius: "0.375rem", fontWeight: 600, cursor: "pointer", fontSize: "0.9375rem" }}>
              Thanks, AI!
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .dash-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
