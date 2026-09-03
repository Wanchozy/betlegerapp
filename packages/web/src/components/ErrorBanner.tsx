import { AlertTriangle } from 'lucide-react'

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
      <AlertTriangle size={16} className="flex-shrink-0" />
      {message}
    </div>
  )
}
