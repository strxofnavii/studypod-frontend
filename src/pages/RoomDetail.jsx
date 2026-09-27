import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getRoomDetails,
  leaveRoom,
  getMembers,
  getChatMessages,
  sendChatMessage,
  getRoomNotes,
  createRoomNote,
  updateRoomNote,
  deleteRoomNote,
  getRoomTasks,
  createRoomTask,
  updateRoomTask,
  deleteRoomTask,
} from '../api/rooms'

// Decodes the "sub" (subject) claim out of the JWT already stored at login.
// This is the account's internal id — the same id chat/notes/tasks use as "userId".
function getCurrentUserId() {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded).sub
  } catch {
    return null
  }
}

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE']
const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }

function RoomDetail() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const myUserId = getCurrentUserId()

  const [room, setRoom] = useState(null)
  const [activeTab, setActiveTab] = useState('chat')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Copy feedback ('' | 'code' | 'link')
  const [copiedType, setCopiedType] = useState('')

  // Chat
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const chatPollRef = useRef(null)
  const chatEndRef = useRef(null)

  // Members
  const [members, setMembers] = useState([])

  // Notes
  const [notes, setNotes] = useState([])
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editNoteTitle, setEditNoteTitle] = useState('')
  const [editNoteContent, setEditNoteContent] = useState('')

  // Tasks
  const [tasks, setTasks] = useState([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')

  // ---------- Initial load ----------

  useEffect(() => {
    loadRoom()
    return () => clearInterval(chatPollRef.current)
  }, [roomId])

  async function loadRoom() {
    setLoading(true)
    try {
      const data = await getRoomDetails(roomId)
      setRoom(data)
    } catch (err) {
      setError('You do not have access to this room, or it no longer exists.')
    } finally {
      setLoading(false)
    }
  }

  // ---------- Tab switching: load the relevant data, poll chat while open ----------

  useEffect(() => {
    clearInterval(chatPollRef.current)

    if (!room) return

    if (activeTab === 'chat') {
      loadMessages()
      chatPollRef.current = setInterval(loadMessages, 3000)
    } else if (activeTab === 'members') {
      loadMembers()
    } else if (activeTab === 'notes') {
      loadNotes()
    } else if (activeTab === 'tasks') {
      loadTasks()
    }

    return () => clearInterval(chatPollRef.current)
  }, [activeTab, room])

  // ---------- Chat ----------

  async function loadMessages() {
    try {
      const data = await getChatMessages(roomId)
      setMessages(data)
    } catch (err) {
      // silent — a failed poll shouldn't interrupt the UI
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim()) return
    try {
      await sendChatMessage(roomId, newMessage.trim())
      setNewMessage('')
      loadMessages()
    } catch (err) {
      setError('Could not send message.')
    }
  }

  // ---------- Members ----------

  async function loadMembers() {
    try {
      const data = await getMembers(roomId)
      setMembers(data)
    } catch (err) {
      setError('Could not load members.')
    }
  }

  // ---------- Notes ----------

  async function loadNotes() {
    try {
      const data = await getRoomNotes(roomId)
      setNotes(data)
    } catch (err) {
      setError('Could not load notes.')
    }
  }

  async function handleCreateNote(e) {
    e.preventDefault()
    if (!newNoteTitle.trim()) return
    try {
      await createRoomNote(roomId, newNoteTitle.trim(), newNoteContent.trim())
      setNewNoteTitle('')
      setNewNoteContent('')
      loadNotes()
    } catch (err) {
      setError('Could not create note.')
    }
  }

  function startEditNote(note) {
    setEditingNoteId(note.id)
    setEditNoteTitle(note.title)
    setEditNoteContent(note.content || '')
  }

  async function handleSaveNoteEdit(noteId) {
    try {
      await updateRoomNote(roomId, noteId, {
        title: editNoteTitle,
        content: editNoteContent,
      })
      setEditingNoteId(null)
      loadNotes()
    } catch (err) {
      setError('Could not update note.')
    }
  }

  async function handleDeleteNote(noteId) {
    const confirmed = window.confirm('Delete this shared note? This can\'t be undone.')
    if (!confirmed) return
    try {
      await deleteRoomNote(roomId, noteId)
      loadNotes()
    } catch (err) {
      setError('Could not delete note.')
    }
  }

  // ---------- Tasks ----------

  async function loadTasks() {
    try {
      const data = await getRoomTasks(roomId)
      setTasks(data)
    } catch (err) {
      setError('Could not load tasks.')
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    try {
      await createRoomTask(
        roomId,
        newTaskTitle.trim(),
        newTaskDescription.trim(),
        newTaskDueDate || null
      )
      setNewTaskTitle('')
      setNewTaskDescription('')
      setNewTaskDueDate('')
      loadTasks()
    } catch (err) {
      setError('Could not create task.')
    }
  }

  // Always sends the FULL task object back — the backend PUT replaces the
  // whole row, so omitting fields (like dueDate) would silently wipe them.
  async function handleChangeTaskStatus(task, newStatus) {
    try {
      await updateRoomTask(roomId, task.id, {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status: newStatus,
      })
      loadTasks()
    } catch (err) {
      setError('Could not update task.')
    }
  }

  async function handleDeleteTask(taskId) {
    const confirmed = window.confirm('Delete this task? This can\'t be undone.')
    if (!confirmed) return
    try {
      await deleteRoomTask(roomId, taskId)
      loadTasks()
    } catch (err) {
      setError('Could not delete task.')
    }
  }

  // ---------- Room-level actions ----------

  async function handleLeaveRoom() {
    const confirmed = window.confirm('Leave this room? You can rejoin later with the room code.')
    if (!confirmed) return
    try {
      await leaveRoom(roomId)
      navigate('/rooms')
    } catch (err) {
      setError('Could not leave room.')
    }
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(room.joinCode)
    setCopiedType('code')
    setTimeout(() => setCopiedType(''), 1500)
  }

  function handleCopyShareLink() {
    const shareUrl = `${window.location.origin}/rooms/join/${room.joinCode}`
    navigator.clipboard.writeText(shareUrl)
    setCopiedType('link')
    setTimeout(() => setCopiedType(''), 1500)
  }

  // ---------- Render ----------

  if (loading) {
    return <p className="rooms-lobby-empty">Loading room...</p>
  }

  if (error && !room) {
    return (
      <div>
        <div className="dashboard-error">{error}</div>
        <button onClick={() => navigate('/rooms')} className="rooms-lobby-submit-btn">
          Back to Study Rooms
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="room-detail-header">
        <div>
          <p className="rooms-lobby-eyebrow">{room.myRole === 'HOST' ? 'You host this room' : 'Study Room'}</p>
          <h1 className="rooms-lobby-title">{room.name}</h1>
          {room.description && <p className="room-detail-desc">{room.description}</p>}
        </div>
        <div className="room-detail-header-actions">
          <button onClick={handleCopyShareLink} className="room-detail-share-btn" title="Copy shareable invite link">
            {copiedType === 'link' ? 'Copied!' : 'Share Link'}
          </button>
          <button onClick={handleCopyCode} className="room-detail-code-btn" title="Copy room code">
            {copiedType === 'code' ? 'Copied!' : `Code: ${room.joinCode}`}
          </button>
          <button onClick={handleLeaveRoom} className="room-detail-leave-btn">
            Leave Room
          </button>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      <div className="room-detail-tabs">
        {['chat', 'notes', 'tasks', 'members'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`room-detail-tab ${activeTab === tab ? 'room-detail-tab-active' : ''}`}
          >
            {tab === 'tasks' ? 'Task Board' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="room-detail-body">
        {/* ---------- Chat tab ---------- */}
        {activeTab === 'chat' && (
          <div className="room-chat-panel">
            <div className="room-chat-messages">
              {messages.length === 0 && (
                <p className="rooms-lobby-empty">No messages yet — say hi!</p>
              )}
              {messages.map((msg) => {
                const isMine = msg.userId === myUserId
                return (
                  <div
                    key={msg.id}
                    className={`room-chat-message ${isMine ? 'room-chat-message-mine' : ''}`}
                  >
                    {!isMine && <p className="room-chat-sender">{msg.senderName}</p>}
                    <p className="room-chat-content">{msg.content}</p>
                  </div>
                )
              })}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="room-chat-input-form">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="rooms-lobby-input"
              />
              <button type="submit" className="rooms-lobby-submit-btn">Send</button>
            </form>
          </div>
        )}

        {/* ---------- Notes tab ---------- */}
        {activeTab === 'notes' && (
          <div className="room-notes-panel">
            <form onSubmit={handleCreateNote} className="rooms-lobby-create-form">
              <input
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Note title"
                className="rooms-lobby-input"
                required
              />
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Note content..."
                className="notes-textarea room-note-textarea-small"
              />
              <button type="submit" className="rooms-lobby-submit-btn">Add Note</button>
            </form>

            {notes.length === 0 && (
              <p className="rooms-lobby-empty">No shared notes yet.</p>
            )}

            <div className="room-notes-grid">
              {notes.map((note) => (
                <div key={note.id} className="room-note-card">
                  {editingNoteId === note.id ? (
                    <>
                      <input
                        value={editNoteTitle}
                        onChange={(e) => setEditNoteTitle(e.target.value)}
                        className="rooms-lobby-input"
                      />
                      <textarea
                        value={editNoteContent}
                        onChange={(e) => setEditNoteContent(e.target.value)}
                        className="notes-textarea room-note-textarea-small"
                      />
                      <div className="room-note-card-actions">
                        <button onClick={() => handleSaveNoteEdit(note.id)} className="rooms-lobby-submit-btn">
                          Save
                        </button>
                        <button onClick={() => setEditingNoteId(null)} className="room-detail-leave-btn">
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="room-note-card-title">{note.title}</h3>
                      <p className="room-note-card-content">{note.content}</p>
                      <div className="room-note-card-actions">
                        <button onClick={() => startEditNote(note)} className="room-detail-code-btn">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteNote(note.id)} className="room-detail-leave-btn">
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------- Task board tab ---------- */}
        {activeTab === 'tasks' && (
          <div className="room-tasks-panel">
            <form onSubmit={handleCreateTask} className="rooms-lobby-create-form">
              <input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title"
                className="rooms-lobby-input"
                required
              />
              <input
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Description (optional)"
                className="rooms-lobby-input"
              />
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="rooms-lobby-input"
              />
              <button type="submit" className="rooms-lobby-submit-btn">Add Task</button>
            </form>

            <div className="room-task-board">
              {TASK_STATUSES.map((status) => (
                <div key={status} className="room-task-column">
                  <h3 className="room-task-column-title">{STATUS_LABELS[status]}</h3>
                  {tasks
                    .filter((task) => task.status === status)
                    .map((task) => (
                      <div key={task.id} className="room-task-card">
                        <p className="room-task-card-title">{task.title}</p>
                        {task.description && (
                          <p className="room-task-card-desc">{task.description}</p>
                        )}
                        {task.dueDate && (
                          <p className="room-task-card-due">Due: {task.dueDate}</p>
                        )}
                        <div className="room-task-card-actions">
                          <select
                            value={task.status}
                            onChange={(e) => handleChangeTaskStatus(task, e.target.value)}
                            className="room-task-status-select"
                          >
                            {TASK_STATUSES.map((s) => (
                              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="room-task-delete-btn"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  {tasks.filter((task) => task.status === status).length === 0 && (
                    <p className="room-task-column-empty">Nothing here</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------- Members tab ---------- */}
        {activeTab === 'members' && (
          <div className="room-members-panel">
            {members.map((member) => (
              <div key={member.userId} className="room-member-row">
                <span className="room-member-avatar">
                  {member.name.charAt(0).toUpperCase()}
                </span>
                <div className="room-member-info">
                  <p className="room-member-name">{member.name}</p>
                  <p className="room-member-role">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomDetail
