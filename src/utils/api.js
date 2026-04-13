import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3333/'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase()
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      window.dispatchEvent(new Event('alertsUpdated'))
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
