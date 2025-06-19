import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Simple test component to verify Jest setup
function SimpleCart() {
  return (
    <div>
      <h2>Shopping Cart</h2>
      <div>Test Agent 1 - $29.99</div>
      <div>Test Agent 2 - $49.99</div>
      <div>Total: $79.98</div>
      <button>Remove</button>
      <button>Checkout</button>
    </div>
  )
}

describe('Cart Component', () => {
  it('renders cart elements correctly', () => {
    render(<SimpleCart />)

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument()
    expect(screen.getByText(/Test Agent 1.*29.99/)).toBeInTheDocument()
    expect(screen.getByText(/Test Agent 2.*49.99/)).toBeInTheDocument()
    expect(screen.getByText(/Total.*79.98/)).toBeInTheDocument()
    expect(screen.getByText('Remove')).toBeInTheDocument()
    expect(screen.getByText('Checkout')).toBeInTheDocument()
  })
})
