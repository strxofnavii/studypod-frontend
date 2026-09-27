import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser, registerUser } from '../api/auth'
import { decodeToken } from '../utils/jwt'
import studyWorkspace from '../assets/girl.jpg'

// Generates a random-ish field name each time the component mounts,
// so Chrome/Edge autofill heuristics can't reliably match these
// inputs to previously saved username/password entries.
function randomFieldName(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function Login() {
  const navigate = useNavigate()

  const [isRegisterMode, setIsRegisterMode] = useState(false)

  const [name, setName] = useState('')
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Random field names generated once and kept stable for the life
  // of this mount (useRef so they don't change on every re-render,
  // which would fight React's controlled-input value tracking).
  const fieldNames = useRef({
    name: randomFieldName('nm'),
    userId: randomFieldName('uid'),
    password: randomFieldName('pw'),
  })

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const data = isRegisterMode
        ? await registerUser(name, userId, password)
        : await loginUser(userId, password)

      // ==========================================
      // BACKEND LOGIC - UNCHANGED
      // ==========================================

      localStorage.setItem('token', data.token)
      localStorage.setItem('userName', data.name)
      localStorage.setItem('userId', data.userId)
      localStorage.setItem('avatarIndex', String(data.avatarIndex))

      // The role isn't in the login response body, but it's embedded
      // as a claim in the JWT itself — decode it so we know whether
      // to send this account into the student app or the admin panel.
      const payload = decodeToken(data.token)
      const role = payload?.role || 'STUDENT'
      localStorage.setItem('role', role)

      navigate(role === 'ADMIN' ? '/admin' : '/dashboard')

    } catch (err) {

      if (!err.response) {
        setError(
          'Cannot reach the server. Make sure the backend is running.'
        )
      } else {

        const message =
          err.response?.data ||
          'Something went wrong. Please try again.'

        setError(
          typeof message === 'string'
            ? message
            : 'Invalid credentials'
        )
      }

    } finally {
      setLoading(false)
    }
  }

  function toggleRegisterMode() {
    setIsRegisterMode(!isRegisterMode)
    setError('')
  }

  return (
    <div className="login-page">

      {/* ==========================================
          BACKGROUND IMAGE
      ========================================== */}

      <div
        className="login-background"
        style={{
          backgroundImage: `url(${studyWorkspace})`
        }}
      />

      <div className="login-overlay" />


      {/* ==========================================
          MAIN LOGIN CARD
      ========================================== */}

      <div className="login-card">


        {/* ========================================
            LEFT IMAGE
        ======================================== */}

        <div className="login-image-section">

          <img
            src={studyWorkspace}
            alt="Study workspace surrounded by nature"
            className="login-main-image"
          />

          <div className="login-image-overlay" />

        </div>


        {/* ========================================
            RIGHT FORM
        ======================================== */}

        <div className="login-form-section">

          <div className="login-content">


            {/* ======================================
                HEADING
            ====================================== */}

            <div className="login-heading">

              <p className="login-small-heading">
                {isRegisterMode
                  ? 'Create your space'
                  : 'Welcome back'}
              </p>

              <h1>
                {isRegisterMode ? (
                  <>
                    Start Your
                    <br />
                    <span>Study Journey</span>
                  </>
                ) : (
                  <>
                    Where
                    <br />
                    <span>Knowledge</span>
                    <br />
                    Comes Alive
                  </>
                )}
              </h1>

              <p className="login-description">
                {isRegisterMode
                  ? 'Create your StudyPod account and build a focused learning routine.'
                  : "Your pod's been waiting. Let's pick up the streak."}
              </p>

            </div>


            {/* ======================================
                FORM
            ====================================== */}

            <form
              onSubmit={handleSubmit}
              className="login-form"
              autoComplete="off"
            >

              {/* ======================================
                  DECOY FIELDS
                  Hidden from view and from screen readers/tab
                  order, but present in the DOM so Chrome's
                  autofill heuristics latch onto these instead
                  of the real inputs below. Must NOT use
                  display:none or visibility:hidden — some
                  autofill engines skip those. Off-screen
                  positioning + zero size is what works.
              ====================================== */}

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
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  tabIndex={-1}
                />
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  tabIndex={-1}
                />
              </div>


              {/* NAME - REGISTER ONLY */}

              {isRegisterMode && (
                <div className="input-group">

                  <label htmlFor={fieldNames.current.name}>
                    Name
                  </label>

                  <input
                    id={fieldNames.current.name}
                    name={fieldNames.current.name}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="off"
                    required
                  />

                </div>
              )}


              {/* USER ID */}

              <div className="input-group">

                <label htmlFor={fieldNames.current.userId}>
                  User ID
                </label>

                <input
                  id={fieldNames.current.userId}
                  name={fieldNames.current.userId}
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter your user ID"
                  autoComplete="off"
                  required
                />

              </div>


              {/* PASSWORD */}

              <div className="input-group">

                <label htmlFor={fieldNames.current.password}>
                  Password
                </label>

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


              {/* ERROR */}

              {error && (
                <p className="login-error">
                  {error}
                </p>
              )}


              {/* SUBMIT BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="login-submit"
              >
                {loading
                  ? 'Please wait...'
                  : isRegisterMode
                    ? 'Create Account'
                    : 'Sign In'}
              </button>


              {/* SWITCH LOGIN / REGISTER */}

              <p className="switch-auth">

                {isRegisterMode
                  ? 'Already have an account?'
                  : 'New here?'}

                {' '}

                <button
                  type="button"
                  onClick={toggleRegisterMode}
                >
                  {isRegisterMode
                    ? 'Sign in'
                    : 'Create an account'}
                </button>

              </p>

            </form>


            {/* ======================================
                STUDYPOD BRANDING
            ====================================== */}

            <div className="login-footer">

              <div className="footer-logo">
                ✦
              </div>

              <div>

                <p className="footer-title">
                  StudyPod
                </p>

                <p className="footer-subtitle">
                  A focused space for meaningful learning
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Login
