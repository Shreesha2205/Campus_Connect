import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://campus-connect-lv1j.onrender.com/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds — never hang forever
});

// ── Attach JWT to every request ───────────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Retry once on timeout, convert errors to readable messages ────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Retry once on timeout (ECONNABORTED) or network error
    if (
      !config._retried &&
      (error.code === "ECONNABORTED" || !error.response)
    ) {
      config._retried = true;
      return api(config);
    }

    // Convert to a readable error message
    if (error.code === "ECONNABORTED") {
      return Promise.reject(
        new Error("Request timed out. The server may be waking up — please try again in a moment.")
      );
    }
    if (!error.response) {
      return Promise.reject(
        new Error("Cannot reach the server. Check your internet connection.")
      );
    }

    return Promise.reject(error);
  }
);

/**
 * Silently ping the backend to wake it up (Render cold start).
 * Call this as early as possible — before the user even presses a button.
 */
export const warmUpServer = async () => {
  try {
    await axios.get("https://campus-connect-lv1j.onrender.com/", {
      timeout: 60000, // give the cold start up to 60s
    });
  } catch (_) {
    // ignore — this is best-effort only
  }
};

export default api;