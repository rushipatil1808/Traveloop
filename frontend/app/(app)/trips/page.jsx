"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Grid2X2, List, Trash2, X, Sparkles, MapPin, Building, Star } from "lucide-react";
import api from "@/lib/api";

const STATUS = {
  upcoming: { bg: "#dbeafe", text: "#1e40af", label: "Upcoming" },
  planning: { bg: "#fef3c7", text: "#92400e", label: "Planning" },
  completed: { bg: "#d1fae5", text: "#065f46", label: "Completed" },
};

const CITIES = [
  {
    id: "c1",
    name: "Goa",
    country: "India",
    cost_index: "Budget",
    avg_daily_cost: 3000,
    popularity_score: 0.92,
    tags: ["beach", "nightlife", "portuguese"],
    description: "Tropical beach paradise with Portuguese heritage, vibrant nightlife, and water sports.",
    img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80",
    hotels: [
      { name: "Ahilya by the Sea (Nerul)", price: 14000, rating: 4.9, desc: "Private heritage villas nestled in a quiet fishing village with dolphin-watching infinity pools." },
      { name: "Elsewhere (Mandrem)", price: 9500, rating: 4.8, desc: "Chic beach houses on a secluded spit, surrounded by coconut groves and a saltwater creek." },
      { name: "Amalia (Anjuna)", price: 5500, rating: 4.7, desc: "A restored Portuguese mansion with a serene courtyard, near active beach spots." }
    ],
    ai_plan: [
      { day: 1, theme: "Beach Retreat", activities: "Relax at Mandrem Beach, watch a golden sunset, and enjoy a candle-lit beachside seafood dinner." },
      { day: 2, theme: "Cultural Insights", activities: "Tour Old Goa churches (Basilica of Bom Jesus), enjoy a traditional spice plantation lunch, and walk the colorful Fontainhas Latin Quarter." },
      { day: 3, theme: "Coastal Adventure", activities: "Indulge in water sports at Palolem Beach, take a private sunset dolphin-spotting boat cruise, and dine under the stars at Thalassa." }
    ]
  },
  {
    id: "c2",
    name: "Manali",
    country: "India",
    cost_index: "Budget",
    avg_daily_cost: 2800,
    popularity_score: 0.88,
    tags: ["mountain", "adventure", "snow"],
    description: "Mountain adventure hub with snow-capped peaks, river rafting, and paragliding.",
    img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80",
    hotels: [
      { name: "Span Resort & Spa", price: 11000, rating: 4.9, desc: "Five-star luxury riverside resort on the banks of Beas River with wood cabins and spa." },
      { name: "The Solang Valley Resort", price: 8500, rating: 4.8, desc: "Premium mountain-facing resort with panoramic views of snow-capped peaks and adventurous trails." },
      { name: "Johnson Lodge", price: 4500, rating: 4.6, desc: "Cozy traditional stone-clad chalets with central fireplaces, wood paneling, and a lively bar." }
    ],
    ai_plan: [
      { day: 1, theme: "High Altitude Adventure", activities: "Visit Solang Valley for paragliding or cable car ride, trek to Jogini Waterfalls, and visit the historic wooden Hadimba Temple." },
      { day: 2, theme: "Mountain Pass Expedition", activities: "Explore Rohtang Pass, drive through the engineering marvel Atal Tunnel, and enjoy hot springs at Vashisht village." },
      { day: 3, theme: "Riverside Relaxation", activities: "Stroll along Beas River, enjoy high-tea at local cafes on Mall Road, and experience a riverside trout dinner." }
    ]
  },
  {
    id: "c3",
    name: "Kyoto",
    country: "Japan",
    cost_index: "Mid-range",
    avg_daily_cost: 8500,
    popularity_score: 0.95,
    tags: ["temples", "cultural", "geisha"],
    description: "Ancient capital with 1,600 temples, traditional tea houses, and geisha culture.",
    img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80",
    hotels: [
      { name: "Hoshinoya Kyoto", price: 22000, rating: 4.9, desc: "Traditional luxury ryokan accessible via a scenic boat ride down Oi River in Arashiyama." },
      { name: "Sowaka", price: 16000, rating: 4.8, desc: "A beautifully restored Sukiya-style townhouse blending ancient heritage and modern luxury." },
      { name: "Piece Hostel Sanjo", price: 3500, rating: 4.7, desc: "Sleek, award-winning design hostel perfect for budget travelers wanting premium style." }
    ],
    ai_plan: [
      { day: 1, theme: "Shines & Geishas", activities: "Walk the thousands of vermilion torii gates at Fushimi Inari at dawn, explore Kiyomizu-dera temple, and stroll historic Gion for Geisha sightings." },
      { day: 2, theme: "Bamboo Forests & Zen", activities: "Explore the Arashiyama Bamboo Grove, visit the famous Golden Pavilion (Kinkaku-ji), and partake in a traditional tea ceremony." },
      { day: 3, theme: "Gastronomy & Canals", activities: "Taste street food at Nishiki Market, stroll down the Philosopher's Path, and enjoy a kaiseki multi-course dinner." }
    ]
  },
  {
    id: "c4",
    name: "Bali",
    country: "Indonesia",
    cost_index: "Budget",
    avg_daily_cost: 2500,
    popularity_score: 0.97,
    tags: ["beach", "spiritual", "surfing"],
    description: "Island paradise with rice terraces, Hindu temples, surf beaches, and wellness retreats.",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
    hotels: [
      { name: "Hanging Gardens of Bali", price: 18000, rating: 4.9, desc: "World-famous split-level infinity pool overlooking dense jungle valleys in Ubud." },
      { name: "Potato Head Suites", price: 12000, rating: 4.8, desc: "Art-infused, sustainable beachfront suites in Seminyak featuring global DJs." },
      { name: "Hideout Bali", price: 6000, rating: 4.7, desc: "Eco-friendly bamboo treehouse hidden beside a bubbling river in East Bali." }
    ],
    ai_plan: [
      { day: 1, theme: "Ubud Culture & Nature", activities: "Stroll the Tegalalang Rice Terraces, explore the Sacred Monkey Forest, and buy handicrafts at Ubud Art Market." },
      { day: 2, theme: "Temples & Surf", activities: "Visit the cliffside Uluwatu Temple, watch a Kecak fire dance, and relax at Potato Head Beach Club." },
      { day: 3, theme: "Sunrise Volcano Trek", activities: "Hike Mount Batur for sunrise, swim in local volcanic hot springs, and indulge in a traditional Balinese massage." }
    ]
  },
  {
    id: "c5",
    name: "Paris",
    country: "France",
    cost_index: "Luxury",
    avg_daily_cost: 12000,
    popularity_score: 0.99,
    tags: ["romantic", "art", "fashion"],
    description: "The City of Light — Eiffel Tower, Louvre, world-class cuisine, and romance.",
    img: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80",
    hotels: [
      { name: "Hotel Plaza Athenee", price: 45000, rating: 4.9, desc: "Iconic luxury hotel on Avenue Montaigne with red awnings and Eiffel Tower views." },
      { name: "Le Pavillon de la Reine", price: 24000, rating: 4.8, desc: "Charming boutique retreat hidden in a secret courtyard in the historic Place des Vosges." },
      { name: "Generator Paris", price: 4500, rating: 4.6, desc: "Vibrant designer hostel with a spectacular rooftop bar overlooking Montmartre." }
    ],
    ai_plan: [
      { day: 1, theme: "Iconic Landmarks", activities: "Ascend the Eiffel Tower, take a scenic Seine River cruise, and stroll Montmartre to see Sacre-Coeur." },
      { day: 2, theme: "Museums & Gardens", activities: "Marvel at the Louvre's treasures, walk through Tuileries Gardens, and shop at Champs-Elysees." },
      { day: 3, theme: "Versailles Royal Day", activities: "Take a day trip to the Palace of Versailles, explore the Hall of Mirrors, and enjoy evening jazz in the Latin Quarter." }
    ]
  },
  {
    id: "c6",
    name: "Ladakh",
    country: "India",
    cost_index: "Budget",
    avg_daily_cost: 3500,
    popularity_score: 0.85,
    tags: ["mountain", "monastery", "stargazing"],
    description: "High-altitude desert with lunar landscapes, Buddhist monasteries, and Pangong Lake.",
    img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80",
    hotels: [
      { name: "Nimmu House", price: 12000, rating: 4.9, desc: "Charming noble house boutique lodge with apricot orchards and views of the Zanskar range." },
      { name: "The Grand Dragon Ladakh", price: 8500, rating: 4.8, desc: "Premium eco-friendly hotel with traditional Ladakhi window carvings, heating, and fine dining." },
      { name: "Nomadic Life Camp", price: 4000, rating: 4.7, desc: "Deluxe lake-facing tents at Pangong Tso with starry night campfires and local meals." }
    ],
    ai_plan: [
      { day: 1, theme: "Acclimatization & Palace", activities: "Rest to adjust to high altitude, visit Leh Palace, and watch a gorgeous sunset from the Shanti Stupa." },
      { day: 2, theme: "Monasteries & Confluences", activities: "Tour Thiksey Monastery, experience Magnetic Hill, and see the Indus & Zanskar river confluence at Sangam." },
      { day: 3, theme: "Pangong Tso Wonders", activities: "Drive through Chang La pass to Pangong Lake, walk the turquoise shores, and enjoy lakeside stargazing by the fire." }
    ]
  },
  {
    id: "c7",
    name: "Tokyo",
    country: "Japan",
    cost_index: "Mid-range",
    avg_daily_cost: 9000,
    popularity_score: 0.98,
    tags: ["modern", "food", "technology", "anime"],
    description: "Hyper-modern metropolis with incredible street food, shrines, and pop culture.",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
    hotels: [
      { name: "Aman Tokyo", price: 38000, rating: 4.9, desc: "Sanctuary in the sky blending traditional washi paper panels with panoramic Tokyo skyline views." },
      { name: "Trunk Hotel (Shibuya)", price: 18000, rating: 4.8, desc: "Ultra-stylish boutique hotel, a hub for local artists, sustainable design, and creative foods." },
      { name: "Book and Bed Tokyo", price: 4500, rating: 4.6, desc: "Concept capsule hotel sleeping inside wooden bookshelves filled with thousands of books." }
    ],
    ai_plan: [
      { day: 1, theme: "Temples & Neon Lights", activities: "Visit Senso-ji temple in Asakusa, shop in Akihabara electronic town, and walk Shibuya Crossing at night." },
      { day: 2, theme: "Fashion & Shrines", activities: "Stroll Meiji Shrine in Harajuku, watch wild fashion on Takeshita Street, and dine in Shinjuku's Omoide Yokocho food alleys." },
      { day: 3, theme: "Digital Art & Skytree", activities: "Visit teamLab Planets digital museum, eat fresh sashimi at Tsukiji Outer Market, and view Mt. Fuji from Tokyo Skytree." }
    ]
  },
  {
    id: "c8",
    name: "Barcelona",
    country: "Spain",
    cost_index: "Mid-range",
    avg_daily_cost: 9000,
    popularity_score: 0.94,
    tags: ["architecture", "beach", "gaudi", "nightlife"],
    description: "Vibrant Catalan city with Gaudí's masterpieces, tapas culture, and beaches.",
    img: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80",
    hotels: [
      { name: "W Barcelona", price: 22000, rating: 4.8, desc: "Iconic sail-shaped beachfront hotel with panoramic views of the Mediterranean." },
      { name: "Hotel Casa Fuster", price: 16000, rating: 4.9, desc: "Modernist architectural landmark by Domènech i Montaner turned luxury boutique hotel." },
      { name: "Yeah Barcelona Hostel", price: 3800, rating: 4.7, desc: "Premium designer hostel with custom bunk beds and fantastic communal dinners." }
    ],
    ai_plan: [
      { day: 1, theme: "Gaudí Masterpieces", activities: "Explore Sagrada Família, stroll Park Güell, and watch sunset with 360-degree views at Bunkers del Carmel." },
      { day: 2, theme: "Old Quarters & Tapas", activities: "Stroll the winding alleys of the Gothic Quarter, eat fresh oysters at La Boqueria Market, and experience a beach club night." },
      { day: 3, theme: "Sea & Flamenco", activities: "Sunbathe at Barceloneta beach, take the Montjuïc cable car, and watch an emotional evening Flamenco show." }
    ]
  },
  {
    id: "c9",
    name: "Rishikesh",
    country: "India",
    cost_index: "Budget",
    avg_daily_cost: 1800,
    popularity_score: 0.86,
    tags: ["yoga", "spiritual", "rafting"],
    description: "World capital of yoga in Himalayan foothills with white-water rafting and Ganga Aarti.",
    img: "https://images.unsplash.com/photo-1588083949404-c4f1ed1323b3?w=600&q=80",
    hotels: [
      { name: "Ananda in the Himalayas", price: 35000, rating: 4.9, desc: "World-renowned luxury palace retreat offering holistic Ayurvedic and yoga programs." },
      { name: "Aloha on the Ganges", price: 7500, rating: 4.8, desc: "Spectacular riverside resort with an infinity pool facing the holy Ganges River." },
      { name: "Zostel Rishikesh", price: 1500, rating: 4.7, desc: "Vibrant backpacker hostel with graffiti walls, riverside cafe, and daily yoga sessions." }
    ],
    ai_plan: [
      { day: 1, theme: "Spiritual Rishikesh", activities: "Cross Lakshman Jhula suspension bridge, explore the abandoned Beatles Ashram, and watch the Ganga Aarti at Parmarth Niketan." },
      { day: 2, theme: "Ganges Adventure", activities: "Experience 16km white-water rafting, go cliff jumping in the Ganges, and dine at local organic health cafes." },
      { day: 3, theme: "Falls & Meditation", activities: "Trek to Neer Garh Waterfall, drive to Kunjapuri Temple for a Himalayan sunrise, and enjoy a Tibetan sound healing session." }
    ]
  },
  {
    id: "c10",
    name: "Jaipur",
    country: "India",
    cost_index: "Budget",
    avg_daily_cost: 2500,
    popularity_score: 0.87,
    tags: ["historical", "palace", "rajasthani"],
    description: "The Pink City with magnificent Rajput palaces, vibrant bazaars, and rich heritage.",
    img: "https://images.unsplash.com/photo-1599661559683-deba68735520?w=600&q=80",
    hotels: [
      { name: "Rambagh Palace", price: 32000, rating: 4.9, desc: "The jewel of Jaipur, a grand former royal palace with manicured gardens and resident peacocks." },
      { name: "Samode Haveli", price: 12000, rating: 4.8, desc: "A traditional noble residence inside the old city with stunning hand-painted fresco murals." },
      { name: "Zostel Jaipur", price: 1800, rating: 4.7, desc: "Color-drenched cozy hostel right in the middle of the old Pink City bazaars." }
    ],
    ai_plan: [
      { day: 1, theme: "Forts & Palaces", activities: "Tour the majestic Amber Fort, photograph the floating Jal Mahal, and climb the windows of Hawa Mahal (Palace of Winds)." },
      { day: 2, theme: "Heritage Walk", activities: "Explore the City Palace royal collections, visit Jantar Mantar observatory, and shop for silver jewelry at Johari Bazaar." },
      { day: 3, theme: "Royal Feast", activities: "Watch sunset at Nahargarh Fort, and experience authentic Rajasthani Dal Baati Churma at Chokhi Dhani ethnic village." }
    ]
  },
  {
    id: "c11",
    name: "Santorini",
    country: "Greece",
    cost_index: "Luxury",
    avg_daily_cost: 15000,
    popularity_score: 0.96,
    tags: ["romantic", "island", "sunset"],
    description: "Iconic white-and-blue island with caldera sunsets and volcanic beaches.",
    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80",
    hotels: [
      { name: "Grace Hotel (Auberge Resorts)", price: 38000, rating: 4.9, desc: "Exquisite cliffside luxury hotel in Imerovigli with iconic infinity pool and caldera views." },
      { name: "Katikies Santorini (Oia)", price: 28000, rating: 4.8, desc: "Stunning white-washed traditional cave suites draped over the cliffs of beautiful Oia." },
      { name: "Caveland", price: 4500, rating: 4.7, desc: "Charming boutique hostel set inside an old 18th-century winery with cave rooms." }
    ],
    ai_plan: [
      { day: 1, theme: "Caldera Views", activities: "Hike the scenic trail from Fira to Oia, secure a spot for the famous Oia sunset, and eat grilled octopus at a local tavern." },
      { day: 2, theme: "Volcanic Beaches", activities: "Sunbathe at the unique Red Beach, explore Akrotiri prehistoric ruins, and taste white wine at a local winery." },
      { day: 3, theme: "Sailing & Hot Springs", activities: "Take a half-day catamaran cruise, swim in Nea Kameni volcanic hot springs, and enjoy sunset dinner on the boat." }
    ]
  },
  {
    id: "c12",
    name: "Kerala",
    country: "India",
    cost_index: "Budget",
    avg_daily_cost: 2800,
    popularity_score: 0.90,
    tags: ["backwaters", "ayurveda", "nature", "houseboat"],
    description: "God's Own Country — serene backwaters, ayurvedic retreats, and tea plantations.",
    img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80",
    hotels: [
      { name: "Kumarakom Lake Resort", price: 18000, rating: 4.9, desc: "Heritage luxury resort with winding canal pools, fine dining, and traditional houseboats." },
      { name: "Brunton Boatyard (Fort Kochi)", price: 12000, rating: 4.8, desc: "Stately hotel capturing the colonial Dutch, Portuguese, and British history of Kochi port." },
      { name: "Windermere Estate (Munnar)", price: 6500, rating: 4.7, desc: "Cozy mountain lodge set inside working tea and cardamom plantations in Munnar hills." }
    ],
    ai_plan: [
      { day: 1, theme: "Port Town Heritage", activities: "See Fort Kochi Chinese fishing nets, explore Mattancherry Palace, and watch a traditional Kathakali dance show." },
      { day: 2, theme: "Western Ghats & Tea", activities: "Drive up to Munnar tea valleys, visit a spice plantation, and hike through Eravikulam National Park." },
      { day: 3, theme: "Backwaters Cruise", activities: "Board an overnight houseboat in Alleppey, glide through palm-fringed canals, and enjoy traditional Karimeen fish lunch." }
    ]
  }
];

