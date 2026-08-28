import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { PNLSummary as PNLSummaryType } from '@betledger/shared'
import { PNLSummary } from './PNLSummary'

const summary: PNLSummaryType = {
  total_bets: 10,
  wins: 6,
  losses: 3,
  pushes: 1,
  total_stake: 1000,
  total_profit_loss: 250,
  win_rate: 0.6,
  roi: 0.25,
}

describe('PNLSummary', () => {
  it('renders the title and formatted stats', () => {
    render(<PNLSummary summary={summary} title="This Week" />)

    expect(screen.getByText('This Week')).toBeInTheDocument()
    expect(screen.getByText('$1000.00')).toBeInTheDocument()
    expect(screen.getByText('+$250.00')).toBeInTheDocument()
    expect(screen.getByText('60.0%')).toBeInTheDocument()
    expect(screen.getByText('25.0%')).toBeInTheDocument()
    expect(screen.getByText('6W')).toBeInTheDocument()
    expect(screen.getByText('3L')).toBeInTheDocument()
    expect(screen.getByText('1P')).toBeInTheDocument()
  })

  it('renders negative P&L without a leading plus sign', () => {
    render(
      <PNLSummary
        summary={{ ...summary, total_profit_loss: -50, roi: -0.05 }}
        title="This Month"
      />
    )

    expect(screen.getByText('$-50.00')).toBeInTheDocument()
  })
})
