import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock component for testing
function TestComponent() {
  return <div>Hello World</div>
}

describe('Example Test', () => {
  it('renders without crashing', () => {
    render(<TestComponent />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
