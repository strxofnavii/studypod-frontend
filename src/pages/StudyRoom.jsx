import { useState } from 'react'
import { useTimer } from '../context/TimerContext'

function StudyRoom() {
  const {
    focusMinutes, breakMinutes, totalRounds,
    secondsLeft, isRunning, mode, currentRound,
    sessionTasks, newTask, setNewTask,
    toggleTimer, handleEndSession, applySettings,
    toggleTaskDone, removeTask, addTask,
  } = useTimer()

  const [showSettings, setShowSettings] = useState(false)

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')

  return (
    <div>
      <div className="study-room-header">
        <div>
          <p className="study-room-eyebrow">Focus Session</p>
          <h1 className="study-room-title">Study Room</h1>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="study-room-customize">
          {showSettings ? 'Close settings' : 'Customize timer'}
        </button>
      </div>

      {showSettings && (
        <TimerSettings
          focusMinutes={focusMinutes}
          breakMinutes={breakMinutes}
          totalRounds={totalRounds}
          onApply={(f, b, r) => { applySettings(f, b, r); setShowSettings(false) }}
        />
      )}

      <div className="study-room-body">
        <div className="timer-card">
          <p className="timer-eyebrow">{mode === 'focus' ? 'Focus Block' : 'Break'}</p>
          <p className="timer-display">{minutes}:{seconds}</p>
          <div className="timer-actions">
            <button onClick={toggleTimer} className="timer-btn timer-btn-start">
              {isRunning
                ? 'Pause'
                : secondsLeft === (mode === 'focus' ? focusMinutes : breakMinutes) * 60
                ? 'Start'
                : 'Resume'}
            </button>
            <button onClick={handleEndSession} className="timer-btn timer-btn-end">
              End Session
            </button>
          </div>
          <div className="timer-rounds">
            {Array.from({ length: totalRounds }).map((_, i) => (
              <span key={i} className={`timer-dot ${i <= currentRound - 1 ? 'timer-dot-active' : ''}`}></span>
            ))}
          </div>
          <p className="timer-round-label">Round {currentRound} of {totalRounds}</p>
        </div>

        <div className="checklist-panel">
          <h2 className="checklist-title">Session Checklist</h2>
          <div className="checklist-list">
            {sessionTasks.map((task) => (
              <div key={task.id} className="checklist-row">
                <button onClick={() => toggleTaskDone(task.id)} className={`checklist-checkbox ${task.done ? 'checklist-checkbox-done' : ''}`}>
                  {task.done && '✓'}
                </button>
                <button onClick={() => toggleTaskDone(task.id)} className={`checklist-item-text ${task.done ? 'completed' : ''}`}>
                  {task.title}
                </button>
                <button onClick={() => removeTask(task.id)} className="checklist-delete">×</button>
              </div>
            ))}
          </div>
          <div className="checklist-add-form">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="Add item..."
              className="checklist-add-input"
            />
            <button onClick={addTask} className="checklist-add-submit">+</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TimerSettings({ focusMinutes, breakMinutes, totalRounds, onApply }) {
  const [focus, setFocus] = useState(focusMinutes)
  const [brk, setBrk] = useState(breakMinutes)
  const [rounds, setRounds] = useState(totalRounds)

  return (
    <div className="timer-settings-panel">
      <h2 className="timer-settings-title">Timer Settings</h2>
      <div className="timer-settings-grid">
        <SettingField label="Focus (minutes)" value={focus} onChange={setFocus} min={1} max={120} />
        <SettingField label="Break (minutes)" value={brk} onChange={setBrk} min={1} max={60} />
        <SettingField label="Rounds" value={rounds} onChange={setRounds} min={1} max={12} />
      </div>
      <button onClick={() => onApply(focus, brk, rounds)} className="timer-settings-apply">
        Apply & Restart Timer
      </button>
    </div>
  )
}

function SettingField({ label, value, onChange, min, max }) {
  return (
    <div className="timer-settings-field">
      <label>{label}</label>
      <input type="number" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="timer-settings-input" />
    </div>
  )
}

export default StudyRoom
