import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRooms, createRoom } from '../api/rooms'

function Icon({ name, size = 18 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  const icons = {
    plus: (
      <svg {...common}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    ),
    people: (
      <svg {...common}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    arrow: (
      <svg {...common}>
        <path d="M5 12h13" />
        <path d="m14 7 5 5-5 5" />
      </svg>
    ),
  }

  return icons[name] || null
}

function Rooms() {
  const navigate = useNavigate()

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomTopic, setNewRoomTopic] = useState('')
  const [creating, setCreating] = useState(false)

  const [copiedRoomId, setCopiedRoomId] = useState(null)

  useEffect(() => {
    loadRooms()
  }, [])

  async function loadRooms() {
    try {
      setLoading(true)
      const data = await getRooms()
      setRooms(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      console.error('Could not load rooms:', err)
      setError('Could not load study rooms. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateRoom(e) {
    e.preventDefault()

    if (!newRoomName.trim()) return

    setCreating(true)

    try {
      const room = await createRoom(newRoomName.trim(), newRoomTopic.trim())
      setShowCreateForm(false)
      setNewRoomName('')
      setNewRoomTopic('')
      navigate(`/rooms/${room.id}`)
    } catch (err) {
      console.error('Could not create room:', err)
      setError('Could not create the room. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  function handleCopyLink(room) {
    const inviteUrl = `${window.location.origin}/rooms/join/${room.inviteCode}`

    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopiedRoomId(room.id)
      setTimeout(() => setCopiedRoomId(null), 2000)
    })
  }

  return (
    <div className="dashboard-page">

      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">
            Study together, stay accountable.
          </p>
          <h1 className="dashboard-title">Study Rooms</h1>
        </div>

        <button
          className="new-task-button"
          onClick={() => setShowCreateForm(true)}
        >
          <Icon name="plus" size={16} />
          Create Room
        </button>
      </div>

      <button
        className="room-preview-link"
        onClick={() => navigate('/rooms/preview')}
      >
        Preview room UI with sample data →
      </button>

      {error && <div className="dashboard-error">{error}</div>}

      {/* CREATE ROOM MODAL */}
      {showCreateForm && (
        <div
          className="room-modal-overlay"
          onClick={() => setShowCreateForm(false)}
        >
          <div className="room-modal-panel" onClick={(e) => e.stopPropagation()}>
            <h3 className="room-modal-title">Create a study room</h3>

            <form onSubmit={handleCreateRoom}>
              <div className="input-group">
                <label>Room name</label>
                <input
                  type="text"
                  placeholder="e.g. DSA Grind Squad"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="input-group" style={{ marginTop: '14px' }}>
                <label>Topic (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures & Algorithms"
                  value={newRoomTopic}
                  onChange={(e) => setNewRoomTopic(e.target.value)}
                />
              </div>

              <div className="room-modal-actions">
                <button
                  type="button"
                  className="room-modal-cancel"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="new-task-button"
                  disabled={creating || !newRoomName.trim()}
                >
                  {creating ? 'Creating…' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROOM GRID */}
      {loading ? (
        <p className="empty-task-message">Loading rooms…</p>
      ) : rooms.length === 0 ? (
        <div className="room-empty-state">
          <p>No study rooms yet — create the first one and share the link with friends.</p>
        </div>
      ) : (
        <div className="room-grid">
          {rooms.map((room) => (
            <div key={room.id} className="room-card">
              <div className="room-card-top">
                <div className="room-card-icon">
                  <Icon name="people" size={20} />
                </div>
                <button
                  className="room-card-copy"
                  onClick={() => handleCopyLink(room)}
                  title="Copy invite link"
                >
                  {copiedRoomId === room.id ? 'Copied!' : 'Copy link'}
                </button>
              </div>

              <h3 className="room-card-name">{room.name}</h3>

              {room.topic && (
                <p className="room-card-topic">{room.topic}</p>
              )}

              <button
                className="room-card-enter"
                onClick={() => navigate(`/rooms/${room.id}`)}
              >
                Enter Room
                <Icon name="arrow" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Rooms