"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, RefreshCcw, Send } from "lucide-react";
import api from "@/lib/api";

const QUICK_PROMPTS = [
  "Best budget destinations in India under Rs 3K/day?",
  "Plan a 7-day itinerary for Bali",
  "What should I pack for a mountain trip?",
  "How to get a visa for Japan?",
];

const INITIAL_MESSAGES = [
  {
    id: "welcome",
    role: "assistant",
    content: "Hello! I'm your **Traveloop AI Travel Assistant**.\n\nI can help you plan itineraries, compare budgets, prepare packing lists, and answer travel questions.",
    time: "",
  },
];

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatMessage(content) {
  return content
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>")
    .replace(/\|(.+)\|/g, '<span style="font-family:monospace">|$1|</span>');
}

function getDemoTravelResponse(message) {
  const query = message.toLowerCase();

  if (query.includes("budget") || query.includes("3k") || query.includes("cheap")) {
    return "**Good budget picks in India under Rs 3K/day:**\n\n- Rishikesh: hostels, rafting, cafes, and local buses can fit Rs 1.5K-3K/day.\n- Varanasi: affordable stays, street food, ghats, and temples around Rs 1.5K-2.5K/day.\n- Jaipur: budget hotels, forts, markets, and thalis around Rs 2K-3K/day.\n- McLeod Ganj: mountain cafes, treks, monasteries, and hostels around Rs 2K-3K/day.\n\nTo stay under budget, choose hostels or homestays, use trains/buses, eat local, and book weekday stays.";
  }

  if (query.includes("bali") || query.includes("itinerary")) {
    return "**7-day Bali itinerary:**\n\nDay 1: Arrive in Canggu, beach sunset, easy dinner.\nDay 2: Tanah Lot, cafes, surf lesson.\nDay 3: Ubud rice terraces, Monkey Forest, art market.\nDay 4: Waterfalls and temples near Ubud.\nDay 5: Nusa Penida day trip.\nDay 6: Uluwatu beaches and Kecak dance.\nDay 7: Spa, shopping, airport transfer.\n\nKeep extra buffer for traffic and ferry delays.";
  }

  if (query.includes("pack") || query.includes("mountain")) {
    return "**Mountain trip packing list:**\n\n- Warm layers, rain jacket, quick-dry tees\n- Comfortable trekking shoes and wool socks\n- Sunscreen, sunglasses, cap, lip balm\n- Power bank, torch, reusable bottle\n- Basic medicines, motion sickness tablets, bandages\n- ID proof, cash, offline maps\n\nPack light, but do not skip warm layers even in summer.";
  }

  if (query.includes("visa") || query.includes("japan")) {
    return "**Japan visa basics:**\n\nYou usually need a valid passport, visa form, photo, flight and stay details, bank statements, ITR/salary proof, and a day-wise itinerary. Apply through the authorized visa application center for your region and check the latest requirements before submitting.";
  }

  return `**Here is a travel-planning answer for:** "${message}"\n\nStart with your dates, budget, group size, and travel style. Then shortlist 2-3 destinations, check weather and local transport, book stay near your main activity area, and keep one flexible half-day for delays or spontaneous plans.`;
}

export default function ChatPage() {
  const [messages, setMessages] = useState(() => INITIAL_MESSAGES.map((message) => ({ ...message, time: now() })));
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const resetConversation = () => {
    setMessages(INITIAL_MESSAGES.map((message) => ({ ...message, time: now() })));
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setMessages((current) => [
      ...current,
      { id: Date.now().toString(), role: "user", content: trimmed, time: now() },
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
          time: now(),
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}_error`,
          role: "assistant",
          content: getDemoTravelResponse(trimmed),
          time: now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="page-container">
      <div className="chat-grid" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1.25rem", height: "calc(100vh - 140px)" }}>
        <aside style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "0.9rem", color: "#1f2937", marginBottom: "0.875rem" }}>
              <Bot size={18} /> AI Travel Assistant
            </h3>
            <p style={{ fontSize: "0.8rem", color: "#6b7280", lineHeight: 1.5, marginBottom: "1rem" }}>
              Ask anything about travel planning, destinations, budgets, visas, and packing.
            </p>
            <button onClick={resetConversation} className="btn btn-outline btn-sm" style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <RefreshCcw size={14} /> New Conversation
            </button>
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#374151", marginBottom: "0.75rem" }}>Quick Prompts</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {QUICK_PROMPTS.map((prompt) => (
                <button key={prompt} onClick={() => sendMessage(prompt)} style={{ textAlign: "left", padding: "0.5rem 0.625rem", background: "#f0f2f5", border: "1px solid #e4e6ea", borderRadius: "0.375rem", fontSize: "0.775rem", color: "#374151", cursor: "pointer", lineHeight: 1.4 }}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section style={{ display: "flex", flexDirection: "column", background: "white", borderRadius: "0.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e4e6ea", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f47c7c", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={18} />
            </div>
            <div>
              <h2 style={{ fontWeight: 700, color: "#1f2937", fontSize: "0.95rem", marginBottom: "0.125rem" }}>Traveloop AI</h2>
              <p style={{ fontSize: "0.75rem", color: "#34d399" }}>Online</p>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {messages.map((message) => (
              <div key={message.id} style={{ display: "flex", justifyContent: message.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "75%", padding: "0.75rem 1rem", borderRadius: message.role === "user" ? "1rem 1rem 0 1rem" : "1rem 1rem 1rem 0", background: message.role === "user" ? "#f47c7c" : "#f0f2f5", color: message.role === "user" ? "white" : "#1f2937", fontSize: "0.875rem", lineHeight: 1.6 }}>
                  <div dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
                  <p style={{ fontSize: "0.7rem", opacity: 0.65, textAlign: "right", marginTop: "0.375rem" }}>{message.time}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#6b7280", fontSize: "0.875rem" }}>
                Thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: "1rem", borderTop: "1px solid #e4e6ea" }}>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <input type="text" className="form-input" placeholder="Ask me anything about travel..." value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendMessage(input)} disabled={isTyping} style={{ flex: 1 }} />
              <button onClick={() => sendMessage(input)} className="btn btn-coral" disabled={!input.trim() || isTyping} style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <Send size={14} /> Send
              </button>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#9ea3ac", marginTop: "0.5rem" }}>
              Press Enter to send. Verify important travel information before booking.
            </p>
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .chat-grid { grid-template-columns: 1fr !important; height: auto !important; }
        }
      `}</style>
    </div>
  );
}
