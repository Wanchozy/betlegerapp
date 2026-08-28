import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { BetsPage } from './pages/BetsPage'
import { ReportsPage } from './pages/ReportsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/bets" element={<BetsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
