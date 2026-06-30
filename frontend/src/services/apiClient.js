import axios from 'axios'
import toast from 'react-hot-toast'
import { getStoredToken } from '../state/auth.jsx'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function extractMessage(error) {
  const data = error?.response?.data
  return (
    data?.message ||
    data?.error?.message ||
    (typeof data === 'string' ? data : null) ||
    error?.message ||
    'Something went wrong'
  )
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    const message = extractMessage(error)

    // Avoid noisy toasts for cancelled requests.
    if (!axios.isCancel(error)) {
      // Let pages opt-out by setting config.meta.silent
      const silent = Boolean(error?.config?.meta?.silent)
      if (!silent) toast.error(message)
    }

    return Promise.reject(new ApiError(message, { status, data: error?.response?.data }))
  },
)

