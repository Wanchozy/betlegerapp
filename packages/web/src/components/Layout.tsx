import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListTodo, BarChart3 } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bets', label: 'Bets', icon: ListTodo },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <nav className="border-b border-gray-800 bg-gray-900 px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-lg font-bold text-emerald-400">BetLedger</span>
          <div className="flex gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-gray-400 hover:text-gray-200'
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  )
}
