import { renderHook, act } from '@testing-library/react'
import { useCartStore, useAuthStore, useReviewStore } from '@/lib/store'

// Mock agent data
const mockCartItem = {
  id: '1',
  agentId: '1',
  name: 'Test Agent',
  price: 29.99,
  seller: 'test-seller',
  image: '/test-image.jpg',
}

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'buyer' as const,
  verified: true,
  joinedDate: '2024-01-01',
}

describe('Store', () => {
  describe('Cart Store', () => {
    beforeEach(() => {
      // Reset store before each test
      const { result } = renderHook(() => useCartStore())
      act(() => {
        result.current.clearCart()
      })
    })

    it('adds item to cart', () => {
      const { result } = renderHook(() => useCartStore())

      act(() => {
        result.current.addItem(mockCartItem)
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0]).toEqual(mockCartItem)
    })

    it('removes item from cart', () => {
      const { result } = renderHook(() => useCartStore())

      act(() => {
        result.current.addItem(mockCartItem)
        result.current.removeItem('1')
      })

      expect(result.current.items).toHaveLength(0)
    })

    it('clears entire cart', () => {
      const { result } = renderHook(() => useCartStore())

      act(() => {
        result.current.addItem(mockCartItem)
        result.current.addItem({ ...mockCartItem, id: '2', agentId: '2', name: 'Agent 2' })
        result.current.clearCart()
      })

      expect(result.current.items).toHaveLength(0)
    })

    it('calculates cart total correctly', () => {
      const { result } = renderHook(() => useCartStore())

      act(() => {
        result.current.addItem(mockCartItem)
        result.current.addItem({ ...mockCartItem, id: '2', agentId: '2', price: 50.00 })
      })

      expect(result.current.getTotalPrice()).toBe(79.99)
    })

    it('gets items count correctly', () => {
      const { result } = renderHook(() => useCartStore())

      act(() => {
        result.current.addItem(mockCartItem)
        result.current.addItem({ ...mockCartItem, id: '2', agentId: '2' })
      })

      expect(result.current.getItemsCount()).toBe(2)
    })
  })

  describe('Auth Store', () => {
    beforeEach(() => {
      // Reset store before each test
      const { result } = renderHook(() => useAuthStore())
      act(() => {
        result.current.logout()
      })
    })

    it('handles login successfully', async () => {
      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        const success = await result.current.login('test@example.com', 'password')
        expect(success).toBe(true)
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toBeTruthy()
      expect(result.current.user?.email).toBe('test@example.com')
    })

    it('handles logout', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })

    it('updates user data', async () => {
      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.login('test@example.com', 'password')
        result.current.updateUser({ name: 'Updated Name' })
      })

      expect(result.current.user?.name).toBe('Updated Name')
    })
  })

  describe('Review Store', () => {
    beforeEach(() => {
      // Reset store before each test by clearing reviews
      const { result } = renderHook(() => useReviewStore())
      act(() => {
        // Clear all reviews by setting the store state directly
        result.current.reviews.length = 0
      })
    })

    const mockReview = {
      agentId: '1',
      userId: '1',
      userName: 'Test User',
      rating: 5,
      comment: 'Great agent!',
    }

    it('adds review successfully', () => {
      const { result } = renderHook(() => useReviewStore())

      act(() => {
        result.current.addReview(mockReview)
      })

      const reviews = result.current.getReviewsByAgent('1')
      expect(reviews).toHaveLength(1)
      expect(reviews[0].comment).toBe('Great agent!')
    })

    it('gets reviews by agent ID', () => {
      const { result } = renderHook(() => useReviewStore())

      act(() => {
        result.current.addReview(mockReview)
        result.current.addReview({ ...mockReview, agentId: '2' })
      })

      const agent1Reviews = result.current.getReviewsByAgent('1')
      const agent2Reviews = result.current.getReviewsByAgent('2')

      expect(agent1Reviews).toHaveLength(1)
      expect(agent2Reviews).toHaveLength(1)
    })

    it('marks review as helpful', () => {
      const { result } = renderHook(() => useReviewStore())

      act(() => {
        result.current.addReview(mockReview)
      })

      const review = result.current.getReviewsByAgent('1')[0]

      act(() => {
        result.current.markHelpful(review.id)
      })

      const updatedReview = result.current.getReviewsByAgent('1')[0]
      expect(updatedReview.helpful).toBe(1)
    })
  })
})
