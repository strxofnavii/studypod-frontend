import { useState, useEffect } from 'react'
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks'
import { getSessionStats } from '../api/sessions'
import { getActiveAnnouncements } from '../api/announcements'

/* =====================================================
   ICONS
===================================================== */

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }

  const icons = {
    plus: (
      <svg {...common}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    ),

    flame: (
      <svg {...common}>
        <path d="M12 22c4.2 0 7-3 7-7.1 0-3.4-1.9-5.9-4.8-8.9.1 2.5-1.1 4-2.5 4.8.1-3.8-1.5-6.1-4-7.8.3 4.5-3.2 6.7-3.2 11.1C4.5 18.8 7.4 22 12 22Z" />
      </svg>
    ),

    clock: (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),

    arrow: (
      <svg {...common}>
        <path d="M5 12h13" />
        <path d="m14 7 5 5-5 5" />
      </svg>
    ),

    calendarSmall: (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4" />
        <path d="M8 3v4" />
        <path d="M3 10h18" />
      </svg>
    )
  }

  return icons[name] || null
}

/* =====================================================
   DASHBOARD
===================================================== */

function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDueDate, setNewDueDate] = useState('')

  const [stats, setStats] = useState({
    totalFocusMinutes: 0,
    currentStreak: 0,
    completedSessions: 0
  })

  // Admin announcements only
  const [announcements, setAnnouncements] = useState([])

  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem('dismissedAnnouncements') || '[]'
      )
    } catch {
      return []
    }
  })

  const userName = localStorage.getItem('userName') || 'Student'

  /* =====================================================
     LOAD DASHBOARD DATA
  ===================================================== */

  useEffect(() => {
    loadTasks()
    loadStats()
    loadAnnouncements()
  }, [])

  /* =====================================================
     ANNOUNCEMENTS
  ===================================================== */

  async function loadAnnouncements() {
    try {
      const data = await getActiveAnnouncements()
      setAnnouncements(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Could not load announcements')
    }
  }

  function dismissAnnouncement(id) {
    const updated = [...dismissedIds, id]

    setDismissedIds(updated)

    sessionStorage.setItem(
      'dismissedAnnouncements',
      JSON.stringify(updated)
    )
  }

  const visibleAnnouncements = announcements.filter(
    (announcement) => !dismissedIds.includes(announcement.id)
  )

  /* =====================================================
     STATS
  ===================================================== */

  async function loadStats() {
    try {
      const data = await getSessionStats()
      setStats(data)
    } catch (err) {
      console.error('Could not load stats')
    }
  }

  /* =====================================================
     TASKS
  ===================================================== */

  async function loadTasks() {
    setLoading(true)
    setError('')

    try {
      const data = await getTasks()
      setTasks(data)
    } catch (err) {
      setError('Could not load tasks. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddTask(e) {
    e.preventDefault()

    if (!newTitle.trim()) return

    try {
      await createTask(
        newTitle,
        '',
        newDueDate || null
      )

      setNewTitle('')
      setNewDueDate('')
      setShowForm(false)

      loadTasks()
    } catch (err) {
      setError('Could not create task.')
    }
  }

  async function toggleTaskStatus(task) {
    const newStatus =
      task.status === 'DONE'
        ? 'PENDING'
        : 'DONE'

    try {
      await updateTask(task.id, {
        ...task,
        status: newStatus
      })

      loadTasks()
    } catch (err) {
      setError('Could not update task.')
    }
  }

  async function handleDeleteTask(id) {
    try {
      await deleteTask(id)
      loadTasks()
    } catch (err) {
      setError('Could not delete task.')
    }
  }

  /* =====================================================
     HELPERS
  ===================================================== */

  function formatDueDate(date) {
    if (!date) return ''

    const today = new Date()
    const taskDate = new Date(date)

    const todayString =
      today.toISOString().split('T')[0]

    const taskString =
      taskDate.toISOString().split('T')[0]

    if (todayString === taskString) {
      return 'Today'
    }

    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const tomorrowString =
      tomorrow.toISOString().split('T')[0]

    if (tomorrowString === taskString) {
      return 'Tomorrow'
    }

    return taskDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    })
  }

  function getTaskCategory(index) {
    const categories = [
      'Project',
      'Study',
      'Study',
      'Personal',
      'Study'
    ]

    return categories[index % categories.length]
  }

  function getCategoryClass(category) {
    if (category === 'Project') {
      return 'task-tag task-tag-project'
    }

    if (category === 'Personal') {
      return 'task-tag task-tag-personal'
    }

    return 'task-tag task-tag-study'
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="dashboard-page">

      {/* =================================================
          TOP HEADER
      ================================================= */}

      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">
            Every focused moment brings you closer to your goals.
          </p>

          <h1 className="dashboard-title">
            Welcome back, <span>{userName}!</span>
            <span className="wave">👋</span>
          </h1>
        </div>
      </header>

      {/* =================================================
          ADMIN ANNOUNCEMENTS
      ================================================= */}

      {visibleAnnouncements.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '20px'
          }}
        >
          {visibleAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                background: 'rgba(23, 179, 201, 0.08)',
                border: '1px solid rgba(23, 179, 201, 0.35)',
                borderRadius: '10px',
                padding: '14px 16px'
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    fontSize: '14.5px'
                  }}
                >
                  📢 {announcement.title}
                </p>

                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: '13.5px',
                    color: '#9aa3b2',
                    lineHeight: 1.5
                  }}
                >
                  {announcement.message}
                </p>
              </div>

              <button
                onClick={() =>
                  dismissAnnouncement(announcement.id)
                }
                aria-label="Dismiss announcement"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9aa3b2',
                  fontSize: '18px',
                  lineHeight: 1,
                  cursor: 'pointer',
                  padding: '2px 4px',
                  flexShrink: 0
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* =================================================
          MAIN DASHBOARD GRID
      ================================================= */}

      <section className="dashboard-body-grid">

        <div className="dashboard-left-col">

          {/* =================================================
              STATS
          ================================================= */}

          <div className="stats-grid">

            <div className="stat-card">
              <div className="stat-icon stat-icon-green">
                <Icon name="flame" size={27} />
              </div>

              <div className="stat-content">
                <p className="stat-label">
                  Current Streak
                </p>

                <div className="stat-value-row">
                  <span className="stat-value">
                    {stats.currentStreak}
                  </span>

                  <span className="stat-unit">
                    days
                  </span>
                </div>

                <p className="stat-description">
                  🔥 Keep it going!
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <Icon name="clock" size={27} />
              </div>

              <div className="stat-content">
                <p className="stat-label">
                  Total Focus
                </p>

                <div className="stat-value-row">
                  <span className="stat-value">
                    {Math.floor(
                      stats.totalFocusMinutes / 60
                    )}
                  </span>

                  <span className="stat-unit">
                    h
                  </span>

                  <span className="stat-value stat-value-small">
                    {stats.totalFocusMinutes % 60}
                  </span>

                  <span className="stat-unit">
                    m
                  </span>
                </div>

                <p className="stat-description">
                  This week
                </p>
              </div>
            </div>

          </div>

          {/* =================================================
              TASKS
          ================================================= */}

          <div className="tasks-panel">

            <div className="tasks-panel-header">
              <h2>Your Tasks</h2>

              <button
                onClick={() => setShowForm(!showForm)}
                className="new-task-button"
              >
                <Icon name="plus" size={18} />

                {showForm
                  ? 'Cancel'
                  : 'New Task'}
              </button>
            </div>

            {showForm && (
              <form
                onSubmit={handleAddTask}
                className="new-task-form"
              >
                <div className="new-task-input-wrapper">
                  <label>
                    Task title
                  </label>

                  <input
                    value={newTitle}
                    onChange={(e) =>
                      setNewTitle(e.target.value)
                    }
                    placeholder="e.g. Revise Chapter 4"
                    required
                  />
                </div>

                <div className="new-task-date-wrapper">
                  <label>
                    Due date
                  </label>

                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) =>
                      setNewDueDate(e.target.value)
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="add-task-submit"
                >
                  Add
                </button>
              </form>
            )}

            <div className="task-list">

              {loading ? (
                <div className="empty-task-message">
                  Loading tasks...
                </div>

              ) : tasks.length === 0 ? (
                <div className="empty-task-message">
                  No tasks yet — add your first one above.
                </div>

              ) : (
                tasks
                  .slice(0, 6)
                  .map((task, index) => {

                    const category =
                      getTaskCategory(index)

                    const isDone =
                      task.status === 'DONE'

                    return (
                      <div
                        key={task.id}
                        className={`task-row ${
                          isDone
                            ? 'task-row-done'
                            : ''
                        }`}
                      >

                        <button
                          onClick={() =>
                            toggleTaskStatus(task)
                          }
                          className={`task-checkbox ${
                            isDone
                              ? 'task-checkbox-done'
                              : ''
                          }`}
                          aria-label="Toggle task"
                        >
                          {isDone && '✓'}
                        </button>

                        <button
                          onClick={() =>
                            toggleTaskStatus(task)
                          }
                          className="task-title-button"
                        >
                          <span
                            className={
                              isDone
                                ? 'task-title completed'
                                : 'task-title'
                            }
                          >
                            {task.title}
                          </span>
                        </button>

                        <span
                          className={getCategoryClass(
                            category
                          )}
                        >
                          {category}
                        </span>

                        <div className="task-date">

                          {task.dueDate && (
                            <>
                              <Icon
                                name="calendarSmall"
                                size={15}
                              />

                              <span>
                                {formatDueDate(
                                  task.dueDate
                                )}
                              </span>
                            </>
                          )}

                        </div>

                        <button
                          onClick={() =>
                            handleDeleteTask(task.id)
                          }
                          className="task-delete"
                          aria-label="Delete task"
                        >
                          ×
                        </button>

                      </div>
                    )
                  })
              )}

            </div>

            {tasks.length > 6 && (
              <button className="view-all-button">
                View all tasks
                <Icon
                  name="arrow"
                  size={17}
                />
              </button>
            )}

          </div>

        </div>

        {/* =================================================
            STUDY IMAGE
        ================================================= */}

        <div className="study-image-card">
          <img
            src="/src/assets/study-workspace.png"
            alt="Study workspace"
            className="study-dashboard-image"
          />
        </div>

      </section>

    </div>
  )
}

export default Dashboard
