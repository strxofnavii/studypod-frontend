import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { joinRoom } from '../api/rooms'

function JoinRoomRedirect() {
  const { joinCode } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    attemptJoin()
  }, [joinCode])

  async function attemptJoin() {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('not-logged-in')
      return
    }

    try {
      const room = await joinRoom(joinCode.trim().toUpperCase())
      navigate(`/rooms/${room.id}`, { replace: true })
    } catch (err) {
      setError('invalid-code')
    }
  }

  if (error === 'not-logged-in') {
    return (
      <div>
        <p className="rooms-lobby-empty">
          Please log in first to join this room.{' '}
          <Link to="/" className="study-room-customize">Go to login</Link>
        </p>
      </div>
    )
  }

  if (error === 'invalid-code') {
    return (
      <div>
        <p className="rooms-lobby-empty">
          This room code is invalid, or the room no longer exists.{' '}
          <Link to="/rooms" className="study-room-customize">Back to Study Rooms</Link>
        </p>
      </div>
    )
  }

  return <p className="rooms-lobby-empty">Joining room...</p>
}

export default JoinRoomRedirect