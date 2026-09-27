import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { useBadgeCelebration } from '../hooks/useBadgeCelebration'

function NavIcon({ type }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
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
    case 'timer':
      return (
        <svg {...common}>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l3 2" />
          <path d="M9 3h6" />
          <path d="M12 3v2" />
        </svg>
      )
    case 'notes':
      return (
        <svg {...common}>
          <path d="M6 3h9l4 4v14H6z" />
          <path d="M14 3v5h5" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </svg>
      )
    case 'rooms':
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="10" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  const userName = localStorage.getItem('userName') || 'Student'

  // Only check for newly-earned badges once we're past the login screen
  // (i.e. a token exists). The hook itself guards against firing more
  // than once per app session / per badge.
  const isAuthenticated = location.pathname !== '/' && !!localStorage.getItem('token')
  const celebrationBadge = useBadgeCelebration(isAuthenticated)

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/study-room', label: 'Focus Timer', icon: 'timer' },
    { to: '/rooms', label: 'Study Rooms', icon: 'rooms' },
    { to: '/notes', label: 'Notes', icon: 'notes' },
  ]

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userId')
    navigate('/')
  }

  // The /admin/* section has its own sidebar (AdminLayout), so the
  // student chrome steps aside entirely for those routes — same
  // treatment as the bare login screen.
  if (location.pathname === '/' || location.pathname.startsWith('/admin')) {
    return <>{children}</>
  }

  return (
    <div className="app-layout">
      {celebrationBadge && (
        <div className="milestone-toast">
          🎉 Badge unlocked: <strong>{celebrationBadge}</strong>
        </div>
      )}

      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo-box">✦</div>
          <div>
            <h2 className="sidebar-brand-title">StudyPod</h2>
            <p className="sidebar-brand-subtitle">
              A focused space for
              <br />
              meaningful learning
            </p>
          </div>
        </div>

        <div className="sidebar-appearance-top">
          <span>Appearance</span>
          <ThemeToggle />
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to === '/rooms' && location.pathname.startsWith('/rooms'))
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar-nav-item ${isActive ? 'sidebar-nav-active' : ''}`}
              >
                <span className="sidebar-nav-icon">
                  <NavIcon type={item.icon} />
                </span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <Link
            to="/profile"
            className={`sidebar-nav-item ${location.pathname === '/profile' ? 'sidebar-nav-active' : ''}`}
          >
            <span className="sidebar-nav-icon sidebar-nav-avatar">
              {userName.charAt(0).toUpperCase()}
            </span>
            <span>{userName}</span>
          </Link>

          <button onClick={handleLogout} className="sidebar-nav-item sidebar-nav-item-logout">
            <span className="sidebar-nav-icon">
              <NavIcon type="logout" />
            </span>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="app-main">{children}</main>
    </div>
  )
}

export default Layout