import { Navigate } from 'react-router-dom'
import { getStoredRole } from '../utils/jwt'

// Gate for every /admin/* page (other than /admin/login itself).
// A missing token, or a token that isn't for an ADMIN account, is
// bounced back to the admin login screen. Real enforcement still
// happens on the backend (SecurityConfig requires ROLE_ADMIN on
// /admin/**) — this just keeps a non-admin from ever seeing the UI.
function AdminRoute({ children }) {
  const token = localStorage.getItem('token')
  const role = getStoredRole()

  if (!token || role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default AdminRoute
