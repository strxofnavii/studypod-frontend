import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyRooms, createRoom, joinRoom } from '../api/rooms'

function RoomsLobby() {
  const navigate = useNavigate()

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomDescription, setNewRoomDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    loadRooms()
  }, [])

  async function loadRooms() {
    try {
      const data = await getMyRooms()
      setRooms(data)
    } catch (err) {
      setError('Could not load your rooms.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateRoom(e) {
    e.preventDefault()
    if (!newRoomName.trim()) return

    setCreating(true)
    setError('')
    try {
      const room = await createRoom(newRoomName.trim(), newRoomDescription.trim())
      setNewRoomName('')
      setNewRoomDescription('')
      setShowCreateForm(false)
      navigate(`/rooms/${room.id}`)
    } catch (err) {
      setError('Could not create room. Try again.')
    } finally {
      setCreating(false)
    }
  }

  async function handleJoinRoom(e) {
    e.preventDefault()
    if (!joinCode.trim()) return

    setJoining(true)
    setError('')
    try {
      const room = await joinRoom(joinCode.trim().toUpperCase())
      setJoinCode('')
      navigate(`/rooms/${room.id}`)
    } catch (err) {
      setError('Invalid room code, or the room no longer exists.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div>
      <div className="rooms-lobby-header">
        <div>
          <p className="rooms-lobby-eyebrow">Collaborative Study</p>
          <h1 className="rooms-lobby-title">Study Rooms</h1>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="rooms-lobby-create-btn"
        >
          {showCreateForm ? 'Cancel' : '+ Create Room'}
        </button>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {showCreateForm && (
        <form onSubmit={handleCreateRoom} className="rooms-lobby-create-form">
          <input
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Room name (e.g. GATE Prep Squad)"
            className="rooms-lobby-input"
            required
          />
          <input
            value={newRoomDescription}
            onChange={(e) => setNewRoomDescription(e.target.value)}
            placeholder="Description (optional)"
            className="rooms-lobby-input"
          />
          <button type="submit" disabled={creating} className="rooms-lobby-submit-btn">
            {creating ? 'Creating...' : 'Create Room'}
          </button>
        </form>
      )}

      <form onSubmit={handleJoinRoom} className="rooms-lobby-join-form">
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Enter room code to join"
          className="rooms-lobby-input rooms-lobby-join-input"
          maxLength={6}
        />
        <button type="submit" disabled={joining} className="rooms-lobby-submit-btn">
          {joining ? 'Joining...' : 'Join Room'}
        </button>
      </form>

      <h2 className="rooms-lobby-subheading">My Rooms</h2>

      {loading ? (
        <p className="rooms-lobby-empty">Loading...</p>
      ) : rooms.length === 0 ? (
        <p className="rooms-lobby-empty">
          You haven't joined any rooms yet. Create one, or join with a code.
        </p>
      ) : (
        <div className="rooms-lobby-grid">
          {rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => navigate(`/rooms/${room.id}`)}
              className="rooms-lobby-card"
            >
              <div className="rooms-lobby-card-header">
                <h3 className="rooms-lobby-card-title">{room.name}</h3>
                <span className="rooms-lobby-card-role">{room.myRole}</span>
              </div>
              {room.description && (
                <p className="rooms-lobby-card-desc">{room.description}</p>
              )}
              <div className="rooms-lobby-card-footer">
                <span>{room.memberCount} member{room.memberCount !== 1 ? 's' : ''}</span>
                <span className="rooms-lobby-card-code">Code: {room.joinCode}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RoomsLobby