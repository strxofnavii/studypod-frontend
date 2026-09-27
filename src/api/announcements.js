import axios from 'axios'

const API_BASE = 'https://studypod-backend-bk64.onrender.com'

function authHeader() {
  const token = localStorage.getItem('token')
  return { headers: { Authorization: `Bearer ${token}` } }
}

// Public-to-students endpoint — returns only announcements the admin
// has marked active, newest first. Each item also carries
// completedByMe/completionCount for challenge-type announcements.
export async function getActiveAnnouncements() {
  const response = await axios.get(`${API_BASE}/announcements/active`, authHeader())
  return response.data
}

// Student marks a challenge announcement as done. Safe to call more
// than once — the backend just returns the existing completion.
export async function completeChallenge(id) {
  const response = await axios.post(`${API_BASE}/announcements/${id}/complete`, {}, authHeader())
  return response.data
}
