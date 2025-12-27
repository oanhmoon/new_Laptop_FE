// import axios from "axios";

// const API = axios.create({
//   baseURL: process.env.REACT_APP_API_URL,
//   headers: {
//     "Content-Type": "application/json"
//   }
// });


// export default API;
import axios from "axios";
import { DOMAIN, TOKEN } from "../Utils/Setting/Config";

const API = axios.create({
  baseURL: DOMAIN,
  headers: {
    "Content-Type": "application/json"
  }
});

// Tự động thêm Authorization nếu có token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN);
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default API;

