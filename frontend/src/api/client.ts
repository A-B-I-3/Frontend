import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
})

export function setAuthToken(token: string | null) {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`
    window.localStorage.setItem('auth_token', token)
  } else {
    delete client.defaults.headers.common.Authorization
    window.localStorage.removeItem('auth_token')
  }
}

const savedToken = window.localStorage.getItem('auth_token')
if (savedToken) setAuthToken(savedToken)

export default client
