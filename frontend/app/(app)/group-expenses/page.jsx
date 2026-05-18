"use client";
import { useState, useEffect, useCallback } from "react";
import { Coins, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { Toast, Spinner, Card } from "../trips/[id]/components";
import GroupExpenses from "../trips/[id]/GroupExpenses";

export default function GroupExpensesDashboard() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.trips.list();
      setTrips(res || []);
      
      // Auto-select first trip if available
      if (res && res.length > 0) {
        setSelectedTrip(res[0]);
      }
    } catch (err) {
      showToast("Error loading trips", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTrips();
  }, [fetchTrips]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: "1rem" }}>
        <Spinner size="large" />
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Loading your shared dashboards...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", padding: "2rem 1.5rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 850, color: "#0f172a", letterSpacing: "-0.02em", margin: 0 }}>
              Group Expenses 💸
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.9375rem", marginTop: "0.25rem", margin: 0 }}>
              Split costs, track bills, and settle trip balances with friends.
            </p>
          </div>

          {/* Premium Trip Selector Dropdown */}
          {trips.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "white", padding: "0.5rem 1rem", borderRadius: "9999px", border: "1px solid #cbd5e1", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Active Trip:</span>
              <select
                value={selectedTrip?.id || ""}
                onChange={(e) => {
                  const tripId = parseInt(e.target.value);
                  const chosen = trips.find((t) => t.id === tripId);
                  if (chosen) setSelectedTrip(chosen);
                }}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  cursor: "pointer",
                  paddingRight: "0.5rem"
                }}
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.destination || "Custom Stop"})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Dynamic Display Area */}
        {trips.length === 0 ? (
          <Card style={{ padding: "4rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", color: "#f47c7c" }}>
              <Coins size={32} />
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>No Active Trips Found</h2>
            <p style={{ color: "#64748b", fontSize: "0.875rem", maxWidth: "340px", margin: 0 }}>
              You need an active journey planner to start logging shared group expenses. Plan a trip now to begin!
            </p>
            <button
              onClick={() => window.location.href = "/dashboard"}
              style={{
                marginTop: "0.5rem",
                background: "#f47c7c",
                color: "white",
                border: "none",
                borderRadius: "9999px",
                padding: "0.625rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 750,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(244,124,124,0.2)"
              }}
            >
              Start Planning Trip
            </button>
          </Card>
        ) : selectedTrip ? (
          <GroupExpenses
            tripId={selectedTrip.id}
            trip={selectedTrip}
            onToast={(msg, type) => showToast(msg, type || "success")}
          />
        ) : (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#94a3b8" }}>
            <AlertCircle size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
            <p style={{ fontSize: "1rem" }}>Please select a trip from the header to load its expenses.</p>
          </div>
        )}

      </div>
    </div>
  );
}
