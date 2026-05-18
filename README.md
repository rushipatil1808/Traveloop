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

| Layer | Technology | Description |
|-------|------------|-------------|
| **Frontend** | [Next.js 16](https://nextjs.org/) (React 19) | Modern app router framework, Turbopack, Tailwind CSS |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12+) | High-performance, type-safe API backend with Uvicorn |
| **AI / LLM** | [LangChain](https://www.langchain.com/) & Anthropic | Advanced AI agentic workflows & context-aware trip generation |
| **Database** | [MongoDB](https://www.mongodb.com/) | Persistent document store for travel logs, stops, and budgets |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & Framer Motion | High-fidelity interactive UI with fluid micro-animations |

---

## 🚀 Getting Started

This full-stack application consists of a Next.js client and a Python FastAPI server.

### Prerequisites
- Node.js >= 18 and npm
- Python >= 3.12
- MongoDB running locally (default: `mongodb://localhost:27017`)
- Anthropic API Key (or other AI models supported in settings)

### Running Locally

You can run both frontend and backend automatically using the start scripts in the root directory:

```powershell
# Run the complete application (both services simultaneously)
.\start.bat
```

Or run them individually:

#### 1. Backend Setup
```bash
cd backend
# Create environment file and add your credentials
cp .env.example .env
# Start the backend server
start_backend.bat
```
FastAPI Swagger documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

#### 2. Frontend Setup
```bash
cd frontend
# Create environment file and configure local port
cp .env.local .env.local
# Run Next.js in development mode
npm run dev
```
The website will be available at [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```text
traveloop/
├── frontend/             # Next.js 16 Web Application
│   ├── app/              # App router (dashboard, chat, trips, budget)
│   ├── components/       # Premium UI dashboard controls and timeline
│   ├── lib/              # API wrapper client and helpers
│   └── public/           # Static asset assets
├── backend/              # FastAPI Python Web Service
│   ├── app/              # API router, database layer, AI engine
│   │   ├── api/          # Route handlers (auth, trips, weather, AI)
│   │   ├── utils/        # Vector indexers, schema validations, logging
│   │   └── config.py     # Environment configurations loaded via Pydantic
│   ├── requirements.txt  # Python package specifications (LangChain, FAISS, etc.)
│   └── verify.py         # Self-checking service verification script
├── DEPLOYMENT.md         # Production-ready Cloud Deployment Guide
└── README.md             # Project landing documentation
```

---

## ☁️ Production Deployment

To deploy this project to the cloud, see our step-by-step **[Deployment Guide](file:///e:/Traveloop/DEPLOYMENT.md)**.
- **Frontend** is highly optimized for deployment on **[Vercel](https://vercel.com)**.
- **Backend** is designed to run on dedicated Python servers like **[Render](https://render.com)** or **[Railway](https://railway.app)**.
- **Database** can be instantly hosted on the free tier of **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**.

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
