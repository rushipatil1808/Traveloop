"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

function AuthContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(() => searchParams.get("tab") === "signup" ? "signup" : "login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "signup") {
      queueMicrotask(() => setTab("signup"));
    } else if (t === "login") {
      queueMicrotask(() => setTab("login"));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = form.email.trim();
    const password = form.password.trim();
    const fullName = form.full_name.trim();

    if (!email || !password || (tab === "signup" && !fullName)) {
      setError(tab === "signup" ? "Please enter your name, email, and password." : "Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const data = tab === "login" 
        ? await api.auth.login(email, password)
        : await api.auth.register(email, fullName, password);
      
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = (type = 'demo') => {
    localStorage.setItem("access_token", "demo_token");
    localStorage.setItem("user", JSON.stringify({
      id: type === 'google' ? "google-1" : "demo-1", 
      email: type === 'google' ? "user@gmail.com" : "traveler@traveloop.ai", 
      full_name: type === 'google' ? "Google User" : "Alex Traveler",
    }));
    router.push("/dashboard");
  };

  const handleGoogleLogin = async () => {
    const email = window.prompt("Enter Gmail address for demo:", "explorer@gmail.com");
    if (!email) return;

    setLoading(true);
    setError("");
    try {
      const fakeGoogleProfile = {
        email: email,
        full_name: email.split('@')[0],
        google_id: "google_" + btoa(email)
      };

      const data = await api.auth.google(fakeGoogleProfile);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      console.warn("Google auth failed, using local demo login.", err);
      demoLogin('google');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Top Nav */}
      <nav style={{ background: "#f47c7c", padding: "0 2rem", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(244, 124, 124, 0.3)" }}>
        <Link href="/" style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>✈️ Traveloop</Link>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => { setTab("login"); setError(""); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "white", padding: "0.4rem 1.25rem", fontSize: "0.875rem", fontWeight: 500 }}>
            Sign In
          </button>
          <button onClick={() => { setTab("signup"); setError(""); }}
            style={{
              background: "white", color: "#f47c7c", padding: "0.4rem 1.25rem",
              borderRadius: "9999px", fontWeight: 600, fontSize: "0.875rem",
              border: "none", cursor: "pointer",
            }}>
            Register
          </button>
        </div>
      </nav>

      <div style={{
        display: "flex", minHeight: "calc(100vh - 56px)",
      }}>
        {/* LEFT — travel image panel (hidden on mobile) */}
        <div style={{
          flex: 1,
          backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          padding: "2rem",
        }}
          className="hidden-mobile">
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(244,124,124,0.8) 0%, rgba(0,0,0,0.2) 100%)",
          }} />
          <div style={{ position: "relative", color: "white" }}>
            <p style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Your next adventure<br />starts here 🌍
            </p>
            <p style={{ opacity: 0.85, fontSize: "0.9rem" }}>
              AI-powered travel planning for every explorer
            </p>
          </div>
        </div>

        {/* RIGHT — form */}
        <div style={{
          width: "100%",
          maxWidth: "460px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#f0f2f5",
        }}>
          <div style={{ width: "100%", maxWidth: "380px" }}>
            {/* Card */}
            <div className="card" style={{ padding: "2rem" }}>
              <h2 style={{
                fontSize: "1.5rem", fontWeight: 700, color: "#1f2937",
                textAlign: "center", marginBottom: "0.25rem",
              }}>
                {tab === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p style={{ textAlign: "center", color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
                {tab === "login" ? "Sign in to your Traveloop account" : "Start planning your perfect trip"}
              </p>

              {/* Tab switcher */}
              <div style={{
                display: "flex", border: "1.5px solid #e4e6ea",
                borderRadius: "0.5rem", overflow: "hidden", marginBottom: "1.5rem",
              }}>
                {["login", "signup"].map((t) => (
                  <button key={t}
                    onClick={() => { setTab(t); setError(""); }}
                    style={{
                      flex: 1, padding: "0.625rem",
                      fontSize: "0.875rem", fontWeight: 600,
                      border: "none", cursor: "pointer",
                      background: tab === t ? "#f47c7c" : "white",
                      color: tab === t ? "white" : "#6b7280",
                      transition: "all 0.2s",
                    }}>
                    {t === "login" ? "Sign In" : "Register"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                {tab === "signup" && (
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.375rem" }}>Full Name</label>
                    <input type="text" placeholder="Enter your full name" required
                      value={form.full_name}
                      onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                      style={{ width: "100%", padding: "0.625rem 0.875rem", border: "1.5px solid #d0d3d8", borderRadius: "0.375rem", fontSize: "0.875rem", color: "#1f2937", background: "white", outline: "none" }} />
                  </div>
                )}

                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.375rem" }}>Email Address</label>
                  <input type="email" placeholder="Enter your email" required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={{ width: "100%", padding: "0.625rem 0.875rem", border: "1.5px solid #d0d3d8", borderRadius: "0.375rem", fontSize: "0.875rem", color: "#1f2937", background: "white", outline: "none" }} />
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.375rem" }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPass ? "text" : "password"}
                      placeholder="Enter your password" required
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      style={{ width: "100%", padding: "0.625rem 2.5rem 0.625rem 0.875rem", border: "1.5px solid #d0d3d8", borderRadius: "0.375rem", fontSize: "0.875rem", color: "#1f2937", background: "white", outline: "none" }} />
                    <button type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{
                        position: "absolute", right: "0.75rem", top: "50%",
                        transform: "translateY(-50%)", background: "none",
                        border: "none", cursor: "pointer", color: "#6b7280",
                        fontSize: "0.8rem", fontWeight: 600,
                      }}>
                      {showPass ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {error && <div style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", padding: "0.75rem 1rem", borderRadius: "0.375rem", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</div>}

                <button type="submit" disabled={loading}
                  style={{ width: "100%", padding: "0.75rem", fontSize: "0.9375rem", marginBottom: "1rem", background: "#f47c7c", color: "white", border: "none", borderRadius: "0.375rem", fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 4px rgba(244, 124, 124, 0.3)" }}>
                  {loading ? "Please wait..." : (tab === "login" ? "Sign In" : "Create Account")}
                </button>
              </form>

              <div style={{
                display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem",
              }}>
                <div style={{ flex: 1, height: "1px", background: "#e4e6ea" }} />
                <span style={{ fontSize: "0.8rem", color: "#9ea3ac" }}>or</span>
                <div style={{ flex: 1, height: "1px", background: "#e4e6ea" }} />
              </div>

              <button onClick={() => demoLogin('demo')}
                style={{ width: "100%", padding: "0.75rem", fontSize: "0.9rem", background: "#eef2ff", color: "#4f46e5", border: "1.5px solid #e0e7ff", borderRadius: "0.375rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                🚀 Try Demo Version
              </button>

              <button onClick={handleGoogleLogin} disabled={loading}
                style={{ width: "100%", padding: "0.75rem", fontSize: "0.9375rem", background: "white", color: "#374151", border: "1.5px solid #d0d3d8", borderRadius: "9999px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>

              <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "#9ea3ac", marginTop: "1.25rem" }}>
                {tab === "login" ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => { setTab(tab === "login" ? "signup" : "login"); setError(""); }}
                  style={{
                    color: "#f47c7c", fontWeight: 600, background: "none",
                    border: "none", cursor: "pointer",
                  }}>
                  {tab === "login" ? "Register" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
        @media (min-width: 769px) { .hidden-mobile { display: flex !important; } }
      `}</style>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
