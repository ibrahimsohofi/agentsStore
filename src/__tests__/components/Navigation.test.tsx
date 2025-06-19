import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Simple test component to verify Jest setup
function SimpleNavigation() {
  return (
    <nav>
      <div>AgentStore</div>
      <div>Browse Agents</div>
      <div>Sell</div>
      <input placeholder="Search agents..." />
      <div>Sign In</div>
    </nav>
  )
}

describe('Navigation Component', () => {
  it('renders navigation elements correctly', () => {
    render(<SimpleNavigation />)

    expect(screen.getByText('AgentStore')).toBeInTheDocument()
    expect(screen.getByText('Browse Agents')).toBeInTheDocument()
    expect(screen.getByText('Sell')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search agents/i)).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })
})
