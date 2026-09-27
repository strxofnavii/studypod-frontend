function PlantMascot({ size = 140 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className="mascot-sway"
    >
      {/* Pot */}
      <path d="M65 145 L135 145 L125 185 Q100 195 75 185 Z" fill="var(--color-forest)" />
      <rect x="62" y="135" width="76" height="16" rx="8" fill="var(--color-ink)" />

      {/* Stem */}
      <path d="M100 135 Q95 110 100 90" stroke="var(--color-forest)" strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* Leaves */}
      <path d="M100 100 Q65 90 55 55 Q95 60 100 100 Z" fill="var(--color-mint)" />
      <path d="M100 95 Q135 85 145 50 Q105 55 100 95 Z" fill="var(--color-forest)" />

      {/* Face on pot */}
      <circle cx="85" cy="163" r="3.5" fill="var(--color-ink)" />
      <circle cx="115" cy="163" r="3.5" fill="var(--color-ink)" />
      <path d="M88 172 Q100 180 112 172" stroke="var(--color-ink)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="76" cy="168" r="5" fill="#FFC4B8" opacity="0.7" />
      <circle cx="124" cy="168" r="5" fill="#FFC4B8" opacity="0.7" />
    </svg>
  )
}

export default PlantMascot
