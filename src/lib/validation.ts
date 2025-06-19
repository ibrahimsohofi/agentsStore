import { z } from 'zod'

// Base validation schemas
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

export const strongPasswordSchema = passwordSchema
  .min(12, 'Password must be at least 12 characters for strong security')

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')

export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .or(z.literal(''))

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number')
  .min(10, 'Phone number must be at least 10 digits')
  .max(20, 'Phone number must be less than 20 digits')

// File validation
export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, 'Image must be less than 5MB')
  .refine(
    (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
    'Only JPEG, PNG, and WebP images are allowed'
  )

export const documentFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 10 * 1024 * 1024, 'Document must be less than 10MB')
  .refine(
    (file) => ['application/pdf', 'text/plain', 'text/markdown'].includes(file.type),
    'Only PDF, TXT, and MD files are allowed'
  )

export const agentFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 50 * 1024 * 1024, 'Agent file must be less than 50MB')
  .refine(
    (file) => [
      'application/python',
      'text/python',
      'application/javascript',
      'text/javascript',
      'application/zip',
      'application/x-zip-compressed',
      'text/plain'
    ].includes(file.type) || file.name.endsWith('.py') || file.name.endsWith('.js') || file.name.endsWith('.zip'),
    'Only Python, JavaScript, ZIP, and text files are allowed'
  )

// Agent-specific schemas
export const agentNameSchema = z
  .string()
  .min(3, 'Agent name must be at least 3 characters')
  .max(100, 'Agent name must be less than 100 characters')
  .regex(/^[a-zA-Z0-9\s-_.]+$/, 'Agent name can only contain letters, numbers, spaces, hyphens, underscores, and periods')

export const agentDescriptionSchema = z
  .string()
  .min(20, 'Description must be at least 20 characters')
  .max(2000, 'Description must be less than 2000 characters')

export const agentPriceSchema = z
  .number()
  .min(0.01, 'Price must be at least $0.01')
  .max(9999.99, 'Price must be less than $10,000')
  .multipleOf(0.01, 'Price must be to the nearest cent')

export const agentCategorySchema = z
  .enum([
    'automation',
    'data-analysis',
    'content-creation',
    'customer-service',
    'development',
    'design',
    'marketing',
    'productivity',
    'education',
    'entertainment',
    'finance',
    'healthcare',
    'other'
  ], {
    errorMap: () => ({ message: 'Please select a valid category' })
  })

export const agentTagsSchema = z
  .array(z.string().min(1).max(30))
  .max(10, 'Maximum 10 tags allowed')
  .optional()

// Form schemas
export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

export const forgotPasswordSchema = z.object({
  email: emailSchema
})

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export const profileUpdateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  website: urlSchema.optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  avatar: imageFileSchema.optional()
})

export const agentUploadSchema = z.object({
  name: agentNameSchema,
  description: agentDescriptionSchema,
  price: agentPriceSchema,
  category: agentCategorySchema,
  tags: agentTagsSchema,
  files: z.array(agentFileSchema).min(1, 'At least one file is required'),
  image: imageFileSchema.optional(),
  documentation: documentFileSchema.optional()
})

export const agentUpdateSchema = agentUploadSchema.partial().extend({
  id: z.string().min(1, 'Agent ID is required')
})

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be less than 1000 characters'),
  agentId: z.string().min(1, 'Agent ID is required')
})

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(100, 'Subject must be less than 100 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters').max(1000, 'Message must be less than 1000 characters')
})

export const searchSchema = z.object({
  query: z.string().max(200, 'Search query must be less than 200 characters').optional(),
  category: agentCategorySchema.optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().max(10000).optional(),
  sortBy: z.enum(['newest', 'oldest', 'price-low', 'price-high', 'rating', 'popular']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional()
})

// Validation utilities
export type ValidationResult<T> = {
  success: boolean
  data?: T
  errors?: { [key: string]: string }
}

export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: { [key: string]: string } = {}
      for (const err of error.errors) {
        const path = err.path.join('.')
        errors[path] = err.message
      }
      return { success: false, errors }
    }
    return { success: false, errors: { general: 'Validation failed' } }
  }
}

export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { isValid: boolean; error?: string } {
  try {
    schema.parse(value)
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message }
    }
    return { isValid: false, error: 'Validation failed' }
  }
}

// Sanitization utilities
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid chars with underscore
    .replace(/_+/g, '_') // Collapse multiple underscores
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
}

// Rate limiting utilities
export function createRateLimiter(maxAttempts: number, windowMs: number) {
  const attempts = new Map<string, { count: number; resetTime: number }>()

  return {
    isAllowed: (identifier: string): boolean => {
      const now = Date.now()
      const record = attempts.get(identifier)

      if (!record || now > record.resetTime) {
        attempts.set(identifier, { count: 1, resetTime: now + windowMs })
        return true
      }

      if (record.count >= maxAttempts) {
        return false
      }

      record.count++
      return true
    },
    getRemainingAttempts: (identifier: string): number => {
      const record = attempts.get(identifier)
      if (!record || Date.now() > record.resetTime) {
        return maxAttempts
      }
      return Math.max(0, maxAttempts - record.count)
    },
    getResetTime: (identifier: string): number => {
      const record = attempts.get(identifier)
      return record?.resetTime || 0
    }
  }
}

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s-()]+$/,
  url: /^https?:\/\/[^\s$.?#].[^\s]*$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  slug: /^[a-z0-9-]+$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  ipAddress: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
}

// Export types
export type SignUpData = z.infer<typeof signUpSchema>
export type SignInData = z.infer<typeof signInSchema>
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>
export type AgentUploadData = z.infer<typeof agentUploadSchema>
export type AgentUpdateData = z.infer<typeof agentUpdateSchema>
export type ReviewData = z.infer<typeof reviewSchema>
export type ContactData = z.infer<typeof contactSchema>
export type SearchData = z.infer<typeof searchSchema>
