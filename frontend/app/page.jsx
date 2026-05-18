import Link from "next/link";

const FEATURES = [
  {
    icon: "🗺️",
    title: "Multi-City Itineraries",
    desc: "Plan complete day-by-day itineraries across multiple cities with activities, schedules, and travel tips.",
  },
  {
    icon: "💰",
    title: "AI Budget Prediction",
    desc: "Use machine learning to predict trip costs by destination, style, and group size with confidence intervals.",
  },
  {
    icon: "🤖",
    title: "AI Travel Assistant",
    desc: "Chat with your personal AI travel advisor powered by Claude to get destination tips and plan adjustments.",
  },
  {
    icon: "🔍",
    title: "Smart Destination Search",
    desc: "Search destinations with natural language — 'peaceful beach under ₹30K' finds the right places for you.",
  },
  {
    icon: "✅",
    title: "Packing Checklists",
    desc: "AI-generated packing lists based on your destination, duration, and travel style. Never forget essentials.",
  },
  {
    icon: "🌐",
    title: "Share Itineraries",
    desc: "Generate a public link to share your trip plan with friends, family, or the travel community.",
  },
];

const DESTINATIONS = [
  {
    name: "Paris",
    country: "France",
    cost: "₹1.2L / 7 days",
    img: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80",
    tag: "Romantic",
  },
  {
    name: "Bali",
    country: "Indonesia",
    cost: "₹45K / 5 days",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80",
    tag: "Beach",
  },
  {
    name: "Tokyo",
    country: "Japan",
    cost: "₹2L / 10 days",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80",
    tag: "Culture",
  },
  {
    name: "Ladakh",
    country: "India",
    cost: "₹35K / 7 days",
    img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80",
    tag: "Adventure",
  },
];

export default function LandingPage() {
  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh" }}>
      {/* ── Top Navigation ── */}
      <nav style={{ background: "#f47c7c", padding: "0 2rem", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(244, 124, 124, 0.3)" }}>
        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          ✈️ Traveloop
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <a href="#features" style={{ color: "white", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>Features</a>
          <a href="#destinations" style={{ color: "white", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>Destinations</a>
          <Link href="/auth?tab=login" style={{ color: "white", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}>Login</Link>
          <Link href="/auth?tab=signup"
            style={{
              background: "white",
              color: "#f47c7c",
              padding: "0.4rem 1.25rem",
              borderRadius: "9999px",
              fontWeight: 600,
              fontSize: "0.875rem",
              textDecoration: "none",
              marginLeft: "0.5rem",
            }}>
            Sign Up
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <div style={{
        position: "relative",
        height: "500px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <img
          src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1400&q=80"
          alt="Travel"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(244,124,124,0.7) 0%, rgba(30,40,60,0.6) 100%)",
        }} />
        <div style={{ position: "relative", textAlign: "center", color: "white", padding: "0 1.5rem" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "1rem", lineHeight: 1.2 }}>
            Plan Your Perfect Trip<br />Like Never Before
          </h1>
          <p style={{ fontSize: "1.125rem", opacity: 0.9, marginBottom: "2rem", maxWidth: "540px", margin: "0 auto 2rem" }}>
            AI-powered travel planning — create multi-city itineraries, predict budgets,
            and explore destinations with your personal travel assistant.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth?tab=signup"
              style={{
                background: "white",
                color: "#f47c7c",
                padding: "0.875rem 2.5rem",
                borderRadius: "9999px",
                fontWeight: 700,
                fontSize: "1rem",
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              }}>
              Sign Up Now
            </Link>
            <Link href="/auth?tab=login"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "white",
                padding: "0.875rem 2.5rem",
                borderRadius: "9999px",
                fontWeight: 600,
                fontSize: "1rem",
                textDecoration: "none",
                border: "2px solid rgba(255,255,255,0.5)",
              }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* ── Features Section ── */}
      <div id="features" style={{ background: "white", padding: "4rem 0" }}>
        <div className="page-container" style={{ padding: "0 1.5rem" }}>
          <h2 style={{ textAlign: "center", fontSize: "1.875rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.5rem" }}>
            Everything You Need to Travel Smarter
          </h2>
          <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "3rem", fontSize: "1rem" }}>
            Traveloop combines AI, machine learning, and smart design to make trip planning effortless.
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
          }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ textAlign: "center", padding: "1.5rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{f.icon}</div>
                <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.5rem" }}>
                  {f.title}
                </h3>
                <p style={{ color: "#6b7280", fontSize: "0.9rem", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Popular Destinations ── */}
      <div id="destinations" style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.5rem" }}>
          Popular Destinations
        </h2>
        <p style={{ color: "#4b5563", marginBottom: "2rem", fontSize: "1rem", fontWeight: 500 }}>
          Explore curated destinations with AI-powered insights and budget estimates
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
        }}>
          {DESTINATIONS.map((d) => (
            <div key={d.name} className="img-card">
              <img src={d.img} alt={d.name} />
              <div className="img-card-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.375rem" }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#1f2937" }}>{d.name}</h3>
                    <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>{d.country}</p>
                  </div>
                  <span className="badge badge-coral">{d.tag}</span>
                </div>
                <p style={{ fontSize: "0.875rem", color: "#374151", fontWeight: 500 }}>{d.cost}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ background: "#f47c7c", padding: "3.5rem 1.5rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "white", marginBottom: "0.75rem" }}>
          Ready to Plan Your Dream Trip?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: "2rem", fontSize: "1rem" }}>
          Join thousands of travelers using Traveloop to plan smarter, travel better.
        </p>
        <Link href="/auth?tab=signup"
          style={{
            background: "white",
            color: "#f47c7c",
            padding: "0.875rem 2.5rem",
            borderRadius: "9999px",
            fontWeight: 700,
            fontSize: "1rem",
            textDecoration: "none",
          }}>
          Get Started for Free
        </Link>
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: "#1f2937", color: "rgba(255,255,255,0.6)", padding: "1.5rem", textAlign: "center", fontSize: "0.8rem" }}>
        © 2026 Traveloop — Wander Smart, Plan Smarter. Powered by AI.
      </footer>
    </div>
  );
}