const COST_BADGE = {
  "Budget": "badge-green",
  "Mid-range": "badge-blue",
  "Luxury": "badge-yellow",
};

const pageStyle = { maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" };
const cardStyle = { background: "white", borderRadius: "0.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" };
const cellStyle = { padding: "0.875rem 1rem", borderBottom: "1px solid #e4e6ea" };

function normalizeTrip(trip) {
  const cities =
    trip.cities?.length ? trip.cities :
    trip.destinations?.length ? trip.destinations :
    trip.stops?.map((stop) => stop.city_name).filter(Boolean) || [];
  const budget = trip.budget ?? trip.total_budget ?? 0;

  return {
    ...trip,
    cities,
    budget,
    status: trip.status || "planning",
    travel_style: trip.travel_style || "-",
    group_size: trip.group_size || 1,
  };
}

export default function TripsPage() {
  const router = useRouter();
  const [view, setView] = useState("table");
  const [filter, setFilter] = useState("all");
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // TripAdvisor-style interactive details modal state inside My Trips
  const [selectedCity, setSelectedCity] = useState(null);
  const [activeTab, setActiveTab] = useState("hotels"); // "hotels" or "itinerary"
  const [planningTrip, setPlanningTrip] = useState(false);
  const [planMessage, setPlanMessage] = useState("");

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await api.trips.list();
        setTrips(Array.isArray(data) ? data.map(normalizeTrip) : []);
      } catch (err) {
        console.error("Error fetching trips:", err);
        setError(err.message || "Failed to load trips");
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  // Instant One-Click AI Trip Planner Action from My Trips
  const generateCityTrip = async (city) => {
    setPlanningTrip(true);
    setPlanMessage(`Initializing your custom trip to ${city.name}...`);
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const startStr = tomorrow.toISOString().split("T")[0];

      const end = new Date(tomorrow);
      end.setDate(tomorrow.getDate() + 3);
      const endStr = end.toISOString().split("T")[0];

      setPlanMessage("Saving trip details to secure database...");
      const newTrip = {
        name: `${city.name} AI Escape`,
        start_date: startStr,
        end_date: endStr,
        destinations: [city.name],
        travel_style: city.tags[0] || "balanced",
        group_type: "couple",
        group_size: 2,
        status: "planning",
        total_budget: city.avg_daily_cost * 3 * 2, // 3 days for 2 travelers
        description: `AI-powered adventure to ${city.name}. ${city.description}`,
        currency: "INR",
      };

      const created = await api.trips.create(newTrip);
      
      setPlanMessage(`Connecting to ${city.name} Traveloop AI Guides...`);
      const itinerary = await api.ai.generateItinerary({
        destinations: [city.name],
        duration_days: 3,
        budget: city.avg_daily_cost * 3 * 2,
        currency: "INR",
        travel_style: city.tags[0] || "balanced",
        group_type: "couple",
        group_size: 2,
      });

      if (itinerary?.recommendations?.length) {
        setPlanMessage("Injecting hand-picked spots and local secrets...");
        await api.trips.update(created.id, {
          ai_suggestions: itinerary.recommendations,
        });
      }

      setPlanMessage("Journey ready! Taking you there...");
      setTimeout(() => {
        router.push(`/trips/${created.id}`);
      }, 500);

    } catch (err) {
      console.error("Error generating trip from My Trips:", err);
      alert("Failed to automatically plan the trip: " + err.message);
      setPlanningTrip(false);
    }
  };

  const filtered = filter === "all" ? trips : trips.filter((trip) => trip.status === filter);

  const deleteTrip = async (id) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      await api.trips.delete(id);
      setTrips(trips.filter((trip) => trip.id !== id));
    } catch (err) {
      console.error("Error deleting trip:", err);
      setError("Failed to delete trip: " + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ color: "#6b7280" }}>Loading trips...</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.25rem" }}>My Trips</h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>{filtered.length} trips found</p>
        </div>
        <Link href="/trips/new" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", borderRadius: "0.375rem", fontSize: "0.875rem", fontWeight: 600, background: "#f47c7c", color: "white", textDecoration: "none", boxShadow: "0 2px 4px rgba(244, 124, 124, 0.3)" }}>
          + Plan New Trip
        </Link>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "0.5rem", padding: "0.75rem 1rem", marginBottom: "1.25rem", color: "#991b1b", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      <div style={{ ...cardStyle, marginBottom: "1.25rem", padding: "0.875rem 1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {["all", "upcoming", "planning", "completed"].map((item) => (
              <button key={item} onClick={() => setFilter(item)} style={{ padding: "0.375rem 0.875rem", borderRadius: "9999px", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", border: "1.5px solid", borderColor: filter === item ? "#f47c7c" : "#e4e6ea", background: filter === item ? "#f47c7c" : "white", color: filter === item ? "white" : "#6b7280" }}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", border: "1.5px solid #e4e6ea", borderRadius: "0.375rem", overflow: "hidden" }}>
            {[
              ["table", List],
              ["grid", Grid2X2],
            ].map(([item, Icon]) => (
              <button key={item} aria-label={`${item} view`} onClick={() => setView(item)} style={{ padding: "0.5rem 0.75rem", border: "none", cursor: "pointer", background: view === item ? "#f47c7c" : "white", color: view === item ? "white" : "#6b7280" }}>
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "table" && (
        <div style={{ ...cardStyle, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", textAlign: "left" }}>
            <thead>
              <tr>
                {["Trip Name", "Destinations", "Travel Dates", "Group", "Style", "Budget", "Status", "Actions"].map((heading) => (
                  <th key={heading} style={{ padding: "0.75rem 1rem", borderBottom: "2px solid #e4e6ea", fontWeight: 600, color: "#374151", background: "#f8f9fa", textAlign: "left" }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
                    No trips found. <Link href="/trips/new" style={{ color: "#f47c7c", textDecoration: "underline" }}>Create one</Link>
                  </td>
                </tr>
              ) : filtered.map((trip) => {
                const status = STATUS[trip.status] || STATUS.planning;

                return (
                  <tr key={trip.id}>
                    <td style={{ ...cellStyle, fontWeight: 600, color: "#1f2937" }}>{trip.name}</td>
                    <td style={{ ...cellStyle, color: "#6b7280", fontSize: "0.8125rem" }}>{trip.cities.length ? trip.cities.join(" -> ") : "-"}</td>
                    <td style={{ ...cellStyle, color: "#6b7280", fontSize: "0.8125rem" }}>{trip.start_date}<br /><span style={{ color: "#9ea3ac" }}>to {trip.end_date}</span></td>
                    <td style={{ ...cellStyle, textAlign: "center" }}>{trip.group_size}</td>
                    <td style={cellStyle}><span style={{ padding: "0.25rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, background: "#f3f4f6", color: "#4b5563", textTransform: "capitalize" }}>{trip.travel_style}</span></td>
                    <td style={{ ...cellStyle, fontWeight: 600, color: "#1f2937" }}>Rs {trip.budget ? (trip.budget / 1000).toFixed(0) : "0"}K</td>
                    <td style={cellStyle}><span style={{ padding: "0.25rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, background: status.bg, color: status.text }}>{status.label}</span></td>
                    <td style={{ ...cellStyle, display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <Link href={`/trips/${trip.id}`} style={{ color: "#3b82f6", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600 }}>View</Link>
                      <button aria-label="Delete trip" onClick={() => deleteTrip(trip.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {view === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
          {filtered.length === 0 ? (
            <div style={{ ...cardStyle, gridColumn: "1/-1", padding: "3rem 1rem", textAlign: "center", color: "#6b7280" }}>No trips found</div>
          ) : filtered.map((trip) => {
            const status = STATUS[trip.status] || STATUS.planning;

            return (
              <div key={trip.id} style={{ ...cardStyle, overflow: "hidden" }}>
                <div style={{ height: "130px", background: "linear-gradient(135deg, #f47c7c, #34d399)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: "1.5rem" }}>
                  {trip.cities[0] || "Trip"}
                </div>
                <div style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#1f2937" }}>{trip.name}</h3>
                    <span style={{ padding: "0.25rem 0.625rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, background: status.bg, color: status.text }}>{status.label}</span>
                  </div>
                  <p style={{ fontSize: "0.8125rem", color: "#6b7280", marginBottom: "0.5rem" }}>{trip.cities.length ? trip.cities.join(" -> ") : "No destinations yet"}</p>
                  <p style={{ fontSize: "0.8125rem", color: "#9ea3ac", marginBottom: "0.75rem" }}>{trip.start_date} {"->"} {trip.end_date}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: "#1f2937" }}>Rs {trip.budget ? (trip.budget / 1000).toFixed(0) : "0"}K</span>
                    <Link href={`/trips/${trip.id}`} style={{ padding: "0.375rem 0.875rem", borderRadius: "0.375rem", fontSize: "0.8125rem", fontWeight: 600, color: "white", background: "#f47c7c", textDecoration: "none" }}>View</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Explore Curated Destinations Section directly inside My Trips page! */}
      <div style={{ marginTop: "3.5rem", borderTop: "1px solid #e5e7eb", paddingTop: "2.5rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.25rem" }}>
            Explore Popular Destinations
          </h2>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            Uncover curated recommended stays and suggested plans. Click any card to instantly plan your next dream escape!
          </p>
        </div>

        {/* CITIES Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1.25rem",
        }}>
          {CITIES.map((c) => (
            <div
              key={c.id}
              onClick={() => { setSelectedCity(c); setActiveTab("hotels"); }}
              style={{
                background: "white",
                borderRadius: "0.75rem",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
            >
              <img src={c.img} alt={c.name} style={{ width: "100%", height: "150px", objectFit: "cover" }} />
              <div style={{ padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.375rem" }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1f2937", margin: 0 }}>{c.name}</h3>
                    <p style={{ fontSize: "0.775rem", color: "#6b7280", margin: 0 }}>{c.country}</p>
                  </div>
                  <span className={`badge ${COST_BADGE[c.cost_index]}`} style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>{c.cost_index}</span>
                </div>
                <p style={{ fontSize: "0.775rem", color: "#6b7280", lineHeight: 1.4, marginBottom: "0.75rem", height: "2.8em", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {c.description}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, color: "#1f2937", fontSize: "0.8125rem" }}>
                    ₹{c.avg_daily_cost.toLocaleString()}/day
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#f59e0b", fontSize: "0.75rem" }}>
                    ⭐ {(c.popularity_score * 5).toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TripAdvisor Premium City Details Modal */}
      {selectedCity && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "1.5rem",
          }}
          onClick={() => setSelectedCity(null)}
        >
          <div
            style={{
              background: "white",
              width: "100%",
              maxWidth: "640px",
              borderRadius: "1rem",
              overflow: "hidden",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              display: "flex",
              flexDirection: "column",
              maxHeight: "90vh",
              animation: "fadeIn 0.25s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Banner */}
            <div style={{ position: "relative", height: "240px", width: "100%" }}>
              <img src={selectedCity.img} alt={selectedCity.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))" }} />
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedCity(null)}
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.5)",
                  color: "white",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>

              {/* Title Content */}
              <div style={{ position: "absolute", bottom: "1.25rem", left: "1.5rem", color: "white" }}>
                <span className={`badge ${COST_BADGE[selectedCity.cost_index]}`} style={{ marginBottom: "0.5rem", display: "inline-block" }}>
                  {selectedCity.cost_index}
                </span>
                <h2 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                  {selectedCity.name}
                </h2>
                <p style={{ fontSize: "0.875rem", opacity: 0.9, display: "flex", alignItems: "center", gap: "0.25rem", margin: 0 }}>
                  <MapPin size={14} /> {selectedCity.country}
                </p>
              </div>
            </div>

            {/* Description Block */}
            <div style={{ padding: "1.25rem 1.5rem 0.5rem 1.5rem", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <p style={{ fontSize: "0.875rem", color: "#4b5563", lineHeight: 1.6, margin: 0 }}>
                {selectedCity.description}
              </p>
              <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginTop: "0.75rem", marginBottom: "0.5rem" }}>
                {selectedCity.tags.map(t => (
                  <span key={t} style={{ background: "#e5e7eb", color: "#4b5563", padding: "0.2rem 0.5rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 600 }}>
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Premium Interactive Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", background: "white" }}>
              <button
                onClick={() => setActiveTab("hotels")}
                style={{
                  flex: 1,
                  padding: "1rem",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: activeTab === "hotels" ? "#f47c7c" : "#6b7280",
                  borderBottom: activeTab === "hotels" ? "3px solid #f47c7c" : "3px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s",
                }}
              >
                <Building size={16} /> Recommended Stays
              </button>
              <button
                onClick={() => setActiveTab("itinerary")}
                style={{
                  flex: 1,
                  padding: "1rem",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: activeTab === "itinerary" ? "#f47c7c" : "#6b7280",
                  borderBottom: activeTab === "itinerary" ? "3px solid #f47c7c" : "3px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s",
                }}
              >
                <Sparkles size={16} /> AI Suggested Plan
              </button>
            </div>

            {/* Scrollable Tab Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", background: "#f9fafb" }}>
              {activeTab === "hotels" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: "#374151", margin: "0 0 0.25rem 0" }}>
                    Top Curated Stays by TripAdvisor AI
                  </h4>
                  {selectedCity.hotels.map((h, i) => (
                    <div
                      key={h.name}
                      style={{
                        background: "white",
                        padding: "1rem",
                        borderRadius: "0.75rem",
                        border: "1px solid rgba(229, 231, 235, 0.8)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 800, color: "#111827", fontSize: "0.925rem" }}>
                          🏨 {h.name}
                        </span>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f59e0b", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Star size={12} fill="#f59e0b" /> {h.rating}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "0.25rem 0" }}>{h.desc}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.25rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Approximate Rate</span>
                        <span style={{ fontWeight: 700, color: "#10b981", fontSize: "0.875rem" }}>₹{h.price.toLocaleString()}/night</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: "#374151", margin: "0 0 0.25rem 0" }}>
                    Curated Highlights Map
                  </h4>
                  {selectedCity.ai_plan.map((day) => (
                    <div
                      key={day.day}
                      style={{
                        background: "white",
                        padding: "1rem",
                        borderRadius: "0.75rem",
                        border: "1px solid rgba(229, 231, 235, 0.8)",
                        display: "flex",
                        gap: "1rem",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: "#ffebee",
                          color: "#ef5350",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          flexShrink: 0,
                        }}
                      >
                        D{day.day}
                      </div>
                      <div>
                        <span style={{ fontWeight: 800, color: "#1f2937", fontSize: "0.875rem", display: "block", marginBottom: "0.25rem" }}>
                          {day.theme}
                        </span>
                        <p style={{ fontSize: "0.8rem", color: "#4b5563", margin: 0, lineHeight: 1.5 }}>
                          {day.activities}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Sticky Action Footer */}
            <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid #e5e7eb", display: "flex", gap: "1rem", background: "white" }}>
              <button
                onClick={() => setSelectedCity(null)}
                style={{
                  padding: "0.75rem 1.25rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #d1d5db",
                  background: "white",
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                onClick={() => generateCityTrip(selectedCity)}
                style={{
                  flex: 1,
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  background: "linear-gradient(135deg, #f47c7c, #ff9a9e)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: "0 4px 14px rgba(244,124,124,0.35)",
                  transition: "all 0.2s",
                }}
              >
                <Sparkles size={16} /> Plan Trip to {selectedCity.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Loading Spinner during automatic AI trip generation */}
      {planningTrip && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(12px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999999,
            color: "white",
          }}
        >
          <div style={{ position: "relative", marginBottom: "1.5rem" }}>
            <div style={{ height: "64px", width: "64px", border: "4px solid rgba(244, 124, 124, 0.2)", borderTopColor: "#f47c7c", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <Sparkles size={24} style={{ position: "absolute", top: "20px", left: "20px", color: "#f47c7c", animation: "pulse 1.5s infinite" }} />
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "white", margin: "0 0 0.5rem 0" }}>
            Traveloop AI Planner
          </h3>
          <p style={{ fontSize: "0.875rem", color: "#9ca3af", margin: 0 }}>
            {planMessage}
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
