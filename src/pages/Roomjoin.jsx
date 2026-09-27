import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRoomByInviteCode, joinRoom } from '../api/Rooms'

function RoomJoin() {
  const { inviteCode } = useParams()
  const navigate = useNavigate()

  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadRoom() {
      try {
        const data = await getRoomByInviteCode(inviteCode)
        setRoom(data)
      } catch (err) {
        console.error('Invalid invite link:', err)
        setError('This invite link is invalid or has expired.')
      } finally {
        setLoading(false)
      }
    }

    loadRoom()
  }, [inviteCode])

  async function handleJoin() {
    if (!room) return

    setJoining(true)

    try {
      await joinRoom(room.id)
      navigate(`/rooms/${room.id}`)
    } catch (err) {
      console.error('Could not join room:', err)
      setError('Could not join this room. Please try again.')
      setJoining(false)
    }
  }

  return (
    <div className="dashboard-page" style={{ maxWidth: '520px' }}>
      <div className="room-join-card">

        {loading ? (
          <p className="empty-task-message">Looking up this room…</p>
        ) : error ? (
          <>
            <h2 className="room-join-title">Link not found</h2>
            <p className="room-join-desc">{error}</p>
            <button
              className="new-task-button"
              onClick={() => navigate('/rooms')}
            >
              Browse Study Rooms
            </button>
          </>
        ) : (
          <>
            <p className="room-join-eyebrow">You've been invited to</p>
            <h2 className="room-join-title">{room.name}</h2>
            {room.topic && <p className="room-join-desc">{room.topic}</p>}

            <button
              className="new-task-button"
              onClick={handleJoin}
              disabled={joining}
              style={{ marginTop: '20px' }}
            >
              {joining ? 'Joining…' : 'Join Room'}
            </button>
          </>
        )}

      </div>
    </div>
  )
}

export default RoomJoin
