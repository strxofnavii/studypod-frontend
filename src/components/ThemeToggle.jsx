import { useEffect, useState } from 'react'

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      aria-label="Toggle dark mode"
      className="group relative w-12 h-12 rounded-full bg-[var(--input-bg)] border border-[var(--border-soft)] hover:bg-[var(--nav-active-bg)] flex items-center justify-center transition-colors overflow-hidden"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        className={`absolute transition-all duration-300 ${
          isDark ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'
        }`}
      >
        <circle cx="12" cy="12" r="5" fill="var(--text-muted)" />
        <g stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.2" y1="4.2" x2="5.6" y2="5.6" />
          <line x1="18.4" y1="18.4" x2="19.8" y2="19.8" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.2" y1="19.8" x2="5.6" y2="18.4" />
          <line x1="18.4" y1="5.6" x2="19.8" y2="4.2" />
        </g>
      </svg>

      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className={`absolute transition-all duration-300 ${
          isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'
        }`}
      >
        <path
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
          fill="var(--text-muted)"
        />
      </svg>
    </button>
  )
}

export default ThemeToggle