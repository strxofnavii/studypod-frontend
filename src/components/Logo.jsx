function Logo({ light = false }) {
  const textColor = light ? 'text-white' : 'text-[var(--color-ink)]'
  return (
    <div className="flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 40 40">
        <rect width="40" height="40" rx="14" fill="var(--color-mint)" />
        <path
          d="M20 28 Q12 26 11 16 Q21 17 22 27 Z"
          fill="var(--color-forest)"
        />
        <path
          d="M20 28 Q28 25 28 15 Q19 17 20 28 Z"
          fill="var(--color-ink)"
        />
      </svg>
      <span className={`font-display text-xl font-bold ${textColor}`}>
        Study Pod
      </span>
    </div>
  )
}

export default Logo