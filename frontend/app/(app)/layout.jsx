"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Bot, MessageSquare, X, Send, Calendar, Users, Clock, Sparkles } from "lucide-react";
import api from "@/lib/api";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/trips", label: "My Trips" },
  { href: "/search", label: "Explore" },
  { href: "/group-expenses", label: "Group Expenses" },
  { href: "/chat", label: "AI Assistant" },
];

const TRAVEL_SUGGESTIONS = [
  "Boutique hotels in Goa with sea views",
  "Budget stays in Ratnagiri near beach",
  "Best local food spots in Mumbai",
];

function formatMessage(content) {
  return content
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>")
    .replace(/\|(.+)\|/g, '<span style="font-family:monospace">|$1|</span>');
}

function getDemoTravelResponse(message) {
  const query = message.toLowerCase();
  if (query.includes("goa") || query.includes("sea")) {
    return "**Top sea-view boutique hotels in Goa:**\n\n1. **Ahilya by the Sea (Nerul)** - Stunning infinity pool and private villas right by the dolphin-watching bay (approx ₹12,000/night).\n2. **Elsewhere (Mandrem)** - Hidden heritage beach houses nestled under coconut trees, offering unmatched peace and raw luxury.\n3. **Amalia (Anjuna)** - A chic, restored Portuguese villa style hotel close to the beach cafes and active nightlife.\n\n💡 *Tip: Book at least 3 months in advance for peak season (December - January).*";
  }
  if (query.includes("ratnagiri") || query.includes("beach")) {
    return "**Recommended budget stays in Ratnagiri:**\n\n1. **Kohinoor Samudra Beach Resort** - Offers premium views of the Arabian Sea at very reasonable pricing (approx ₹3,500/night).\n2. **Ratnagiri Residency** - Clean, cozy rooms right near the local markets and main travel routes (approx ₹2,000/night).\n3. **Shoreline Homestay (Ganpatipule)** - A authentic beachside homestay offering fresh Konkani home-cooked seafood and absolute peace.\n\n💡 *Tip: Try the local Konkan cuisine and fresh Alphonso mangoes if visiting between March and June.*";
  }
  if (query.includes("mumbai") || query.includes("food")) {
    return "**Iconic food spots in Mumbai:**\n\n- **Britannia & Co. (Ballard Estate)** - World-famous Berry Pulav and Caramel Custard.\n- **Elco Pani Puri Centre (Bandra)** - The absolute gold standard for clean and mouth-watering street food.\n- **Prithvi Cafe (Juhu)** - Irish Coffee, cutting chai, and excellent stuffed parathas under the trees.\n- **Bademiya (Colaba)** - Legendary midnight seekh kebabs and rumali rotis.\n\n💡 *Tip: Travel by local train outside rush hours (11 AM to 4 PM) to explore safely.*";
  }
  return `**Here are some tailored AI travel suggestions for you:**\n\nStart by deciding your budget and style. I recommend picking 2-3 main attractions per day so you don't feel rushed, using local transport to save money, and trying traditional food at local spots. Let me know if you want detailed itineraries for any city!`;
}

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState({ full_name: "Traveler" });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your **Traveloop AI Travel Assistant**.\n\nAsk me anything about your travel destinations, budget optimization, or local gems!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (chatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatOpen, isTyping]);

  const sendChatMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setMessages((current) => [
      ...current,
      { id: Date.now().toString(), role: "user", content: trimmed }
    ]);
    setInput("");
    setIsTyping(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const data = token === "demo_token"
        ? { response: getDemoTravelResponse(trimmed) }
        : await api.ai.chat({
            session_id: sessionId,
            user_message: trimmed,
            trip_id: null,
          });

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}_assistant`,
          role: "assistant",
          content: data.response || "Sorry, I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      console.error("Widget chat error:", error);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}_error`,
          role: "assistant",
          content: getDemoTravelResponse(trimmed),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
      setUser(JSON.parse(localStorage.getItem("user") || '{"full_name":"Traveler","email":""}'));
      const token = localStorage.getItem("access_token");
      if (!token) router.push("/auth");
    });
  }, [router]);

  const logout = () => {
    localStorage.clear();
    router.push("/auth");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Top Navigation */}
      <nav style={{ background: "#f47c7c", padding: "0 2rem", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(244, 124, 124, 0.3)" }}>
        <Link href="/dashboard" style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>✈️ Traveloop</Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href}
                style={{
                  color: active ? "white" : "rgba(255, 255, 255, 0.9)",
                  background: active ? "rgba(255, 255, 255, 0.2)" : "transparent",
                  textDecoration: "none", padding: "0.5rem 1rem", borderRadius: "0.375rem",
                  fontSize: "0.875rem", fontWeight: 500, transition: "all 0.2s"
                }}>
                {label}
              </Link>
            );
          })}
        </div>

        {/* User menu */}
        <div style={{ position: "relative" }}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ 
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: "transparent", border: "none", cursor: "pointer",
              color: "white", fontSize: "0.875rem"
            }}
          >
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: "0.875rem",
            }}>
              {mounted ? (user.full_name?.[0]?.toUpperCase() || "U") : "T"}
            </div>
            <span style={{ opacity: 0.9 }}>{mounted ? user.full_name : "Traveler"}</span>
          </button>

          {dropdownOpen && (
            <div style={{
              position: "absolute", top: "100%", right: 0, marginTop: "0.5rem",
              background: "white", borderRadius: "0.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: "1px solid #e5e7eb", minWidth: "200px", padding: "0.5rem 0",
              display: "flex", flexDirection: "column", zIndex: 1000
            }}>
              <div style={{ padding: "0.5rem 1rem", borderBottom: "1px solid #e5e7eb", marginBottom: "0.5rem" }}>
                <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.875rem" }}>{user.full_name}</div>
                <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>{user.email || "user@example.com"}</div>
              </div>
              
              <Link href="/profile" onClick={() => setDropdownOpen(false)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", color: "#374151", textDecoration: "none", fontSize: "0.875rem" }}>
                ⚙️ Settings
              </Link>
              <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", color: "#374151", background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer", fontSize: "0.875rem" }}>
                🔌 Connectors
              </button>
              <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", color: "#374151", background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer", fontSize: "0.875rem" }}>
                ✅ Tasks
              </button>
              <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", color: "#374151", background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer", fontSize: "0.875rem" }}>
                📁 Files
              </button>
              <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", color: "#374151", background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer", fontSize: "0.875rem", justifyContent: "space-between" }}>
                <span>🆘 Help</span> <span style={{ color: "#9ca3af" }}>&gt;</span>
              </button>
              <div style={{ height: "1px", background: "#e5e7eb", margin: "0.5rem 0" }} />
              <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", color: "#374151", background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer", fontSize: "0.875rem" }}>
                🚀 Upgrade plan
              </button>
              <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", color: "#dc2626", background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer", fontSize: "0.875rem" }}>
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <main>{children}</main>

      {/* Floating Chat Button */}
      {mounted && (
        <button
          onClick={() => setChatOpen(!chatOpen)}
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #f47c7c, #ef4444)",
            color: "white",
            border: "none",
            boxShadow: "0 8px 32px rgba(244,124,124,0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: chatOpen ? "rotate(90deg) scale(0.9)" : "scale(1)",
          }}
          title="Ask AI Assistant"
        >
          {chatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      )}

      {/* Floating TripAdvisor-style Sidebar Chatbot */}
      {mounted && (
        <div
          style={{
            position: "fixed",
            top: "56px",
            right: 0,
            bottom: 0,
            width: "380px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            boxShadow: chatOpen ? "-10px 0 40px rgba(0, 0, 0, 0.15)" : "none",
            borderLeft: "1px solid rgba(229, 231, 235, 0.8)",
            zIndex: 9998,
            display: "flex",
            flexDirection: "column",
            transform: chatOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "1.25rem",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "white",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#f47c7c",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, color: "#111827", fontSize: "0.95rem", margin: 0 }}>AI Assistant</h3>
                <span style={{ fontSize: "0.7rem", color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} /> Active
                </span>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}
            >
              <X size={18} />
            </button>
          </div>

          {/* TripAdvisor Heading / Header Welcome */}
          <div style={{ padding: "1.25rem", background: "linear-gradient(to bottom, #fff, #f9fafb)", borderBottom: "1px solid #f3f4f6" }}>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#111827", marginBottom: "0.25rem", lineHeight: 1.2 }}>
              Hi {user.full_name?.split(" ")[0] || "Traveler"},<br />{"let's plan your next trip"}
            </h2>
            <p style={{ fontSize: "0.775rem", color: "#6b7280", marginBottom: "1rem" }}>
              Get recommendations tailored just for you
            </p>

            {/* TripAdvisor Quick Actions */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => sendChatMessage("Help me plan my travel dates")}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.5rem",
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                <Calendar size={14} color="#f47c7c" /> Dates
              </button>
              <button
                onClick={() => sendChatMessage("Suggest recommendations based on group size")}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.5rem",
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                <Users size={14} color="#3b82f6" /> Travelers
              </button>
              <button
                onClick={() => sendChatMessage("Show my recent searches and history")}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.5rem",
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                <Clock size={14} color="#10b981" /> Recents
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              background: "#f9fafb",
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                style={{ display: "flex", justifyContent: message.role === "user" ? "flex-end" : "flex-start" }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "0.75rem 1rem",
                    borderRadius: message.role === "user" ? "1.25rem 1.25rem 0 1.25rem" : "1.25rem 1.25rem 1.25rem 0",
                    background: message.role === "user" ? "#f47c7c" : "white",
                    color: message.role === "user" ? "white" : "#1f2937",
                    fontSize: "0.825rem",
                    lineHeight: 1.5,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    border: message.role === "user" ? "none" : "1px solid rgba(229, 231, 235, 0.5)",
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#9ca3af", fontSize: "0.75rem", paddingLeft: "0.5rem" }}>
                <Sparkles size={12} className="animate-spin" /> Thinking...
              </div>
            )}
            <div ref={chatBottomRef} />

            {/* TripAdvisor-style Suggestion List at bottom of history */}
            {messages.length === 1 && (
              <div style={{ marginTop: "1rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", marginBottom: "0.5rem" }}>Or ask anything</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                  {TRAVEL_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendChatMessage(suggestion)}
                      style={{
                        textAlign: "left",
                        padding: "0.625rem 0.875rem",
                        background: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "0.75rem",
                        color: "#4b5563",
                        cursor: "pointer",
                        lineHeight: 1.3,
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.borderColor = "#d1d5db"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
                    >
                      <span>{suggestion}</span>
                      <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TripAdvisor Floating input bar */}
          <div style={{ padding: "1rem", borderTop: "1px solid #e5e7eb", background: "white" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#f3f4f6",
                borderRadius: "9999px",
                padding: "0.25rem 0.5rem 0.25rem 1rem",
                border: "1px solid #e5e7eb",
              }}
            >
              <input
                type="text"
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChatMessage(input)}
                disabled={isTyping}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  fontSize: "0.825rem",
                  color: "#1f2937",
                  padding: "0.5rem 0",
                }}
              />
              <button
                onClick={() => sendChatMessage(input)}
                disabled={!input.trim() || isTyping}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: input.trim() ? "#f47c7c" : "#d1d5db",
                  color: "white",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: input.trim() ? "pointer" : "default",
                  transition: "all 0.2s",
                }}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
