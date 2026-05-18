"use client";
import { useState } from "react";
import api from "@/lib/api";

export default function ProfilePage() {
  const user = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user") || '{"full_name":"Alex Traveler","email":"traveler@traveloop.ai"}')
    : { full_name: "Alex Traveler", email: "traveler@traveloop.ai" };

  const [form, setForm] = useState({ full_name: user.full_name || "", email: user.email || "", language: "en" });
  const [saved, setSaved] = useState(false);
  const [passForm, setPassForm] = useState({ current_password: "", new_password: "" });
  const [loadingPass, setLoadingPass] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("user", JSON.stringify({ ...user, ...form }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoadingPass(true);
    setPassError("");
    setPassSuccess(false);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Not authenticated");
      await api.user.changePassword(passForm);
      setPassSuccess(true);
      setPassForm({ current_password: "", new_password: "" });
    } catch (err) {
      setPassError(err.message);
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: "760px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937", marginBottom: "1.5rem" }}>
        My Profile
      </h1>

      {saved && <div className="alert alert-success">✅ Profile saved successfully!</div>}

      {/* Profile Card */}
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "50%",
            background: "#f47c7c", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "2rem", fontWeight: 700, color: "white",
          }}>
            {form.full_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "#1f2937" }}>{form.full_name}</h2>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>{form.email}</p>
            <span className="badge badge-coral" style={{ marginTop: "0.375rem" }}>Traveler</span>
          </div>
        </div>
        <div className="divider" />
        <form onSubmit={handleSave}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Language</label>
              <select className="form-select" value={form.language}
                onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ja">Japanese</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-coral">Save Changes</button>
        </form>
      </div>

      {/* Travel Stats */}
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#1f2937", marginBottom: "1.25rem" }}>Travel Statistics</h3>
        <table className="data-table">
          <thead><tr><th>Metric</th><th>Value</th></tr></thead>
          <tbody>
            {[
              ["Total Trips Planned", "3"],
              ["Cities Visited", "8"],
              ["Countries Explored", "3"],
              ["Total Travel Days", "27"],
              ["Budget Managed", "₹2,90,000"],
              ["AI Chats", "12"],
            ].map(([k, v]) => (
              <tr key={k}>
                <td style={{ color: "#374151" }}>{k}</td>
                <td style={{ fontWeight: 600, color: "#f47c7c" }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Security / Password */}
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#1f2937", marginBottom: "1.25rem" }}>Security</h3>
        <form onSubmit={handlePasswordChange}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" value={passForm.current_password}
                onChange={e => setPassForm(f => ({ ...f, current_password: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={passForm.new_password}
                onChange={e => setPassForm(f => ({ ...f, new_password: e.target.value }))} required />
            </div>
          </div>
          <button type="submit" className="btn" style={{ background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", marginTop: "1rem" }} disabled={loadingPass}>
            {loadingPass ? "Updating..." : "Update Password"}
          </button>
          {passError && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.5rem" }}>{passError}</p>}
          {passSuccess && <p style={{ color: "#059669", fontSize: "0.875rem", marginTop: "0.5rem" }}>Password updated successfully!</p>}
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ border: "1.5px solid #fecaca" }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#dc2626", marginBottom: "0.5rem" }}>Danger Zone</h3>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
          These actions are permanent and cannot be undone.
        </p>
        <button className="btn" style={{ background: "#fee2e2", color: "#dc2626", border: "1.5px solid #fecaca" }}>
          Delete Account
        </button>
      </div>
    </div>
  );
}
