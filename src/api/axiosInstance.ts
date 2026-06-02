import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://wedev-api.sky.pro/api/fitness",
  headers: {
    "Content-Type": "text/plain",
  },
  validateStatus: (status) => {
    return status >= 200 && status < 300;
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 400) {
      localStorage.removeItem("jwt_token");
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
