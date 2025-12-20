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
    const { response, config } = error;

    if (!response && !config) {
      return Promise.reject({
        message: "Network error or request cancelled",
        status: 0,
      });
    }

    let errorMessage = "Something went wrong";

    if (error.code === "ECONNABORTED") {
      errorMessage = "Request timeout. Please try again.";
    } else if (error.message === "Network Error") {
      errorMessage = "Network error. Please check your connection.";
    } else if (response) {
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
    }

    // Only show toast for non-cancelled requests
    if (!axios.isCancel(error)) {
      toast.error(errorMessage, {
      });
    }

    if (response.status === 400 && response.data.stockIssues) {
      // Custom handling for stock errors
      const stockErrors = response.data.stockIssues
        .filter((item) => item.insufficient)
        .map((item) => `${item.name}: Only ${item.available} available`)
        .join(", ");

      errorMessage = `Stock issues: ${stockErrors}`;
    }

    return Promise.reject({
      message: errorMessage,
      status: response?.status,
      data: response?.data,
    });
  }
);

export default api;
