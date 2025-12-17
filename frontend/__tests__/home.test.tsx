import { render, screen } from '@testing-library/react'
import Home from '../app/page'

describe('Home page', () => {
  it('renders main navigation links', () => {
    render(<Home />)

    expect(screen.getByText('PBL Medical System')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Dashboard/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Flashcards/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Courses/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Library/ })).toBeInTheDocument()
  })
})
