import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListTodo, BarChart3, Landmark } from 'lucide-react'
import { isDemoMode } from '../api/bets'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/bets', label: 'Bets', icon: ListTodo, end: false },
  { to: '/reports', label: 'Reports', icon: BarChart3, end: false },
]

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col bg-sidebar text-gray-300">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
          <Landmark size={18} />
        </div>
        <span className="font-serif text-lg font-semibold text-white">BetLedger</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-active text-white'
                  : 'text-gray-400 hover:bg-sidebar-active/60 hover:text-gray-100'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-6 py-5">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span
            className={`h-1.5 w-1.5 rounded-full ${isDemoMode ? 'bg-amber-400' : 'bg-emerald-400'}`}
          />
          {isDemoMode ? 'Demo mode' : 'Connected'}
        </div>
      </div>
    </aside>
  )
}
