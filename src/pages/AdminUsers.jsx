import { useState, useEffect, useCallback } from 'react'
import { getAdminUsers, updateUserRole, updateUserStatus, deleteAdminUser } from '../api/admin'
import { getStoredUserInternalId } from '../utils/jwt'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState(null)

  const currentAdminId = getStoredUserInternalId()

  const loadUsers = useCallback(async (searchTerm) => {
    setLoading(true)
    setError('')
    try {
      const data = await getAdminUsers(searchTerm)
      setUsers(data)
    } catch {
      setError('Could not load users.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers('')
  }, [loadUsers])

  // Debounced search — waits for a short pause in typing before
  // hitting the backend's search endpoint.
  useEffect(() => {
    const timeout = setTimeout(() => {
      loadUsers(search)
    }, 350)
    return () => clearTimeout(timeout)
  }, [search, loadUsers])

  async function handleRoleChange(user, newRole) {
    if (newRole === user.role) return
    setBusyId(user.id)
    setError('')
    try {
      const updated = await updateUserRole(user.id, newRole)
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)))
    } catch (err) {
      setError(err.response?.data || 'Could not update role.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleStatusToggle(user) {
    const newStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'
    setBusyId(user.id)
    setError('')
    try {
      const updated = await updateUserStatus(user.id, newStatus)
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)))
    } catch (err) {
      setError(err.response?.data || 'Could not update status.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`Delete ${user.name} (${user.userId})? This cannot be undone.`)) return
    setBusyId(user.id)
    setError('')
    try {
      await deleteAdminUser(user.id)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
    } catch (err) {
      setError(err.response?.data || 'Could not delete user.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Admin control center</p>
          <h1 className="dashboard-title">
            <span>User</span> Management
          </h1>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      <div className="admin-panel">
        <div className="tasks-panel-header">
          <h2>All users</h2>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by name or user ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="admin-loading-text">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="empty-task-message">No users found.</p>
        ) : (
          <div className="admin-table">
            <div className="admin-table-row admin-table-head">
              <span>Name</span>
              <span>User ID</span>
              <span>Role</span>
              <span>Status</span>
              <span>Streak</span>
              <span>Actions</span>
            </div>

            {users.map((user) => {
              const isSelf = user.id === currentAdminId
              const isBusy = busyId === user.id

              return (
                <div className="admin-table-row" key={user.id}>
                  <span className="admin-cell-primary">{user.name}</span>
                  <span className="admin-cell-muted">{user.userId}</span>

                  <span>
                    <select
                      className="admin-select"
                      value={user.role}
                      disabled={isSelf || isBusy}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </span>

                  <span>
                    <span
                      className={`status-badge ${
                        user.status === 'SUSPENDED' ? 'status-badge-suspended' : 'status-badge-active'
                      }`}
                    >
                      {user.status === 'SUSPENDED' ? 'Suspended' : 'Active'}
                    </span>
                  </span>

                  <span className="admin-cell-muted">🔥 {user.loginStreak}</span>

                  <span className="admin-row-actions">
                    <button
                      className="admin-btn admin-btn-secondary"
                      disabled={isSelf || isBusy}
                      onClick={() => handleStatusToggle(user)}
                    >
                      {user.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                    </button>
                    <button
                      className="admin-btn admin-btn-danger"
                      disabled={isSelf || isBusy}
                      onClick={() => handleDelete(user)}
                    >
                      Delete
                    </button>
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers
