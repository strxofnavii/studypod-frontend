import axios from 'axios'

const API_BASE = 'http://localhost:8080'

function authHeader() {
  const token = localStorage.getItem('token')
  return { headers: { Authorization: `Bearer ${token}` } }
}

// ---------- Room management ----------

export async function getMyRooms() {
  const response = await axios.get(`${API_BASE}/rooms/my`, authHeader())
  return response.data
}

export async function createRoom(name, description) {
  const response = await axios.post(
    `${API_BASE}/rooms`,
    { name, description },
    authHeader()
  )
  return response.data
}

export async function getRoomDetails(roomId) {
  const response = await axios.get(`${API_BASE}/rooms/${roomId}`, authHeader())
  return response.data
}

export async function joinRoom(joinCode) {
  const response = await axios.post(
    `${API_BASE}/rooms/join/${joinCode}`,
    {},
    authHeader()
  )
  return response.data
}

export async function leaveRoom(roomId) {
  const response = await axios.post(
    `${API_BASE}/rooms/${roomId}/leave`,
    {},
    authHeader()
  )
  return response.data
}

export async function getMembers(roomId) {
  const response = await axios.get(`${API_BASE}/rooms/${roomId}/members`, authHeader())
  return response.data
}

// ---------- Chat ----------

export async function getChatMessages(roomId) {
  const response = await axios.get(`${API_BASE}/rooms/${roomId}/chat`, authHeader())
  return response.data
}

export async function sendChatMessage(roomId, content) {
  const response = await axios.post(
    `${API_BASE}/rooms/${roomId}/chat`,
    { content },
    authHeader()
  )
  return response.data
}

// ---------- Shared notes ----------

export async function getRoomNotes(roomId) {
  const response = await axios.get(`${API_BASE}/rooms/${roomId}/notes`, authHeader())
  return response.data
}

export async function createRoomNote(roomId, title, content) {
  const response = await axios.post(
    `${API_BASE}/rooms/${roomId}/notes`,
    { title, content },
    authHeader()
  )
  return response.data
}

export async function updateRoomNote(roomId, noteId, updates) {
  const response = await axios.put(
    `${API_BASE}/rooms/${roomId}/notes/${noteId}`,
    updates,
    authHeader()
  )
  return response.data
}

export async function deleteRoomNote(roomId, noteId) {
  await axios.delete(`${API_BASE}/rooms/${roomId}/notes/${noteId}`, authHeader())
}

// ---------- Task board ----------

export async function getRoomTasks(roomId) {
  const response = await axios.get(`${API_BASE}/rooms/${roomId}/tasks`, authHeader())
  return response.data
}

export async function createRoomTask(roomId, title, description, dueDate) {
  const response = await axios.post(
    `${API_BASE}/rooms/${roomId}/tasks`,
    { title, description, dueDate, status: 'TODO' },
    authHeader()
  )
  return response.data
}

export async function updateRoomTask(roomId, taskId, updates) {
  const response = await axios.put(
    `${API_BASE}/rooms/${roomId}/tasks/${taskId}`,
    updates,
    authHeader()
  )
  return response.data
}

export async function deleteRoomTask(roomId, taskId) {
  await axios.delete(`${API_BASE}/rooms/${roomId}/tasks/${taskId}`, authHeader())
}