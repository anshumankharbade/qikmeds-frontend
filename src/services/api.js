import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // Increased timeout for production
});

// Request interceptor - adds auth token and handles loading
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.method !== "get") {
      config._requestStartedAt = Date.now();
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles errors globally
api.interceptors.response.use(
  (response) => {
    // Hide any loading that might have been shown
    return response;
  },
  (error) => {
    const { response } = error;

    let errorMessage = "Something went wrong";

    if (error.code === "ECONNABORTED") {
      errorMessage = "Request timeout. Please try again.";
    } else if (!response) {
      // No response was received at all: network failure, CORS block,
      // timeout, or the backend being unreachable/down. `response` is
      // undefined in all of these cases, so nothing below may read
      // response.status/response.data without checking first.
      errorMessage = "Network error. Please check your connection.";
    } else {
      switch (response.status) {
        case 400:
          errorMessage = response.data?.message || "Bad request";
          break;
        case 401:
          errorMessage = "Session expired. Please login again.";
          // Auto logout on 401
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          break;
        case 403:
          errorMessage = "You don't have permission to access this.";
          break;
        case 404:
          errorMessage = "Resource not found.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        default:
          errorMessage = response.data?.message || `Error: ${response.status}`;
      }

      if (response.status === 400 && response.data?.stockIssues) {
        // Custom handling for stock errors
        const stockErrors = response.data.stockIssues
          .filter((item) => item.insufficient)
          .map((item) => `${item.name}: Only ${item.available} available`)
          .join(", ");

        errorMessage = `Stock issues: ${stockErrors}`;
      }
    }

    // Only show toast for non-cancelled requests
    if (!axios.isCancel(error)) {
      toast.error(errorMessage, {
      });
    }

    return Promise.reject({
      message: errorMessage,
      status: response?.status,
      data: response?.data,
    });
  }
);

export default api;