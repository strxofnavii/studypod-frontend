import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../api/admin'
import { decodeToken } from '../utils/jwt'
import lampImage from '../assets/lamp.png'

// See Login.jsx for why the field names are randomized — same
// autofill-avoidance trick applies here.
function randomFieldName(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function AdminLogin() {
  const navigate = useNavigate()

  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fieldNames = useRef({
    userId: randomFieldName('auid'),
    password: randomFieldName('apw'),
  })

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const data = await adminLogin(userId, password)

      localStorage.setItem('token', data.token)
      localStorage.setItem('userName', data.name)
      localStorage.setItem('userId', data.userId)
      localStorage.setItem('avatarIndex', String(data.avatarIndex))

      const payload = decodeToken(data.token)
      localStorage.setItem('role', payload?.role || 'ADMIN')

      navigate('/admin')
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach the server. Make sure the backend is running.')
      } else {
        const message = err.response?.data || 'Something went wrong. Please try again.'
        setError(typeof message === 'string' ? message : 'Invalid credentials')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div
        className="login-background"
        style={{ backgroundImage: `url(${lampImage})` }}
      />

      <div className="login-overlay" />

      <div className="login-card">
        <div className="login-image-section">
          <img
            src={lampImage}
            alt="Focused workspace"
            className="login-main-image"
          />
          <div className="login-image-overlay" />
        </div>

        <div className="login-form-section">
          <div className="login-content">
            <div className="login-heading">
              <p className="login-small-heading">Admin access</p>

              <h1>
                Run the
                <br />
                <span>Control Room</span>
              </h1>

              <p className="login-description">
                Sign in with an administrator account to manage users, monitor
                study analytics, and keep StudyPod running smoothly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  width: 0,
                  height: 0,
                  overflow: 'hidden',
                  left: '-9999px',
                  top: '-9999px',
                }}
              >
                <input type="text" name="username" autoComplete="username" tabIndex={-1} />
                <input type="password" name="password" autoComplete="new-password" tabIndex={-1} />
              </div>

              <div className="input-group">
                <label htmlFor={fieldNames.current.userId}>Admin User ID</label>
                <input
                  id={fieldNames.current.userId}
                  name={fieldNames.current.userId}
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter admin user ID"
                  autoComplete="off"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor={fieldNames.current.password}>Password</label>
                <input
                  id={fieldNames.current.password}
                  name={fieldNames.current.password}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>

              {error && <p className="login-error">{error}</p>}

              <button type="submit" disabled={loading} className="login-submit">
                {loading ? 'Please wait...' : 'Sign In'}
              </button>

              <p className="switch-auth">
                Not an admin?{' '}
                <button type="button" onClick={() => navigate('/')}>
                  Go to student login
                </button>
              </p>
            </form>

            <div className="login-footer">
              <div className="footer-logo">✦</div>
              <div>
                <p className="footer-title">StudyPod</p>
                <p className="footer-subtitle">Admin control center</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
