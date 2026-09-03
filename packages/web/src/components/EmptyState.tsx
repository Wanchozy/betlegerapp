import type { ComponentType } from 'react'
import { Inbox } from 'lucide-react'

interface Props {
  icon?: ComponentType<{ size?: number; className?: string }>
  title: string
  description?: string
}

export function EmptyState({ icon: Icon = Inbox, title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-cream-200 bg-white/50 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-100 text-gray-400">
        <Icon size={22} />
      </div>
      <p className="font-medium text-gray-600">{title}</p>
      {description && <p className="max-w-xs text-sm text-gray-400">{description}</p>}
    </div>
  )
}
