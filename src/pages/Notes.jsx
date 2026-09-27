import { useState, useEffect } from 'react'
import {
  getNotes,
  getFolders,
  searchNotes,
  createNote,
  generateAIContent,
  uploadNoteFile,
  renameFolder,
  deleteNote,
} from '../api/notes'

const aiActions = [
  { key: 'summary', label: 'Summary', icon: '≡' },
  { key: 'flashcards', label: 'Flashcards', icon: '▢' },
  { key: 'quiz', label: 'Quiz', icon: '?' },
  { key: 'flowchart', label: 'Flowchart', icon: '⤳' },
]

const loadingMessages = [
  'Reading your notes...',
  'Thinking it through...',
  'Almost there...',
  'Putting it together...',
]


function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 6 15 12 9 18"></polyline>
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"></path>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
      <path d="M10 11v6"></path>
      <path d="M14 11v6"></path>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
    </svg>
  )
}

function Notes() {
  const [notes, setNotes] = useState([])
  const [folders, setFolders] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeNoteId, setActiveNoteId] = useState(null)
  const [noteTitle, setNoteTitle] = useState('Untitled Note')
  const [noteText, setNoteText] = useState('')
  const [noteFolder, setNoteFolder] = useState('General')
  const [loadingType, setLoadingType] = useState(null)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  // Folder tree UI state
  const [expandedFolders, setExpandedFolders] = useState({})
  const [renamingFolder, setRenamingFolder] = useState(null)
  const [renameValue, setRenameValue] = useState('')

  useEffect(() => {
    loadNotes()
    loadFolders()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      runSearch(searchQuery)
    } else {
      loadNotes()
    }
  }, [searchQuery])

  async function loadNotes() {
    try {
      const data = await getNotes()
      setNotes(data)
      if (data.length > 0 && !activeNoteId) {
        selectNote(data[0])
      }
    } catch (err) {
      setError('Could not load notes.')
    }
  }

  async function loadFolders() {
    try {
      const data = await getFolders()
      setFolders(data)
    } catch (err) {
      // non-critical, ignore silently
    }
  }

  async function runSearch(query) {
    try {
      const data = await searchNotes(query)
      setNotes(data)
    } catch (err) {
      setError('Search failed.')
    }
  }

  function selectNote(note) {
    setActiveNoteId(note.id)
    setNoteTitle(note.title)
    setNoteText(note.content)
    setNoteFolder(note.folder || 'General')
    setResult(null)
  }

  function startNewNote() {
    setActiveNoteId(null)
    setNoteTitle('Untitled Note')
    setNoteText('')
    setNoteFolder('General')
    setResult(null)
  }

  async function handleSaveNote() {
    if (!noteText.trim()) return
    try {
      const saved = await createNote(noteTitle, noteText, noteFolder)
      await loadNotes()
      await loadFolders()
      setActiveNoteId(saved.id)
    } catch (err) {
      setError('Could not save note.')
    }
  }

  async function handleDeleteNote(id, e) {
    e.stopPropagation()

    const confirmed = window.confirm('Delete this note? This can\'t be undone.')
    if (!confirmed) return

    try {
      await deleteNote(id)
      await loadFolders()

      if (activeNoteId === id) {
        startNewNote()
      }

      await loadNotes()
    } catch (err) {
      setError('Could not delete note.')
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    try {
      const data = await uploadNoteFile(file)
      setNoteText(data.content)
      setNoteTitle(file.name.replace(/\.[^/.]+$/, ''))
    } catch (err) {
      setError('Could not read file. Only .txt files are supported.')
    }
    e.target.value = ''
  }

  async function handleGenerate(type) {
    if (!noteText.trim()) {
      setError('Write or select a note first.')
      return
    }
    setError('')
    setLoadingType(type)
    setResult(null)
    setLoadingMessageIndex(0)

    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 1500)

    try {
      const data = await generateAIContent(noteText, type)
      setResult(data)
    } catch (err) {
      setError('AI generation failed. Try again.')
    } finally {
      clearInterval(messageInterval)
      setLoadingType(null)
    }
  }

  // ---------------------------------------------------------
  // FOLDER TREE HELPERS
  // ---------------------------------------------------------

  function toggleFolder(folder) {
    setExpandedFolders((prev) => ({ ...prev, [folder]: !prev[folder] }))
  }

  function startRename(folder) {
    setRenamingFolder(folder)
    setRenameValue(folder)
  }

  async function submitRename(oldName) {
    const newName = renameValue.trim()
    setRenamingFolder(null)

    if (!newName || newName === oldName) return

    try {
      await renameFolder(oldName, newName)
      await loadFolders()
      await loadNotes()

      if (noteFolder === oldName) {
        setNoteFolder(newName)
      }

      // carry the expanded state over to the new name
      setExpandedFolders((prev) => {
        const next = { ...prev }
        if (next[oldName]) {
          next[newName] = true
          delete next[oldName]
        }
        return next
      })
    } catch (err) {
      setError('Could not rename folder.')
    }
  }

  const isSearching = searchQuery.trim().length > 0
  const showSidebar = isSearching ? notes.length > 0 : folders.length > 0

  return (
    <div>
      <div className="notes-header">
        <div>
          <p className="notes-eyebrow">Smart Notes</p>
          <input
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="notes-title-input"
          />
        </div>
        <button onClick={startNewNote} className="notes-link-btn">
          + New Note
        </button>
      </div>

      <div className="notes-toolbar">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes by title..."
          className="notes-search-input"
        />
        <div className="notes-folder-select-wrap">
          <select
            value={noteFolder}
            onChange={(e) => setNoteFolder(e.target.value)}
            className="notes-folder-select"
          >
            {[...new Set([...folders, noteFolder])].map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
            <option value="__new__">+ New folder</option>
          </select>
        </div>
        {noteFolder === '__new__' && (
          <input
            autoFocus
            placeholder="Folder name..."
            className="notes-folder-input"
            onBlur={(e) => setNoteFolder(e.target.value.trim() || 'General')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setNoteFolder(e.target.value.trim() || 'General')
            }}
          />
        )}
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      <div className={showSidebar ? 'notes-grid' : 'notes-grid notes-grid-no-sidebar'}>
        {/* Note list sidebar: flat while searching, folder tree otherwise */}
        {showSidebar && (
          <div className="notes-sidebar">
            {isSearching ? (
              notes.map((note) => (
                <div
                  key={note.id}
                  className={`notes-sidebar-row ${
                    activeNoteId === note.id ? 'notes-sidebar-row-active' : ''
                  }`}
                >
                  <button
                    onClick={() => selectNote(note)}
                    className={`notes-sidebar-item ${
                      activeNoteId === note.id ? 'notes-sidebar-item-active' : ''
                    }`}
                  >
                    {note.title}
                  </button>
                  <button
                    onClick={(e) => handleDeleteNote(note.id, e)}
                    className="notes-sidebar-delete"
                    title="Delete note"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))
            ) : (
              <div className="notes-folder-tree">
                {folders.map((folder) => {
                  const folderNotes = notes.filter(
                    (n) => (n.folder || 'General') === folder
                  )
                  const isOpen = !!expandedFolders[folder]
                  const isRenaming = renamingFolder === folder

                  return (
                    <div key={folder} className="notes-folder-group">
                      <div className="notes-folder-header">
                        <button
                          type="button"
                          onClick={() => toggleFolder(folder)}
                          className="notes-folder-toggle"
                        >
                          <span
                            className={`notes-folder-caret ${
                              isOpen ? 'notes-folder-caret-open' : ''
                            }`}
                          >
                            <ChevronIcon />
                          </span>

                          {isRenaming ? (
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onBlur={() => submitRename(folder)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') submitRename(folder)
                                if (e.key === 'Escape') setRenamingFolder(null)
                              }}
                              className="notes-folder-rename-input"
                            />
                          ) : (
                            <span className="notes-folder-name">{folder}</span>
                          )}

                          <span className="notes-folder-count">{folderNotes.length}</span>
                        </button>

                        {!isRenaming && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              startRename(folder)
                            }}
                            className="notes-folder-rename-btn"
                            title="Rename folder"
                          >
                            <PencilIcon />
                          </button>
                        )}
                      </div>

                      {isOpen && (
                        <div className="notes-folder-notes">
                          {folderNotes.length === 0 ? (
                            <p className="notes-folder-empty">No notes yet</p>
                          ) : (
                            folderNotes.map((note) => (
                              <div
                                key={note.id}
                                className={`notes-sidebar-row ${
                                  activeNoteId === note.id ? 'notes-sidebar-row-active' : ''
                                }`}
                              >
                                <button
                                  onClick={() => selectNote(note)}
                                  className={`notes-sidebar-item ${
                                    activeNoteId === note.id ? 'notes-sidebar-item-active' : ''
                                  }`}
                                >
                                  {note.title}
                                </button>
                                <button
                                  onClick={(e) => handleDeleteNote(note.id, e)}
                                  className="notes-sidebar-delete"
                                  title="Delete note"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Note editor */}
        <div className="notes-editor-card">
          <div className="notes-editor-header">
            <h2 className="notes-editor-title">Your Note</h2>
            <div className="notes-editor-actions">
              <label className="notes-link-btn notes-upload-label">
                Upload .txt file
                <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={handleSaveNote} className="notes-link-btn">
                Save note
              </button>
            </div>
          </div>

          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="notes-textarea"
            placeholder="Type or paste your notes here..."
          ></textarea>

          {loadingType && (
            <div className="notes-status-box">
              <span className="notes-spinner"></span>
              <span className="notes-loading-text">{loadingMessages[loadingMessageIndex]}</span>
            </div>
          )}

          {result && !loadingType && (
            <div className="notes-status-box notes-result-box">
              <p className="notes-result-label">{result.type} result</p>
              {result.type === 'flowchart' ? (
                <div className="notes-flowchart">
                  {result.content
                    .replace(/\*\*/g, '')
                    .split(/\||→|->|\*\s*Step\s*\d+:?/gi)
                    .map((step) => step.trim())
                    .filter((step) => step.length > 0)
                    .map((step, i, arr) => (
                      <div key={i} className="notes-flowchart-step-wrap">
                        <div className="notes-flowchart-step">{step}</div>
                        {i < arr.length - 1 && <div className="notes-flowchart-arrow">↓</div>}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="notes-result-text">{result.content}</p>
              )}
            </div>
          )}
        </div>

        {/* AI actions panel */}
        <div className="notes-ai-panel">
          <p className="notes-ai-eyebrow">AI Study Tools</p>
          <p className="notes-ai-desc">Turn this note into something you can actually revise.</p>
          <div className="notes-ai-actions">
            {aiActions.map((action) => (
              <button
                key={action.key}
                onClick={() => handleGenerate(action.key)}
                disabled={loadingType !== null}
                className="notes-ai-action-btn"
              >
                <span className="notes-ai-action-icon">{action.icon}</span>
                {loadingType === action.key ? 'Generating...' : `Generate ${action.label}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notes