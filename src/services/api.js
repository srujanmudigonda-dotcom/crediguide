import axios from "axios";

const api = axios.create({
  // Backend API address. Local development uses localhost; a hosted
  // frontend sets VITE_API_URL in its environment (e.g. Vercel) to
  // the deployed backend's /api address.
  baseURL:
    import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* -------------------- Request Interceptor -------------------- */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("creditGuideToken");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* -------------------- Response Interceptor -------------------- */

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    /*
     * Do not clear authentication data for the login request itself.
     * A failed login should simply return its error response.
     */
    const isLoginRequest = requestUrl.includes("/auth/login");

    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem("creditGuideToken");
      localStorage.removeItem("creditGuideUser");
      localStorage.removeItem("creditGuideLoggedIn");
    }

    return Promise.reject(error);
  }
);

export default api;