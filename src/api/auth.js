import axios from 'axios'

const API_BASE = 'http://localhost:8080'

function authHeader() {
  const token = localStorage.getItem('token')
  return { headers: { Authorization: `Bearer ${token}` } }
}

export async function loginUser(userId, password) {
  const response = await axios.post(`${API_BASE}/auth/login`, { userId, password })
  return response.data
}

export async function registerUser(name, userId, password) {
  const response = await axios.post(`${API_BASE}/auth/register`, { name, userId, password })
  return response.data
}

export async function updateAvatar(avatarIndex) {
  const response = await axios.put(`${API_BASE}/auth/avatar`, { avatarIndex }, authHeader())
  return response.data
}