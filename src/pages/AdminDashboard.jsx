import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAdminSummary } from '../api/admin'

function Icon({ name, size = 26 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  const icons = {
    users: (
      <svg {...common}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    shield: (
      <svg {...common}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      </svg>
    ),
    pulse: (
      <svg {...common}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    rooms: (
      <svg {...common}>
        <path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />
      </svg>
    ),
    clock: (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
    flag: (
      <svg {...common}>
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L14.7 3.86a2 2 0 0 0-3.4 0Z" />
      </svg>
    ),
    megaphone: (
      <svg {...common}>
        <path d="M3 11v3a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z" />
        <path d="M16 8a5 5 0 0 1 0 8" />
      </svg>
    ),
  }

  return icons[name] || null
}

function AdminDashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const adminName = localStorage.getItem('userName') || 'Admin'

  useEffect(() => {
    let cancelled = false

    async function loadSummary() {
      try {
        const data = await getAdminSummary()
        if (!cancelled) setSummary(data)
      } catch {
        if (!cancelled) setError('Could not load the dashboard summary.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadSummary()
    return () => {
      cancelled = true
    }
  }, [])

  const cards = summary
    ? [
        {
          key: 'totalUsers',
          label: 'Total users',
          value: summary.totalUsers,
          icon: 'users',
          color: 'blue',
        },
        {
          key: 'totalAdmins',
          label: 'Admins',
          value: summary.totalAdmins,
          icon: 'shield',
          color: 'purple',
        },
        {
          key: 'activeToday',
          label: 'Active today',
          value: summary.activeToday,
          icon: 'pulse',
          color: 'green',
        },
        {
          key: 'totalRooms',
          label: 'Study rooms',
          value: summary.totalRooms,
          icon: 'rooms',
          color: 'yellow',
        },
        {
          key: 'totalFocusMinutes',
          label: 'Focus minutes logged',
          value: summary.totalFocusMinutes,
          icon: 'clock',
          color: 'blue',
        },
        {
          key: 'openReports',
          label: 'Open reports',
          value: summary.openReports,
          icon: 'flag',
          color: 'red',
        },
        {
          key: 'activeAnnouncements',
          label: 'Active announcements',
          value: summary.activeAnnouncements,
          icon: 'megaphone',
          color: 'green',
        },
      ]
    : []

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Admin control center</p>
          <h1 className="dashboard-title">
            <span>Overview,</span> {adminName} <span className="wave">👋</span>
          </h1>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {loading ? (
        <p className="admin-loading-text">Loading dashboard…</p>
      ) : (
        <>
          <div className="admin-stats-grid">
            {cards.map((card) => (
              <div className="stat-card" key={card.key}>
                <div className={`stat-icon stat-icon-${card.color}`}>
                  <Icon name={card.icon} size={24} />
                </div>
                <div className="stat-content">
                  <p className="stat-label">{card.label}</p>
                  <div className="stat-value-row">
                    <span className="stat-value stat-value-small">{card.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-quick-links">
            <Link to="/admin/users" className="admin-quick-link">
              <span>Manage users</span>
              <span className="admin-quick-link-arrow">→</span>
            </Link>
            <Link to="/admin/analytics" className="admin-quick-link">
              <span>View study analytics</span>
              <span className="admin-quick-link-arrow">→</span>
            </Link>
            <Link to="/admin/reports" className="admin-quick-link">
              <span>Review reports &amp; issues</span>
              <span className="admin-quick-link-arrow">→</span>
            </Link>
            <Link to="/admin/announcements" className="admin-quick-link">
              <span>Post an announcement</span>
              <span className="admin-quick-link-arrow">→</span>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminDashboard
