import axios from 'axios'

const API_BASE = 'https://studypod-backend-bk64.onrender.com'

function authHeader() {
  const token = localStorage.getItem('token')
  return { headers: { Authorization: `Bearer ${token}` } }
}

export async function getTasks() {
  const response = await axios.get(`${API_BASE}/tasks`, authHeader())
  return response.data
}

export async function createTask(title, description, dueDate) {
  const response = await axios.post(
    `${API_BASE}/tasks`,
    { title, description, dueDate, status: 'PENDING' },
    authHeader()
  )
  return response.data
}

export async function updateTask(id, updates) {
  const response = await axios.put(`${API_BASE}/tasks/${id}`, updates, authHeader())
  return response.data
}

export async function deleteTask(id) {
  await axios.delete(`${API_BASE}/tasks/${id}`, authHeader())
}
