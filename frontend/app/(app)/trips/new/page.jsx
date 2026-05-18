"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Sparkles, MapPin, Plus, X, Check } from "lucide-react";
import api from "@/lib/api";

const TRAVEL_STYLES = [
  { id: "adventure", label: "Adventure", emoji: "🧗", desc: "Hiking, rafting, extreme sports" },
  { id: "relaxation", label: "Relaxation", emoji: "🧘", desc: "Spas, beaches, peaceful retreats" },
  { id: "cultural", label: "Cultural", emoji: "🏛️", desc: "Museums, history, local experiences" },
  { id: "foodie", label: "Foodie", emoji: "🍜", desc: "Street food, fine dining, cooking classes" },
  { id: "budget", label: "Budget", emoji: "💰", desc: "Maximum value, hostels, local transport" },
];

const GROUP_TYPES = [
  { id: "solo", label: "Solo", emoji: "🧍" },
  { id: "couple", label: "Couple", emoji: "👫" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧" },
  { id: "friends", label: "Friends", emoji: "👥" },
];

const STEPS = ["Trip Details", "Destinations", "Travel Style"];

const inputStyle = {
  width: "100%", padding: "0.625rem 0.875rem", borderRadius: "0.375rem",
  border: "1.5px solid #d0d3d8", fontSize: "0.875rem", color: "#1f2937",
  background: "white", outline: "none"
};

const labelStyle = {
  display: "block", color: "#374151", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem"
};

export default function NewTripPage() {
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    description: "",
    cities: [],
    cityInput: "",
    travel_style: "",
    group_type: "couple",
    group_size: 2,
    total_budget: "",
    currency: "INR",
  });

  const addCity = () => {
    if (form.cityInput.trim() && !form.cities.includes(form.cityInput.trim())) {
      setForm(f => ({ ...f, cities: [...f.cities, f.cityInput.trim()], cityInput: "" }));
    }
  };

  const removeCity = (city) => {
    setForm(f => ({ ...f, cities: f.cities.filter(c => c !== city) }));
  };

  const handleAIGenerate = async () => {
    if (!form.name || !form.start_date || !form.end_date || form.cities.length === 0 || !form.travel_style) {
      alert("Please fill in trip name, dates, at least one destination, and travel style before generating.");
      return;
    }
    setGenerating(true);
    try {
      const days = Math.max(1, Math.ceil(
        (new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) / 86400000
      ));

      // 1. Create the trip in MongoDB first
      const newTrip = {
        name: form.name,
        start_date: form.start_date,
        end_date: form.end_date,
        destinations: form.cities,
        travel_style: form.travel_style,
        group_type: form.group_type,
        group_size: form.group_size,
        status: "planning",
        total_budget: parseFloat(form.total_budget) || 0,
        description: form.description,
        currency: form.currency,
      };
      const created = await api.trips.create(newTrip);

      // 2. Generate AI itinerary
      const itinerary = await api.ai.generateItinerary({
        destinations: form.cities,
        duration_days: days,
        budget: parseFloat(form.total_budget) || 50000,
        currency: form.currency,
        travel_style: form.travel_style,
        group_type: form.group_type,
        group_size: form.group_size,
      });

      // 3. Save AI suggestions back to the trip
      if (itinerary?.recommendations?.length) {
        await api.trips.update(created.id, {
          ai_suggestions: itinerary.recommendations,
        });
      }

      router.push(`/trips/${created.id}`);
    } catch (err) {
      console.error("Error generating itinerary:", err);
      alert("Failed to generate itinerary: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const canNext = [
    form.name && form.start_date && form.end_date,
    form.cities.length > 0,
    form.travel_style,
  ][step];

  return (
    <div style={{ maxWidth: "42rem", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#1f2937", marginBottom: "0.25rem" }}>Plan New Trip</h1>
        <p style={{ color: "#6b7280" }}>Let&apos;s create your perfect adventure</p>
      </div>

      {/* Step progress */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
            <div style={{
              display: "flex", height: "2rem", width: "2rem", alignItems: "center", justifyContent: "center",
              borderRadius: "50%", fontSize: "0.875rem", fontWeight: 700,
              background: i < step ? "#34d399" : i === step ? "#f47c7c" : "#e4e6ea",
              color: i <= step ? "white" : "#9ea3ac"
            }}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: i === step ? "#1f2937" : "#9ea3ac", display: "block" }}>{s}</span>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: "2px", background: i < step ? "#34d399" : "#e4e6ea" }} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div style={{ background: "white", padding: "2rem", borderRadius: "0.75rem", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={labelStyle}>Trip Name *</label>
                <input id="trip-name" type="text" placeholder="e.g. Golden Triangle Adventure"
                  style={inputStyle} value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Start Date *</label>
                  <input id="start-date" type="date" style={inputStyle} value={form.start_date}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>End Date *</label>
                  <input id="end-date" type="date" style={inputStyle} value={form.end_date}
                    onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Budget</label>
                  <input id="budget" type="number" placeholder="50000" style={inputStyle} value={form.total_budget}
                    onChange={e => setForm(f => ({ ...f, total_budget: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Currency</label>
                  <select id="currency" style={inputStyle} value={form.currency}
                    onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                    <option value="INR">INR ₹</option>
                    <option value="USD">USD $</option>
                    <option value="EUR">EUR €</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea id="description" placeholder="What do you want from this trip?" rows={3}
                  style={{ ...inputStyle, resize: "none" }} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={labelStyle}>Add Cities / Destinations *</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input id="city-input" type="text" placeholder="Type a city and press Add..."
                    style={{ ...inputStyle, flex: 1 }} value={form.cityInput}
                    onChange={e => setForm(f => ({ ...f, cityInput: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && addCity()} />
                  <button onClick={addCity} id="add-city-btn"
                    style={{ background: "#1f2937", color: "white", padding: "0 1.25rem", borderRadius: "0.375rem", border: "none", cursor: "pointer" }}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {form.cities.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Drag to reorder (or remove):</p>
                  {form.cities.map((city, i) => (
                    <motion.div key={city} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #e4e6ea", background: "#f8f9fa" }}>
                      <div style={{ display: "flex", height: "1.5rem", width: "1.5rem", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "#ffe0df", color: "#d44d44", fontSize: "0.75rem", fontWeight: 700 }}>
                        {i + 1}
                      </div>
                      <MapPin className="h-4 w-4" style={{ color: "#9ea3ac" }} />
                      <span style={{ fontWeight: 500, color: "#1f2937", flex: 1 }}>{city}</span>
                      <button onClick={() => removeCity(city)} style={{ background: "none", border: "none", color: "#9ea3ac", cursor: "pointer" }}>
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              <div>
                <label style={labelStyle}>Group Type</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.5rem" }}>
                  {GROUP_TYPES.map(gt => (
                    <button key={gt.id} id={`group-${gt.id}`}
                      onClick={() => setForm(f => ({ ...f, group_type: gt.id }))}
                      style={{
                        padding: "0.75rem", borderRadius: "0.5rem", border: "1.5px solid", cursor: "pointer", background: "white", transition: "all 0.2s",
                        borderColor: form.group_type === gt.id ? "#f47c7c" : "#e4e6ea",
                        background: form.group_type === gt.id ? "#fff5f5" : "white"
                      }}>
                      <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{gt.emoji}</div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 600, color: form.group_type === gt.id ? "#d44d44" : "#6b7280" }}>{gt.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <label style={labelStyle}>Choose Your Travel Style *</label>
              {TRAVEL_STYLES.map(style => (
                <button key={style.id} id={`style-${style.id}`}
                  onClick={() => setForm(f => ({ ...f, travel_style: style.id }))}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderRadius: "0.5rem", border: "1.5px solid", textAlign: "left", cursor: "pointer", transition: "all 0.2s",
                    borderColor: form.travel_style === style.id ? "#f47c7c" : "#e4e6ea",
                    background: form.travel_style === style.id ? "#fff5f5" : "white"
                  }}>
                  <span style={{ fontSize: "1.875rem" }}>{style.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: form.travel_style === style.id ? "#d44d44" : "#1f2937" }}>
                      {style.label}
                    </p>
                    <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>{style.desc}</p>
                  </div>
                  {form.travel_style === style.id && <Check className="h-5 w-5" style={{ color: "#f47c7c" }} />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1.5rem" }}>
        <button onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", borderRadius: "0.375rem", border: "1.5px solid #d0d3d8", background: "white", color: "#374151", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}>
          <ArrowLeft className="h-4 w-4" />
          {step === 0 ? "Cancel" : "Back"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {step === STEPS.length - 1 && (
            <button id="ai-generate-btn" onClick={handleAIGenerate} disabled={generating}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem", borderRadius: "0.375rem", padding: "0.625rem 1.25rem", fontWeight: 600, fontSize: "0.875rem", cursor: generating ? "not-allowed" : "pointer",
                background: "#fef3c7", color: "#b45309", border: "1.5px solid #fde68a"
              }}>
              {generating ? (
                <div style={{ height: "1rem", width: "1rem", border: "2px solid rgba(180, 83, 9, 0.3)", borderTopColor: "#b45309", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              AI Generate ✨
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button id="next-step-btn" onClick={() => setStep(s => s + 1)} disabled={!canNext}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", borderRadius: "0.375rem", border: "none", background: canNext ? "#f47c7c" : "#ffc1be", color: "white", fontWeight: 600, fontSize: "0.875rem", cursor: canNext ? "pointer" : "not-allowed" }}>
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button id="create-trip-btn" onClick={async () => {
              setGenerating(true);
              try {
                const newTrip = {
                  name: form.name,
                  start_date: form.start_date,
                  end_date: form.end_date,
                  destinations: form.cities,
                  travel_style: form.travel_style,
                  group_type: form.group_type,
                  status: "planning",
                  total_budget: parseFloat(form.total_budget) || 0,
                  group_size: form.group_size,
                  description: form.description,
                  currency: form.currency,
                };
                
                // Save to backend
                const created = await api.trips.create(newTrip);
                
                router.push(`/trips/${created.id}`);
              } catch (err) {
                console.error("Error creating trip:", err);
                alert("Failed to create trip: " + err.message);
              } finally {
                setGenerating(false);
              }
            }} disabled={!canNext}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", borderRadius: "0.375rem", border: "none", background: canNext ? "#f47c7c" : "#ffc1be", color: "white", fontWeight: 600, fontSize: "0.875rem", cursor: canNext ? "pointer" : "not-allowed" }}>
              Create Trip <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
