import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { startSession, endSession } from '../api/sessions'

const TimerContext = createContext(null)

export function TimerProvider({ children }) {
  const [focusMinutes, setFocusMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [totalRounds, setTotalRounds] = useState(4)

  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState('focus')
  const [currentRound, setCurrentRound] = useState(1)
  const [currentSessionId, setCurrentSessionId] = useState(null)

  const [sessionTasks, setSessionTasks] = useState([])
  const [newTask, setNewTask] = useState('')

  const intervalRef = useRef(null)
  const endTimeRef = useRef(null)

  function clearTasks() {
    setSessionTasks([])
    setNewTask('')
  }

  function syncFromEndTime() {
    if (!endTimeRef.current) return
    const remainingMs = endTimeRef.current - Date.now()
    const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000))

    if (remainingSeconds <= 0) {
      endTimeRef.current = null
      setSecondsLeft(0)
      handleTimerEnd()
    } else {
      setSecondsLeft(remainingSeconds)
    }
  }

  // This effect now lives in the provider, which stays mounted for the
  // whole app session — so the interval keeps running (and secondsLeft
  // keeps being correct) no matter which sidebar page you're on.
  useEffect(() => {
    if (isRunning) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + secondsLeft * 1000
      }
      intervalRef.current = setInterval(syncFromEndTime, 1000)

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') syncFromEndTime()
      }
      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        clearInterval(intervalRef.current)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
    return () => clearInterval(intervalRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning])

  async function handleTimerEnd() {
    clearInterval(intervalRef.current)
    setIsRunning(false)

    if (currentSessionId) {
      try {
        await endSession(currentSessionId)
      } catch (err) {
        console.error('Could not end session:', err)
      }
      setCurrentSessionId(null)
    }

    if (mode === 'focus') {
      if (currentRound < totalRounds) {
        setMode('break')
        setSecondsLeft(breakMinutes * 60)
      } else {
        setMode('focus')
        setCurrentRound(1)
        setSecondsLeft(focusMinutes * 60)
        clearTasks()
      }
    } else {
      setMode('focus')
      setCurrentRound((prev) => prev + 1)
      setSecondsLeft(focusMinutes * 60)
    }
  }

  async function toggleTimer() {
    if (!isRunning && !currentSessionId) {
      try {
        const session = await startSession(mode === 'focus' ? 'FOCUS' : 'BREAK')
        setCurrentSessionId(session.id)
      } catch (err) {
        console.error('Could not start session:', err)
      }
    }
    if (isRunning) {
      endTimeRef.current = null
    }
    setIsRunning((prev) => !prev)
  }

  async function handleEndSession() {
    clearInterval(intervalRef.current)
    endTimeRef.current = null
    setIsRunning(false)

    if (currentSessionId) {
      try {
        await endSession(currentSessionId)
      } catch (err) {
        console.error('Could not end session:', err)
      }
      setCurrentSessionId(null)
    }

    setMode('focus')
    setCurrentRound(1)
    setSecondsLeft(focusMinutes * 60)
    clearTasks()
  }

  function applySettings(newFocus, newBreak, newRounds) {
    clearInterval(intervalRef.current)
    endTimeRef.current = null
    setIsRunning(false)
    setFocusMinutes(newFocus)
    setBreakMinutes(newBreak)
    setTotalRounds(newRounds)
    setMode('focus')
    setCurrentRound(1)
    setSecondsLeft(newFocus * 60)
  }

  function toggleTaskDone(id) {
    setSessionTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  function removeTask(id) {
    setSessionTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function addTask() {
    if (!newTask.trim()) return
    setSessionTasks((prev) => [...prev, { id: Date.now(), title: newTask, done: false }])
    setNewTask('')
  }

  const value = {
    focusMinutes, breakMinutes, totalRounds,
    secondsLeft, isRunning, mode, currentRound,
    sessionTasks, newTask, setNewTask,
    toggleTimer, handleEndSession, applySettings,
    toggleTaskDone, removeTask, addTask,
  }

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
}

export function useTimer() {
  const ctx = useContext(TimerContext)
  if (!ctx) throw new Error('useTimer must be used inside a TimerProvider')
  return ctx
}
