/**
 * Traveloop API Client
 * Centralized API communication with error handling and auth
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "/api/v1";
const FULL_API_URL = `${API_BASE_URL}${API_VERSION}`;

function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
}

async function apiRequest(endpoint, options = {}) {
  const url = `${FULL_API_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  }).catch((error) => {
    console.warn(`API Request Failed: ${endpoint}`, error);
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error("Backend API is not reachable. Start the FastAPI server on http://localhost:8000.");
    }
    throw error;
  });

  if (response.status === 401) {
    const isAuthEndpoint = endpoint.startsWith("/auth/");
    if (!isAuthEndpoint && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    throw new Error(isAuthEndpoint ? "Incorrect email or password" : "Unauthorized - Please log in");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let errorMessage = "API Error";
    if (typeof errorData.detail === "string") {
      errorMessage = errorData.detail;
    } else if (Array.isArray(errorData.detail)) {
      errorMessage = errorData.detail
        .map((err) => {
          const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : null;
          return field ? `${field}: ${err.msg || err.message}` : err.msg || err.message || JSON.stringify(err);
        })
        .join(", ");
    } else {
      errorMessage = `API Error: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

export const api = {
  auth: {
    login: (email, password) => {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);
      return apiRequest("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
    },
    register: (email, fullName, password) =>
      apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, full_name: fullName, password }),
      }),
    google: (profile) =>
      apiRequest("/auth/google", { method: "POST", body: JSON.stringify(profile) }),
    logout: () => apiRequest("/auth/logout", { method: "POST" }),
  },

  user: {
    getProfile: () => apiRequest("/user/me"),
    updateProfile: (data) =>
      apiRequest("/user/me", { method: "PUT", body: JSON.stringify(data) }),
    changePassword: (data) =>
      apiRequest("/user/me/password", { method: "PUT", body: JSON.stringify(data) }),
  },

  trips: {
    list: () => apiRequest("/trips/"),
    get: (id) => apiRequest(`/trips/${id}`),
    create: (tripData) =>
      apiRequest("/trips/create", { method: "POST", body: JSON.stringify(tripData) }),
    update: (id, tripData) =>
      apiRequest(`/trips/${id}`, { method: "PUT", body: JSON.stringify(tripData) }),
    delete: (id) => apiRequest(`/trips/${id}`, { method: "DELETE" }),
    share: (id) => apiRequest(`/trips/${id}/share`, { method: "POST" }),
  },

  tripStops: {
    create: (tripId, stopData) =>
      apiRequest(`/trips/${tripId}/stops`, { method: "POST", body: JSON.stringify(stopData) }),
    // Checklist
    saveChecklist: (tripId, stopId, data) =>
      apiRequest(`/trips/${tripId}/stops/${stopId}/checklist`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    // Direct Activities on stop
    addActivity: (tripId, stopId, activityData) =>
      apiRequest(`/trips/${tripId}/stops/${stopId}/activities`, {
        method: "POST",
        body: JSON.stringify(activityData),
      }),
    updateActivity: (tripId, stopId, activityId, activityData) =>
      apiRequest(`/trips/${tripId}/stops/${stopId}/activities/${activityId}`, {
        method: "PUT",
        body: JSON.stringify(activityData),
      }),
    deleteActivity: (tripId, stopId, activityId) =>
      apiRequest(`/trips/${tripId}/stops/${stopId}/activities/${activityId}`, {
        method: "DELETE",
      }),
    // AI recommendations per stop
    saveAiRecommendations: (tripId, stopId, recommendations) =>
      apiRequest(`/trips/${tripId}/stops/${stopId}/ai-recommendations`, {
        method: "PUT",
        body: JSON.stringify({ recommendations }),
      }),
  },

  budget: {
    get: (tripId) => apiRequest(`/budget/${tripId}`),
    update: (tripId, budgetData) =>
      apiRequest(`/budget/${tripId}`, { method: "PUT", body: JSON.stringify(budgetData) }),
    addExpense: (tripId, expenseData) =>
      apiRequest(`/budget/${tripId}/expense`, { method: "POST", body: JSON.stringify(expenseData) }),
  },

  expenses: {
    list: (tripId) => apiRequest(`/expenses/${tripId}`),
    create: (tripId, expenseData) =>
      apiRequest(`/expenses/${tripId}`, { method: "POST", body: JSON.stringify(expenseData) }),
    update: (expenseId, expenseData) =>
      apiRequest(`/expenses/${expenseId}`, { method: "PUT", body: JSON.stringify(expenseData) }),
    delete: (expenseId) => apiRequest(`/expenses/${expenseId}`, { method: "DELETE" }),
  },

  groupExpenses: {
    list: (tripId) => apiRequest(`/group-expenses/expenses/${tripId}`),
    create: (tripId, data) => apiRequest(`/group-expenses/expenses/${tripId}`, { method: "POST", body: JSON.stringify(data) }),
    update: (expenseId, data) => apiRequest(`/group-expenses/expenses/${expenseId}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (expenseId) => apiRequest(`/group-expenses/expenses/${expenseId}`, { method: "DELETE" }),
    addMember: (tripId, data) => apiRequest(`/group-expenses/members/${tripId}`, { method: "POST", body: JSON.stringify(data) }),
    removeMember: (memberId) => apiRequest(`/group-expenses/members/${memberId}`, { method: "DELETE" }),
    listSettlements: (tripId) => apiRequest(`/group-expenses/settlements/${tripId}`),
    createSettlement: (tripId, data) => apiRequest(`/group-expenses/settlements/${tripId}`, { method: "POST", body: JSON.stringify(data) }),
  },

  weather: {
    get: (city) => apiRequest(`/weather/${city}`),
  },

  ai: {
    generateItinerary: (itineraryData) =>
      apiRequest("/ai/generate", { method: "POST", body: JSON.stringify(itineraryData) }),
    predictBudget: (budgetData) =>
      apiRequest("/ai/predict-budget", { method: "POST", body: JSON.stringify(budgetData) }),
    chat: (chatData) =>
      apiRequest("/ai/chat", { method: "POST", body: JSON.stringify(chatData) }),
    search: (searchData) =>
      apiRequest("/ai/search", { method: "POST", body: JSON.stringify(searchData) }),
    recommendations: (userId) => apiRequest(`/ai/recommendations/${userId}`),
  },

  search: {
    cities: (query, limit = 10) =>
      apiRequest(`/search/cities?q=${encodeURIComponent(query)}&limit=${limit}`),
    activities: (city, type = null, limit = 20) => {
      const params = new URLSearchParams({ city, limit });
      if (type) params.append("type", type);
      return apiRequest(`/search/activities?${params}`);
    },
  },
};

export default api;
