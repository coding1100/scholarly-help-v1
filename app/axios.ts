import axios from "axios";

// Create an instance of Axios with a custom configuration
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Set your API base URL
});

// Request interceptor: This will be called before the request is sent
axiosInstance.interceptors.request.use(
  (config) => {
    // Do something with the request config (e.g., add headers)
    const authToken = localStorage.getItem("authToken");

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Response interceptor: This will be called when the response is received
axiosInstance.interceptors.response.use(
  (response) => {
    // Do something with the response data
    return response;
  },
  (error) => {
    console.log(error);
    if (error?.response?.status === 401) {
      window.location.href = window.location.origin + "/scan/login";
    }
    // console.log(error);
    // Handle response error
    return Promise.reject(error);
  }
);

export default axiosInstance;
