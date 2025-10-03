import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

console.log("🔍 API Base URL:", baseURL);
console.log("🔍 Environment variable VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);

const API = axios.create({
  baseURL,
});

API.interceptors.request.use((req) => {
    console.log("🔍 Making API request to:", req.url);
    console.log("🔍 Full URL:", `${req.baseURL}${req.url}`);
    const token = localStorage.getItem("token");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;