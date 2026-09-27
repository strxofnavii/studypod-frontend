import axios from 'axios'

const API_BASE = 'http://localhost:8080'

function authHeader() {
  const token = localStorage.getItem('token')

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
}

// ---------- Admin auth ----------

export async function adminLogin(userId, password) {
  const response = await axios.post(
    `${API_BASE}/auth/admin/login`,
    {
      userId,
      password
    }
  )

  return response.data
}

// ---------- Dashboard ----------

export async function getAdminSummary() {
  const response = await axios.get(
    `${API_BASE}/admin/dashboard/summary`,
    authHeader()
  )

  return response.data
}

// ---------- User management ----------

export async function getAdminUsers(search) {
  const response = await axios.get(
    `${API_BASE}/admin/users`,
    {
      ...authHeader(),
      params: search
        ? { search }
        : {}
    }
  )

  return response.data
}

export async function updateUserRole(id, role) {
  const response = await axios.put(
    `${API_BASE}/admin/users/${id}/role`,
    { role },
    authHeader()
  )

  return response.data
}

export async function updateUserStatus(id, status) {
  const response = await axios.put(
    `${API_BASE}/admin/users/${id}/status`,
    { status },
    authHeader()
  )

  return response.data
}

export async function deleteAdminUser(id) {
  await axios.delete(
    `${API_BASE}/admin/users/${id}`,
    authHeader()
  )
}

// ---------- Study analytics ----------

export async function getAdminAnalytics() {
  const response = await axios.get(
    `${API_BASE}/admin/analytics`,
    authHeader()
  )

  return response.data
}

// ---------- Announcements ----------

export async function getAdminAnnouncements() {
  const response = await axios.get(
    `${API_BASE}/admin/announcements`,
    authHeader()
  )

  return response.data
}

export async function createAnnouncement(
  title,
  message,
  active = true
) {
  const response = await axios.post(
    `${API_BASE}/admin/announcements`,
    {
      title,
      message,
      active
    },
    authHeader()
  )

  return response.data
}

export async function updateAnnouncement(
  id,
  updates
) {
  const response = await axios.put(
    `${API_BASE}/admin/announcements/${id}`,
    updates,
    authHeader()
  )

  return response.data
}

export async function deleteAnnouncement(id) {
  await axios.delete(
    `${API_BASE}/admin/announcements/${id}`,
    authHeader()
  )
}

// ---------- Reports / issues ----------

export async function getAdminReports(status) {
  const response = await axios.get(
    `${API_BASE}/admin/reports`,
    {
      ...authHeader(),
      params: status
        ? { status }
        : {}
    }
  )

  return response.data
}

export async function updateReportStatus(
  id,
  status,
  adminNote
) {
  const response = await axios.put(
    `${API_BASE}/admin/reports/${id}/status`,
    {
      status,
      adminNote
    },
    authHeader()
  )

  return response.data
}