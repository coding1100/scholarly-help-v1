import axios from "axios";

// Create an instance of Axios with a custom configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api", // Set your API base URL
});

// Request interceptor: This will be called before the request is sent
axiosInstance.interceptors.request.use(
  (config) => {
    // Distributed trace correlation identifier
    if (!config.headers["x-request-id"]) {
      config.headers["x-request-id"] =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  },
);

export default axiosInstance;
