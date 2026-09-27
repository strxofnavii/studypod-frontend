import { Link, useLocation, useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

function AdminNavIcon({ type }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  switch (type) {
    case 'dashboard':
      return (
        <svg {...common}>
          <path d="M3 13h7V3H3v10Z" />
          <path d="M14 21h7V11h-7v10Z" />
          <path d="M14 3h7v4h-7V3Z" />
          <path d="M3 17h7v4H3v-4Z" />
        </svg>
      )
    case 'users':
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="10" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'analytics':
      return (
        <svg {...common}>
          <path d="M3 3v18h18" />
          <path d="M7 15l4-6 3 4 5-8" />
        </svg>
      )
    case 'reports':
      return (
        <svg {...common}>
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L14.7 3.86a2 2 0 0 0-3.4 0Z" />
        </svg>
      )
    case 'announcements':
      return (
        <svg {...common}>
          <path d="M3 11v3a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z" />
          <path d="M16 8a5 5 0 0 1 0 8" />
          <path d="M19 5a9 9 0 0 1 0 14" />
        </svg>
      )
    case 'logout':
      return (
        <svg {...common}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      )
    default:
      return null
  }
}

function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  const adminName = localStorage.getItem('userName') || 'Admin'

  const navItems = [
    { to: '/admin', label: 'Admin Dashboard', icon: 'dashboard' },
    { to: '/admin/users', label: 'User Management', icon: 'users' },
    { to: '/admin/analytics', label: 'Study Analytics', icon: 'analytics' },
    { to: '/admin/reports', label: 'Reports & Issues', icon: 'reports' },
    { to: '/admin/announcements', label: 'Announcements', icon: 'announcements' },
  ]

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userId')
    localStorage.removeItem('role')
    navigate('/admin/login')
  }

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo-box">✦</div>
          <div>
            <h2 className="sidebar-brand-title">StudyPod</h2>
            <p className="sidebar-brand-subtitle">
              Admin control
              <br />
              center
            </p>
          </div>
        </div>

        <div className="sidebar-appearance-top">
          <span>Appearance</span>
          <ThemeToggle />
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-nav-item ${isActive ? 'sidebar-nav-active' : ''}`}
              >
                <span className="sidebar-nav-icon">
                  <AdminNavIcon type={item.icon} />
                </span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-nav-item sidebar-admin-name">
            <span className="sidebar-nav-icon sidebar-nav-avatar">
              {adminName.charAt(0).toUpperCase()}
            </span>
            <span>{adminName}</span>
          </div>

          <button onClick={handleLogout} className="sidebar-nav-item sidebar-nav-item-logout">
            <span className="sidebar-nav-icon">
              <AdminNavIcon type="logout" />
            </span>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="app-main">{children}</main>
    </div>
  )
}

export default AdminLayout