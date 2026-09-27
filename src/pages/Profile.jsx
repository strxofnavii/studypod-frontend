import { useState, useEffect, useRef } from 'react'
import { getSessionStats } from '../api/sessions'

// Import your 3 mascot images
import mascot1 from '../assets/mascot1.png'
import mascot2 from '../assets/mascot2.png'
import mascot3 from '../assets/mascot3.png'

// All available mascots
const mascotVariants = [
  mascot1,
  mascot2,
  mascot3,
]

// Pick a consistent mascot for the same user
function pickMascotForUser(userId) {
  let hash = 0

  for (let i = 0; i < userId.length; i++) {
    hash =
      (hash << 5) -
      hash +
      userId.charCodeAt(i)

    hash |= 0
  }

  const index =
    Math.abs(hash) % mascotVariants.length

  return index
}

// ===========================================================
// HEATMAP HELPERS
// ===========================================================

const CELL_SIZE = 12
const CELL_GAP = 3

// Build a Sun-Sat grid of weeks covering the last 365 days (like
// GitHub's contribution graph), filling in actual minutes where we
// have data and null for padding cells.
function buildYearHeatmap(dailyFocus) {
  const minutesByDate = {}
  dailyFocus.forEach((entry) => {
    if (entry && entry.date) {
      minutesByDate[entry.date] = Number(entry.minutes) || 0
    }
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const DAYS_BACK = 364 // 365 days total including today
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - DAYS_BACK)

  // Pad the front so the grid starts on Sunday
  const startPadding = startDate.getDay()
  const gridStart = new Date(startDate)
  gridStart.setDate(gridStart.getDate() - startPadding)

  const days = []
  const cursor = new Date(gridStart)

  while (cursor <= today) {
    const y = cursor.getFullYear()
    const m = cursor.getMonth()
    const d = cursor.getDate()
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

    const inRange = cursor >= startDate && cursor <= today

    days.push({
      date: dateStr,
      day: d,
      month: m,
      dayOfWeek: cursor.getDay(),
      minutes: inRange ? (minutesByDate[dateStr] || 0) : null,
      inRange,
    })

    cursor.setDate(cursor.getDate() + 1)
  }

  // Trailing padding so the last week is a full column of 7
  while (days.length % 7 !== 0) {
    days.push(null)
  }

  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  // Figure out which week-column each month label should sit above
  // (label the column containing the 1st occurrence of a new month)
  const monthLabels = []
  let lastMonth = null
  weeks.forEach((week, wi) => {
    const firstValid = week.find((d) => d && d.inRange)
    if (firstValid && firstValid.month !== lastMonth) {
      monthLabels.push({
        weekIndex: wi,
        label: new Date(2000, firstValid.month, 1).toLocaleString('default', {
          month: 'short',
        }),
      })
      lastMonth = firstValid.month
    }
  })

  return { weeks, monthLabels }
}

// Absolute thresholds (in minutes), not relative to the busiest day.
// A single 2-minute day should look faint, not maxed-out — relative
// scaling was making the *only* active day always render as "most
// intense" since it was 100% of that day's own max.
function getIntensityLevel(minutes) {
  if (minutes <= 0) return 0
  if (minutes < 15) return 1
  if (minutes < 30) return 2
  if (minutes < 60) return 3
  return 4
}

function formatTooltipDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('default', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// Brand-cyan scale with real contrast between steps
const HEATMAP_COLORS = ['#1b1f2a', '#0b4a52', '#0a7a86', '#17b3c9', '#5eeaf5']
const HEATMAP_BORDER = 'rgba(255,255,255,0.07)'

// Only label every other row (Mon, Wed, Fri) to match GitHub's style
const DAY_ROW_LABELS = { 1: 'Mon', 3: 'Wed', 5: 'Fri' }

function Profile() {
  const [stats, setStats] = useState({
    totalFocusMinutes: 0,
    currentStreak: 0,
    completedSessions: 0,
    dailyFocus: [],
  })

  const [hoveredCell, setHoveredCell] = useState(null)
  const heatmapScrollRef = useRef(null)

  const userName =
    localStorage.getItem('userName') || 'Student'

  const userId =
    localStorage.getItem('userId') || userName

  // Avatar is fixed per-user (hash-based), no picker/edit anymore
  const avatarIndex = pickMascotForUser(userId)
  const mascotImage = mascotVariants[avatarIndex] || mascotVariants[0]

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getSessionStats()

        console.log(
          'Profile stats:',
          data
        )

        setStats({
          totalFocusMinutes:
            Number(data.totalFocusMinutes) || 0,

          currentStreak:
            Number(data.currentStreak) || 0,

          completedSessions:
            Number(data.completedSessions) || 0,

          // Expected shape: [{ date: 'YYYY-MM-DD', minutes: number }, ...]
          dailyFocus:
            Array.isArray(data.dailyFocus)
              ? data.dailyFocus
              : [],
        })
      } catch (err) {
        console.error(
          'Could not load stats:',
          err
        )
      }
    }

    loadStats()
  }, [])

  // Auto-scroll the heatmap to today's column so the current week
  // is visible immediately, without needing to hunt for a scrollbar.
  useEffect(() => {
    if (heatmapScrollRef.current) {
      heatmapScrollRef.current.scrollLeft =
        heatmapScrollRef.current.scrollWidth
    }
  }, [stats.dailyFocus])

  // Heatmap data for the past year
  const { weeks, monthLabels } = buildYearHeatmap(stats.dailyFocus)

  const totalActiveDays = weeks
    .flat()
    .filter((d) => d && d.inRange && d.minutes > 0).length

  // Badges
  const badges = [
    {
      key: 'streak7',
      label: '7-Day Streak',
      earned:
        stats.currentStreak >= 7,
    },
    {
      key: 'firstSession',
      label: 'First Session',
      earned:
        stats.completedSessions >= 1,
    },
    {
      key: 'tenSessions',
      label: '10 Sessions',
      earned:
        stats.completedSessions >= 10,
    },
    {
      key: 'tenHourClub',
      label: '10 Hour Club',
      earned:
        stats.totalFocusMinutes >= 600,
    },
  ]

  // Note: the confetti + toast celebration itself now lives in
  // Layout.jsx (via useBadgeCelebration), so it fires once, app-wide,
  // right after login — not only when the user happens to open this
  // page. This component just renders the badge list below using the
  // `badges` array computed above.

  const totalHours = Math.floor(
    stats.totalFocusMinutes / 60
  )

  const totalMinutes =
    stats.totalFocusMinutes % 60

  return (
    <div>

      {/* Scoped scrollbar styling for the heatmap strip only */}
      <style>{`
        .heatmap-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .heatmap-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .heatmap-scroll::-webkit-scrollbar-thumb {
          background: rgba(120,120,120,0.45);
          border-radius: 999px;
        }
        .heatmap-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(120,120,120,0.65);
        }
        .heatmap-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(120,120,120,0.45) transparent;
        }
      `}</style>

      {/* PROFILE HEADER */}
      <div className="profile-header">

        <div className="profile-avatar">
          <img
            src={mascotImage}
            alt="Your mascot"
            className="profile-avatar-img"
          />
        </div>

        <div>
          <h1 className="profile-name">
            {userName}
          </h1>
        </div>

      </div>


      {/* STATS */}
      <div className="profile-stats-grid">

        {/* CURRENT STREAK */}
        <div className="profile-stat-card profile-stat-card-accent">

          <p className="profile-stat-label profile-stat-label-light">
            Current Streak
          </p>

          <p className="profile-stat-value profile-stat-value-light">
            {stats.currentStreak}
          </p>

          <p className="profile-stat-unit profile-stat-unit-light">
            days
          </p>

        </div>


        {/* TOTAL FOCUS */}
        <div className="profile-stat-card">

          <p className="profile-stat-label">
            Total Focus
          </p>

          <p className="profile-stat-value">
            {totalHours}h {totalMinutes}m
          </p>

          <p className="profile-stat-unit">
            all time
          </p>

        </div>


        {/* SESSIONS */}
        <div className="profile-stat-card">

          <p className="profile-stat-label">
            Sessions Completed
          </p>

          <p className="profile-stat-value">
            {stats.completedSessions}
          </p>

          <p className="profile-stat-unit">
            total
          </p>

        </div>

      </div>


      {/* BODY */}
      <div className="profile-body-grid">

        {/* YEAR HEATMAP */}
        <div className="profile-chart-card">

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <h2 className="profile-card-title" style={{ margin: 0 }}>
              Focus Activity
            </h2>
            <span style={{ fontSize: '13px', color: '#8b94a3' }}>
              {totalActiveDays} active {totalActiveDays === 1 ? 'day' : 'days'} in the past year
            </span>
          </div>

          <div
            ref={heatmapScrollRef}
            className="heatmap-scroll"
            style={{ overflowX: 'auto', paddingBottom: '14px' }}
          >
            <div style={{ display: 'inline-flex', gap: '10px', minWidth: '100%' }}>

              {/* Day-of-week labels */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `${CELL_GAP}px`,
                  marginTop: `${20 + CELL_GAP}px`,
                  flexShrink: 0,
                }}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((dow) => (
                  <div
                    key={dow}
                    style={{
                      width: '28px',
                      height: `${CELL_SIZE}px`,
                      fontSize: '10px',
                      fontWeight: 500,
                      color: '#7a8394',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '2px',
                    }}
                  >
                    {DAY_ROW_LABELS[dow] || ''}
                  </div>
                ))}
              </div>

              {/* Weeks, with month labels above */}
              <div style={{ display: 'flex', gap: `${CELL_GAP}px` }}>
                {weeks.map((week, wi) => {
                  const monthLabel = monthLabels.find((m) => m.weekIndex === wi)

                  return (
                    <div
                      key={wi}
                      style={{ display: 'flex', flexDirection: 'column', gap: `${CELL_GAP}px` }}
                    >
                      <div
                        style={{
                          height: '20px',
                          fontSize: '11px',
                          fontWeight: 500,
                          color: '#9aa3b2',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {monthLabel ? monthLabel.label : ''}
                      </div>

                      {week.map((cell, di) => {
                        if (!cell || !cell.inRange) {
                          return (
                            <div
                              key={di}
                              style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
                            />
                          )
                        }

                        const level = getIntensityLevel(cell.minutes)
                        const isHovered = hoveredCell === cell.date

                        return (
                          <div
                            key={di}
                            onMouseEnter={() => setHoveredCell(cell.date)}
                            onMouseLeave={() => setHoveredCell(null)}
                            style={{
                              width: `${CELL_SIZE}px`,
                              height: `${CELL_SIZE}px`,
                              borderRadius: '3px',
                              background: HEATMAP_COLORS[level],
                              border: `1px solid ${HEATMAP_BORDER}`,
                              boxSizing: 'border-box',
                              cursor: 'pointer',
                              outline: isHovered ? '1.5px solid rgba(255,255,255,0.55)' : 'none',
                              outlineOffset: '0.5px',
                              transition: 'outline 0.08s ease',
                              position: 'relative',
                            }}
                          >
                            {isHovered && (
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: `calc(100% + 8px)`,
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  background: '#15181f',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  color: '#e7eaf0',
                                  fontSize: '11.5px',
                                  fontWeight: 500,
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  whiteSpace: 'nowrap',
                                  boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
                                  zIndex: 10,
                                  pointerEvents: 'none',
                                }}
                              >
                                {cell.minutes > 0
                                  ? `${cell.minutes} min focused`
                                  : 'No focus time'}
                                <div style={{ color: '#8b94a3', fontWeight: 400, marginTop: '1px' }}>
                                  {formatTooltipDate(cell.date)}
                                </div>
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: 0,
                                    height: 0,
                                    borderLeft: '5px solid transparent',
                                    borderRight: '5px solid transparent',
                                    borderTop: '5px solid rgba(255,255,255,0.1)',
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '6px',
              marginTop: '8px',
              fontSize: '11.5px',
              color: '#7a8394',
            }}
          >
            <span>Less</span>
            {HEATMAP_COLORS.map((c, i) => (
              <div
                key={i}
                style={{
                  width: `${CELL_SIZE}px`,
                  height: `${CELL_SIZE}px`,
                  borderRadius: '3px',
                  background: c,
                  border: `1px solid ${HEATMAP_BORDER}`,
                  boxSizing: 'border-box',
                }}
              />
            ))}
            <span>More</span>
          </div>

        </div>


        {/* BADGES */}
        <div className="profile-badges-card">

          <h2 className="profile-card-title">
            Badges
          </h2>

          <div className="profile-badges-list">

            {badges.map((badge) => (

              <div
                key={badge.label}
                className={`profile-badge-row ${
                  badge.earned
                    ? ''
                    : 'profile-badge-row-unearned'
                }`}
              >

                <span
                  className={`profile-badge-dot ${
                    badge.earned
                      ? 'profile-badge-dot-earned'
                      : ''
                  }`}
                />

                <span className="profile-badge-label">
                  {badge.label}
                </span>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  )
}

export default Profile
