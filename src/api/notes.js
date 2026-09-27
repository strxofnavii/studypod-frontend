import axios from 'axios'

const API_BASE = 'http://localhost:8080'

function authHeader() {
  const token = localStorage.getItem('token')
  return { headers: { Authorization: `Bearer ${token}` } }
}

export async function getNotes() {
  const response = await axios.get(`${API_BASE}/notes`, authHeader())
  return response.data
}

export async function getFolders() {
  const response = await axios.get(`${API_BASE}/notes/folders`, authHeader())
  return response.data
}

export async function getNotesByFolder(folder) {
  const response = await axios.get(
    `${API_BASE}/notes/by-folder?folder=${encodeURIComponent(folder)}`,
    authHeader()
  )
  return response.data
}

export async function searchNotes(query) {
  const response = await axios.get(
    `${API_BASE}/notes/search?q=${encodeURIComponent(query)}`,
    authHeader()
  )
  return response.data
}

export async function createNote(title, content, folder = 'General') {
  const response = await axios.post(
    `${API_BASE}/notes`,
    { title, content, folder },
    authHeader()
  )
  return response.data
}

// Renames a folder by bulk-updating every note whose folder matches
// oldName to newName. Requires a matching backend endpoint.
export async function renameFolder(oldName, newName) {
  const response = await axios.put(
    `${API_BASE}/notes/folders/rename`,
    { oldName, newName },
    authHeader()
  )
  return response.data
}

// Deletes a single note by id. Requires a matching backend endpoint
// (DELETE /notes/{id}) if one doesn't already exist.
export async function deleteNote(id) {
  const response = await axios.delete(`${API_BASE}/notes/${id}`, authHeader())
  return response.data
}

export async function generateAIContent(noteContent, type) {
  const response = await axios.post(
    `${API_BASE}/ai/generate`,
    { noteContent, type },
    authHeader()
  )
  return response.data
}

export async function uploadNoteFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  const token = localStorage.getItem('token')
  const response = await axios.post(`${API_BASE}/notes/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}