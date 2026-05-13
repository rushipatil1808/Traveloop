# ✈️ Traveloop — AI-Powered Travel Planning App

> Plan your perfect trip like never before. Traveloop combines AI, machine learning, and smart design to make trip planning effortless.

![Landing Page](screenshots/landing.png)

---

## 🌟 Features

- 🗺️ **Multi-City Itineraries** — Plan complete day-by-day itineraries across multiple cities with activities, schedules, and travel tips.
- 💰 **AI Budget Prediction** — Use machine learning to predict trip costs by destination, style, and group size with confidence intervals.
- 🤖 **AI Travel Assistant** — Chat with your personal AI travel advisor powered by Claude to get destination tips and plan adjustments.
- 🔍 **Explore Destinations** — Browse and filter destinations by budget, travel style, tags, and price per day.

---

## 📸 Screenshots

### 🏠 Dashboard
![Dashboard](screenshots/dashboard.png)

*Your personal travel overview — track trips, budget spent, cities visited, and quick actions all in one place.*

---

### 🗺️ Plan New Trip
![Plan New Trip](screenshots/plan_trip.png)

*3-step trip creation wizard — enter trip details, pick destinations, and choose your travel style.*

---

### 🔍 Explore Destinations
![Explore Destinations](screenshots/explore.png)

*Natural language search to find destinations — filter by budget, mid-range, or luxury. Destination cards show price/day, ratings, and tags.*

---

### 🤖 AI Travel Assistant
![AI Assistant](screenshots/ai_assistant.png)

*Chat with the AI assistant to get visa info, packing tips, itinerary suggestions, and budget breakdowns — all in real time.*

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js |
| Backend | Node.js / Express |
| AI / LLM | Claude (Anthropic API) |
| Database | MongoDB |
| Styling | Tailwind CSS |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn
- Anthropic API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/rushi1808/traveloop.git
cd traveloop

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your ANTHROPIC_API_KEY and other config to .env

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
traveloop/
├── client/          # React frontend
│   ├── components/  # Reusable UI components
│   ├── pages/       # Dashboard, Explore, MyTrips, AI Assistant
│   └── styles/      # Tailwind config & global styles
├── server/          # Express backend
│   ├── routes/      # API routes
│   ├── models/      # MongoDB models
│   └── services/    # AI/Claude integration
├── screenshots/     # App screenshots for README
└── README.md
```

---

## 🙋‍♂️ Author

**Rushikesh Patil**  
B.Tech CSE (AI/ML) | Parul University  
[GitHub](https://github.com/rushi1808) • [LinkedIn](https://linkedin.com/in/rushikesh-patil)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

> ⭐ If you found this project helpful, please give it a star!
