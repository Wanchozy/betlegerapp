import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BetForm } from './BetForm'

describe('BetForm', () => {
  it('submits the entered values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(<BetForm onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText(/chiefs vs eagles/i), 'Lakers vs Celtics')
    await user.clear(screen.getByPlaceholderText(/-110/i))
    await user.type(screen.getByPlaceholderText(/-110/i), '120')
    await user.clear(screen.getByPlaceholderText(/e.g. 100/i))
    await user.type(screen.getByPlaceholderText(/e.g. 100/i), '50')
    await user.click(screen.getByRole('button', { name: /add bet/i }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'Lakers vs Celtics',
        odds: 120,
        stake: 50,
        sport: 'NFL',
        bet_type: 'moneyline',
        outcome: 'pending',
      })
    )
  })

  it('resets the form after a successful submit when creating (not editing)', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(<BetForm onSubmit={onSubmit} />)

    const eventInput = screen.getByPlaceholderText(/chiefs vs eagles/i)
    await user.type(eventInput, 'Lakers vs Celtics')
    await user.click(screen.getByRole('button', { name: /add bet/i }))

    expect(eventInput).toHaveValue('')
  })

  it('shows an "Update Bet" label when editing an existing bet', () => {
    render(
      <BetForm
        onSubmit={vi.fn()}
        initial={{ event: 'Lakers vs Celtics', odds: -120, stake: 75 }}
      />
    )

    expect(screen.getByDisplayValue('Lakers vs Celtics')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /update bet/i })).toBeInTheDocument()
  })

  it('keeps the entered values when the submission fails', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new Error('boom'))

    render(<BetForm onSubmit={onSubmit} />)

    const eventInput = screen.getByPlaceholderText(/chiefs vs eagles/i)
    await user.type(eventInput, 'Lakers vs Celtics')
    await user.click(screen.getByRole('button', { name: /add bet/i }))

    expect(eventInput).toHaveValue('Lakers vs Celtics')
  })
})
