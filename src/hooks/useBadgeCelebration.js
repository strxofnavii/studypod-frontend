import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { getSessionStats } from '../api/sessions'

// Same badge rules used on the Profile page's badge list, kept here so
// the celebration can be evaluated without needing to be on /profile.
function computeBadges(stats) {
  return [
    { key: 'streak7', label: '7-Day Streak', earned: stats.currentStreak >= 7 },
    { key: 'firstSession', label: 'First Session', earned: stats.completedSessions >= 1 },
    { key: 'tenSessions', label: '10 Sessions', earned: stats.completedSessions >= 10 },
    { key: 'tenHourClub', label: '10 Hour Club', earned: stats.totalFocusMinutes >= 600 },
  ]
}

/*
 * Fires confetti + a toast the first time a badge becomes earned.
 *
 * Runs once per authenticated app session (guarded by a ref), rather
 * than once per visit to a particular page — so a badge unlocked while
 * finishing a focus session is celebrated as soon as the user lands
 * anywhere in the app (e.g. right after login), not only if they
 * happen to open the Profile page. Which badges have already been
 * celebrated is tracked per-user in localStorage so it only ever
 * fires once per badge, never again on later logins/refreshes.
 */
export function useBadgeCelebration(enabled) {
  const [celebrationBadge, setCelebrationBadge] = useState(null)
  const hasCheckedRef = useRef(false)

  useEffect(() => {
    if (!enabled || hasCheckedRef.current) return
    hasCheckedRef.current = true

    async function checkForNewBadges() {
      try {
        const data = await getSessionStats()

        const stats = {
          totalFocusMinutes: Number(data.totalFocusMinutes) || 0,
          currentStreak: Number(data.currentStreak) || 0,
          completedSessions: Number(data.completedSessions) || 0,
        }

        const userId = localStorage.getItem('userId') || 'anonymous'
        const storageKey = `unlockedBadges_${userId}`

        const previouslyUnlocked = JSON.parse(
          localStorage.getItem(storageKey) || '[]'
        )

        const badges = computeBadges(stats)
        const nowEarned = badges.filter((b) => b.earned).map((b) => b.key)
        const newlyUnlocked = nowEarned.filter(
          (key) => !previouslyUnlocked.includes(key)
        )

        if (newlyUnlocked.length > 0) {
          const badge = badges.find((b) => b.key === newlyUnlocked[0])

          confetti({
            particleCount: 130,
            spread: 90,
            origin: { y: 0.6 },
          })

          setCelebrationBadge(badge.label)
          setTimeout(() => setCelebrationBadge(null), 4000)
        }

        // Always persist the full set of currently-earned badges, so a
        // badge earned in this check never re-fires confetti later.
        localStorage.setItem(storageKey, JSON.stringify(nowEarned))
      } catch (err) {
        console.error('Could not check for new badges:', err)
      }
    }

    checkForNewBadges()
  }, [enabled])

  return celebrationBadge
}