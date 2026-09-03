import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { isDemoMode } from '../api/bets'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-cream text-ink">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {isDemoMode && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-xs font-medium text-amber-700">
            Demo mode: showing sample data, changes are not saved. Add Supabase
            credentials to <code>packages/web/.env</code> to use a real database.
          </div>
        )}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
