import { useState, useEffect } from 'react'
import {
  getAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../api/admin'

/* =====================================================
   ANNOUNCEMENT MODAL
===================================================== */

function AnnouncementModal({ initial, onClose, onSubmit }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [message, setMessage] = useState(initial?.message || '')
  const [active, setActive] = useState(
    initial ? initial.active : true
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    if (!title.trim() || !message.trim()) {
      setError('Title and message are required.')
      return
    }

    setSaving(true)
    setError('')

    try {
      await onSubmit({
        title,
        message,
        active,
      })

      onClose()
    } catch (err) {
      setError(
        err.response?.data ||
        'Could not save announcement.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="admin-modal-overlay"
      onClick={onClose}
    >
      <div
        className="admin-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="admin-modal-title">
          {initial
            ? 'Edit announcement'
            : 'New announcement'}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="admin-modal-form"
        >

          {/* TITLE */}

          <div className="input-group">
            <label>Title</label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Announcement title"
            />
          </div>

          {/* MESSAGE */}

          <div className="input-group">
            <label>Message</label>

            <textarea
              className="admin-textarea"
              rows={4}
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="What do you want to tell everyone?"
            />
          </div>

          {/* ACTIVE */}

          <label className="admin-checkbox-row">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) =>
                setActive(e.target.checked)
              }
            />

            Active (visible to students)
          </label>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          {/* ACTIONS */}

          <div className="admin-modal-actions">

            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={saving}
            >
              {saving
                ? 'Saving…'
                : 'Save'}
            </button>

          </div>

        </form>
      </div>
    </div>
  )
}

/* =====================================================
   ADMIN ANNOUNCEMENTS
===================================================== */

function AdminAnnouncements() {
  const [announcements, setAnnouncements] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [modalOpen, setModalOpen] =
    useState(false)

  const [editing, setEditing] =
    useState(null)

  /* =====================================================
     LOAD ANNOUNCEMENTS
  ===================================================== */

  async function load() {
    setLoading(true)
    setError('')

    try {
      const data =
        await getAdminAnnouncements()

      setAnnouncements(
        Array.isArray(data)
          ? data
          : []
      )
    } catch (err) {
      setError(
        'Could not load announcements.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  /* =====================================================
     CREATE ANNOUNCEMENT
  ===================================================== */

  async function handleCreate({
    title,
    message,
    active,
  }) {
    const created =
      await createAnnouncement(
        title,
        message,
        active
      )

    setAnnouncements((prev) => [
      created,
      ...prev
    ])
  }

  /* =====================================================
     UPDATE ANNOUNCEMENT
  ===================================================== */

  async function handleUpdate({
    title,
    message,
    active,
  }) {
    const updated =
      await updateAnnouncement(
        editing.id,
        {
          title,
          message,
          active,
        }
      )

    setAnnouncements((prev) =>
      prev.map((announcement) =>
        announcement.id === updated.id
          ? updated
          : announcement
      )
    )
  }

  /* =====================================================
     ACTIVATE / DEACTIVATE
  ===================================================== */

  async function handleToggleActive(
    announcement
  ) {
    try {
      const updated =
        await updateAnnouncement(
          announcement.id,
          {
            active:
              !announcement.active,
          }
        )

      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === updated.id
            ? updated
            : item
        )
      )
    } catch (err) {
      setError(
        'Could not update announcement.'
      )
    }
  }

  /* =====================================================
     DELETE
  ===================================================== */

  async function handleDelete(
    announcement
  ) {
    if (
      !window.confirm(
        `Delete "${announcement.title}"?`
      )
    ) {
      return
    }

    try {
      await deleteAnnouncement(
        announcement.id
      )

      setAnnouncements((prev) =>
        prev.filter(
          (item) =>
            item.id !== announcement.id
        )
      )
    } catch (err) {
      setError(
        'Could not delete announcement.'
      )
    }
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-header">

        <div>

          <p className="dashboard-eyebrow">
            Admin control center
          </p>

          <h1 className="dashboard-title">
            <span>Announce</span>ments
          </h1>

        </div>

        <button
          className="new-task-button"
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          + New announcement
        </button>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* =================================================
          ANNOUNCEMENTS
      ================================================= */}

      {loading ? (

        <p className="admin-loading-text">
          Loading announcements…
        </p>

      ) : announcements.length === 0 ? (

        <p className="empty-task-message">
          No announcements yet.
        </p>

      ) : (

        <div className="admin-announcement-list">

          {announcements.map(
            (announcement) => (

              <div
                className="admin-announcement-card"
                key={announcement.id}
              >

                {/* HEADER */}

                <div className="admin-announcement-head">

                  <h3>
                    {announcement.title}
                  </h3>

                  <span
                    className={`status-badge ${
                      announcement.active
                        ? 'status-badge-active'
                        : 'status-badge-suspended'
                    }`}
                  >
                    {announcement.active
                      ? 'Active'
                      : 'Inactive'}
                  </span>

                </div>

                {/* MESSAGE */}

                <p className="admin-announcement-message">
                  {announcement.message}
                </p>

                {/* FOOTER */}

                <div className="admin-announcement-footer">

                  <span className="admin-cell-muted">
                    by {announcement.createdBy}
                    {' · '}
                    {new Date(
                      announcement.createdAt
                    ).toLocaleString()}
                  </span>

                  <span className="admin-row-actions">

                    {/* ACTIVATE / DEACTIVATE */}

                    <button
                      className="admin-btn admin-btn-secondary"
                      onClick={() =>
                        handleToggleActive(
                          announcement
                        )
                      }
                    >
                      {announcement.active
                        ? 'Deactivate'
                        : 'Activate'}
                    </button>

                    {/* EDIT */}

                    <button
                      className="admin-btn admin-btn-secondary"
                      onClick={() => {
                        setEditing(
                          announcement
                        )
                        setModalOpen(true)
                      }}
                    >
                      Edit
                    </button>

                    {/* DELETE */}

                    <button
                      className="admin-btn admin-btn-danger"
                      onClick={() =>
                        handleDelete(
                          announcement
                        )
                      }
                    >
                      Delete
                    </button>

                  </span>

                </div>

              </div>
            )
          )}

        </div>
      )}

      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}

      {modalOpen && (
        <AnnouncementModal
          initial={editing}
          onClose={() =>
            setModalOpen(false)
          }
          onSubmit={
            editing
              ? handleUpdate
              : handleCreate
          }
        />
      )}

    </div>
  )
}

export default AdminAnnouncements