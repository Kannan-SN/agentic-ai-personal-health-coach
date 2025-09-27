import axios from 'axios'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string || 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await api.get('/auth/refresh-token')
        return api.request(error.config)
      } catch {
        // Removed unused refreshError variable
        window.location.href = '/signin'
      }
    }
    return Promise.reject(error)
  }
)