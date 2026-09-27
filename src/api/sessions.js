import axios from 'axios'

const API_BASE = 'http://localhost:8080'

function authHeader() {
  const token = localStorage.getItem('token')
  return { headers: { Authorization: `Bearer ${token}` } }
}

export async function startSession(type) {
  const response = await axios.post(`${API_BASE}/sessions/start`, { type }, authHeader())
  return response.data
}

export async function endSession(id) {
  const response = await axios.put(`${API_BASE}/sessions/${id}/end`, {}, authHeader())
  return response.data
}
export async function getSessionStats() {
  const response = await axios.get(`${API_BASE}/sessions/stats`, authHeader())
  return response.data
}

export async function getTodaysLeaderboard() {
  const response = await axios.get(`${API_BASE}/sessions/leaderboard/today`, authHeader())
  return response.data
}