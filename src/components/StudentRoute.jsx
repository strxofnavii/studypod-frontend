import { Navigate } from 'react-router-dom'
import { getStoredRole } from '../utils/jwt'

function StudentRoute({ children }) {
  const role = getStoredRole()

  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  return children
}

export default StudentRoute
