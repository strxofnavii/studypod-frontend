import { useState, useEffect } from 'react'
import { getAdminAnalytics } from '../api/admin'

function DailyFocusChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="empty-task-message">No focus sessions logged yet.</p>
  }

  const max = Math.max(...data.map((d) => d.minutes), 1)

  return (
    <div className="admin-bar-chart">
      {data.map((day) => (
        <div className="admin-bar-column" key={day.date}>
          <div
            className="admin-bar"
            style={{ height: `${Math.max((day.minutes / max) * 100, 3)}%` }}
            title={`${day.date}: ${day.minutes} min`}
          />
          <span className="admin-bar-label">{day.date?.slice(5)}</span>
        </div>
      ))}
    </div>
  )
}

function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getAdminAnalytics()
        if (!cancelled) setAnalytics(data)
      } catch {
        if (!cancelled) setError('Could not load analytics.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const focusMinutes = analytics?.sessionTypeBreakdown?.FOCUS || 0
  const breakMinutes = analytics?.sessionTypeBreakdown?.BREAK || 0
  const totalTypeMinutes = focusMinutes + breakMinutes || 1
  const focusPercent = Math.round((focusMinutes / totalTypeMinutes) * 100)

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Admin control center</p>
          <h1 className="dashboard-title">
            <span>Study</span> Analytics
          </h1>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {loading ? (
        <p className="admin-loading-text">Loading analytics…</p>
      ) : (
        <>
          <div className="admin-stats-grid admin-stats-grid-3">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">👥</div>
              <div className="stat-content">
                <p className="stat-label">Total users</p>
                <div className="stat-value-row">
                  <span className="stat-value stat-value-small">{analytics.totalUsers}</span>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-green">⏱️</div>
              <div className="stat-content">
                <p className="stat-label">Total focus minutes</p>
                <div className="stat-value-row">
                  <span className="stat-value stat-value-small">{analytics.totalFocusMinutes}</span>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-yellow">📈</div>
              <div className="stat-content">
                <p className="stat-label">Active today</p>
                <div className="stat-value-row">
                  <span className="stat-value stat-value-small">{analytics.activeToday}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-body-grid admin-analytics-grid">
            <div className="admin-panel">
              <div className="tasks-panel-header">
                <h2>Daily focus — last 30 days</h2>
              </div>
              <DailyFocusChart data={analytics.dailyFocus} />
            </div>

            <div className="leaderboard-panel">
              <div className="tasks-panel-header">
                <h2>🏆 Top users, all-time</h2>
              </div>

              {analytics.topUsers?.length === 0 ? (
                <p className="empty-task-message">No sessions logged yet.</p>
              ) : (
                <div className="leaderboard-list">
                  {analytics.topUsers.map((user, index) => (
                    <div className="leaderboard-row" key={`${user.name}-${index}`}>
                      <span className="leaderboard-rank">{index + 1}</span>
                      <span className="leaderboard-name">{user.name}</span>
                      <span className="leaderboard-time">{user.totalMinutes} min</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="admin-panel admin-session-split">
            <div className="tasks-panel-header">
              <h2>Focus vs. break time</h2>
            </div>
            <div className="admin-split-bar">
              <div className="admin-split-bar-focus" style={{ width: `${focusPercent}%` }} />
            </div>
            <div className="admin-split-legend">
              <span><span className="admin-legend-dot admin-legend-dot-focus" /> Focus — {focusMinutes} min</span>
              <span><span className="admin-legend-dot admin-legend-dot-break" /> Break — {breakMinutes} min</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminAnalytics
