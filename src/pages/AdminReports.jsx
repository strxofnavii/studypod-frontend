import { useState, useEffect, useCallback } from 'react'
import { getAdminReports, updateReportStatus } from '../api/admin'

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'RESOLVED', label: 'Resolved' },
]

const STATUS_LABEL = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
}

function statusClass(status) {
  if (status === 'RESOLVED') return 'status-badge-active'
  if (status === 'IN_PROGRESS') return 'status-badge-progress'
  return 'status-badge-suspended'
}

function ReportRow({ report, onSave }) {
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState(report.status)
  const [note, setNote] = useState(report.adminNote || '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(report.id, status, note)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-report-card">
      <button className="admin-report-summary" onClick={() => setExpanded((v) => !v)}>
        <span className="task-tag task-tag-study">{report.category}</span>
        <span className="admin-report-subject">{report.subject}</span>
        <span className="admin-cell-muted">{report.reporterName}</span>
        <span className={`status-badge ${statusClass(report.status)}`}>
          {STATUS_LABEL[report.status] || report.status}
        </span>
        <span className="admin-report-toggle">{expanded ? '−' : '+'}</span>
      </button>

      {expanded && (
        <div className="admin-report-detail">
          <p className="admin-report-description">{report.description}</p>

          <div className="admin-report-form">
            <div className="input-group">
              <label>Status</label>
              <select className="admin-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div className="input-group admin-report-note-group">
              <label>Admin note</label>
              <textarea
                className="admin-textarea"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note for this report…"
              />
            </div>

            <button className="admin-btn admin-btn-primary" disabled={saving} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  const loadReports = useCallback(async (status) => {
    setLoading(true)
    setError('')
    try {
      const data = await getAdminReports(status)
      setReports(data)
    } catch {
      setError('Could not load reports.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReports(filter)
  }, [filter, loadReports])

  async function handleSave(id, status, adminNote) {
    try {
      const updated = await updateReportStatus(id, status, adminNote)
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)))
    } catch (err) {
      setError(err.response?.data || 'Could not update report.')
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Admin control center</p>
          <h1 className="dashboard-title">
            <span>Reports</span> &amp; Issues
          </h1>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      <div className="admin-filter-row">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`admin-filter-chip ${filter === f.value ? 'admin-filter-chip-active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="admin-loading-text">Loading reports…</p>
      ) : reports.length === 0 ? (
        <p className="empty-task-message">No reports here.</p>
      ) : (
        <div className="admin-report-list">
          {reports.map((report) => (
            <ReportRow key={report.id} report={report} onSave={handleSave} />
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminReports
