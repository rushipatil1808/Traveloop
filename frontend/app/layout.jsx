import "./globals.css";

export const metadata = {
  title: "Traveloop — AI-Powered Travel Planning",
  description: "Plan your perfect trip with AI. Generate personalized itineraries, predict budgets, and explore destinations with Traveloop — built by Team Antigravity.",
  keywords: ["travel planning", "AI itinerary", "trip planner", "travel assistant"],
  openGraph: {
    title: "Traveloop — AI-Powered Travel Planning",
    description: "Plan your perfect trip with AI.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
