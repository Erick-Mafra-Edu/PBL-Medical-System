import { render, screen } from '@testing-library/react'
import DashboardPage from '../app/dashboard/page'

describe('Dashboard page', () => {
  it('shows KPI cards and recent activity', () => {
    render(<DashboardPage />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Cards Due Today')).toBeInTheDocument()
    expect(screen.getByText('Total Cards')).toBeInTheDocument()
    expect(screen.getByText('Study Streak')).toBeInTheDocument()
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })
})
