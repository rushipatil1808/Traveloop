"use client";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Plane, MapPin, Calendar, Users, Copy, Share,
  MessageCircle, Share2, ExternalLink, Clock, DollarSign
} from "lucide-react";

const SHARED_TRIP = {
  id: "demo-trip",
  name: "Tokyo & Kyoto Adventure",
  creator: "Rushi Patel",
  creatorAvatar: "R",
  dates: "March 15–21, 2024",
  days: 6,
  cities: ["Tokyo", "Kyoto"],
  groupType: "Couple",
  travelStyle: "Cultural",
  totalBudget: "₹85,000",
  coverGradient: "from-teal-900 via-indigo-900 to-purple-900",
  stops: [
    {
      city: "Tokyo",
      country: "Japan",
      emoji: "🗼",
      days: "March 15–18",
      activities: [
        { time: "09:00", name: "Senso-ji Temple", type: "Sightseeing", cost: "Free", duration: "2h" },
        { time: "12:30", name: "Nakamise Street lunch", type: "Food", cost: "₹600", duration: "1h" },
        { time: "14:00", name: "Akihabara Electronic Town", type: "Shopping", cost: "₹2,000", duration: "3h" },
        { time: "19:00", name: "Shinjuku Ramen dinner", type: "Food", cost: "₹800", duration: "1.5h" },
      ],
    },
    {
      city: "Kyoto",
      country: "Japan",
      emoji: "⛩️",
      days: "March 19–21",
      activities: [
        { time: "07:00", name: "Arashiyama Bamboo Grove", type: "Nature", cost: "Free", duration: "1.5h" },
        { time: "10:00", name: "Fushimi Inari Shrine", type: "Sightseeing", cost: "Free", duration: "3h" },
        { time: "14:00", name: "Nishiki Market food tour", type: "Food", cost: "₹1,500", duration: "2h" },
        { time: "17:00", name: "Gion Evening Walk", type: "Cultural", cost: "Free", duration: "2h" },
      ],
    },
  ],
};

const ACTIVITY_COLORS = {
  Sightseeing: "#14b8a6",
  Food: "#f59e0b",
  Shopping: "#8b5cf6",
  Nature: "#22c55e",
  Cultural: "#f97316",
};

export default function SharePage() {
  const { token } = useParams();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900/50 to-coral-900/50 border-b border-white/10 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-teal-400 to-coral-400 rounded-lg flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Traveloop</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-white/50 text-sm">Public Itinerary</span>
            <Link href="/auth" className="px-4 py-1.5 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-all">
              Create Your Own
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${SHARED_TRIP.coverGradient} p-8`}
        >
          {/* Decorative orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                {SHARED_TRIP.creatorAvatar}
              </div>
              <span className="text-white/70 text-sm">{SHARED_TRIP.creator}&apos;s Trip</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">{SHARED_TRIP.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{SHARED_TRIP.dates}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{SHARED_TRIP.cities.join(" → ")}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{SHARED_TRIP.groupType}</span>
              <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" />{SHARED_TRIP.totalBudget}</span>
            </div>
            <div className="flex gap-2 mt-4">
              {[SHARED_TRIP.travelStyle, `${SHARED_TRIP.days} Days`, `${SHARED_TRIP.cities.length} Cities`].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs">{tag}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Share Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3"
        >
          <button onClick={handleCopyLink} className="flex items-center gap-2 px-4 py-2.5 glass border border-white/10 text-white rounded-xl text-sm hover:bg-white/10 transition-all">
            <Copy className="w-4 h-4" /> Copy Link
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-sm hover:bg-green-500/30 transition-all">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl text-sm hover:bg-blue-500/30 transition-all">
            <Share className="w-4 h-4" /> Share
          </button>
          <Link href="/auth" className="flex items-center gap-2 px-4 py-2.5 bg-coral-500/20 border border-coral-500/30 text-coral-400 rounded-xl text-sm hover:bg-coral-500/30 transition-all ml-auto">
            <Copy className="w-4 h-4" /> Copy This Trip
          </Link>
        </motion.div>

        {/* Itinerary by City */}
        <div className="space-y-8">
          {SHARED_TRIP.stops.map((stop, stopIdx) => (
            <motion.div
              key={stop.city}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + stopIdx * 0.1 }}
              className="glass rounded-2xl overflow-hidden"
            >
              {/* City Header */}
              <div className="p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{stop.emoji}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{stop.city}</h2>
                    <p className="text-white/50 text-sm">{stop.country} · {stop.days}</p>
                  </div>
                </div>
              </div>

              {/* Activities */}
              <div className="p-6 space-y-3">
                {stop.activities.map((act, actIdx) => (
                  <div key={actIdx} className="flex items-start gap-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <span className="text-white/40 text-xs font-mono w-12 text-right">{act.time}</span>
                    </div>
                    <div className="w-px bg-white/10 self-stretch mt-1 ml-1 mr-3" />
                    {/* Activity Card */}
                    <div className="flex-1 flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: ACTIVITY_COLORS[act.type] || "#64748b" }}
                        />
                        <div>
                          <p className="text-white text-sm font-medium">{act.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-white/40 text-xs">{act.type}</span>
                            <span className="text-white/20 text-xs">·</span>
                            <span className="text-white/40 text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />{act.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-teal-400 text-sm font-medium">{act.cost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-8 text-center border border-teal-500/20"
        >
          <div className="text-3xl mb-3">✈️</div>
          <h3 className="text-white text-xl font-bold mb-2">Love this itinerary?</h3>
          <p className="text-white/60 mb-6">Sign up free and create your own AI-powered travel plan in minutes</p>
          <div className="flex gap-3 justify-center">
            <Link href="/auth" className="px-6 py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-all">
              Get Started Free
            </Link>
            <Link href="/auth" className="px-6 py-3 glass border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all">
              Copy This Trip
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
