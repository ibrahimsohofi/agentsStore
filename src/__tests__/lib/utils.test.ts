import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn function', () => {
    it('merges classes correctly', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
      const result = cn('class1', false && 'class2', 'class3')
      expect(result).toBe('class1 class3')
    })

    it('handles undefined and null values', () => {
      const result = cn('class1', undefined, null, 'class2')
      expect(result).toBe('class1 class2')
    })

    it('handles empty strings', () => {
      const result = cn('class1', '', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('merges conflicting Tailwind classes correctly', () => {
      const result = cn('p-4', 'p-2')
      expect(result).toBe('p-2')
    })
  })
})
