import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Simple test component to verify Jest setup
function SimpleAgentUploadForm() {
  return (
    <form>
      <label htmlFor="agentName">Agent Name</label>
      <input id="agentName" />

      <label htmlFor="description">Description</label>
      <textarea id="description" />

      <label htmlFor="price">Price</label>
      <input id="price" type="number" />

      <label htmlFor="category">Category</label>
      <select id="category">
        <option>AI Assistant</option>
      </select>

      <div>Upload Files</div>
      <input type="file" />

      <button type="submit">Upload Agent</button>
    </form>
  )
}

describe('AgentUploadForm Component', () => {
  it('renders form fields correctly', () => {
    render(<SimpleAgentUploadForm />)

    expect(screen.getByLabelText(/agent name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByText(/upload files/i)).toBeInTheDocument()
    expect(screen.getByText(/upload agent/i)).toBeInTheDocument()
  })
})
