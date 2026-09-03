interface Props {
  value: number
  /** Colors the amount green (positive), red (negative), or gray (zero). */
  colorize?: boolean
  /** Prefixes positive amounts with a "+". Negative amounts always get a "-". */
  showSign?: boolean
  className?: string
}

export function Money({ value, colorize = false, showSign = false, className = '' }: Props) {
  const sign = value < 0 ? '-' : showSign && value > 0 ? '+' : ''
  const formatted = `${sign}$${Math.abs(value).toFixed(2)}`
  const color = colorize ? (value > 0 ? 'text-emerald-600' : value < 0 ? 'text-red-500' : 'text-gray-500') : ''

  return <span className={`tabular-nums ${color} ${className}`}>{formatted}</span>
}
