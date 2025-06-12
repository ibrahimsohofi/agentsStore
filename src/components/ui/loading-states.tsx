import { Loader2, Bot, Search, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <Loader2
      className={cn('animate-spin', sizeClasses[size], className)}
    />
  )
}

interface LoadingCardProps {
  className?: string
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn('animate-pulse bg-gray-200 rounded-lg', className)}>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      </div>
    </div>
  )
}

export function LoadingCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} className="h-64" />
      ))}
    </div>
  )
}

interface PageLoadingProps {
  message?: string
  icon?: React.ReactNode
}

export function PageLoading({ message = 'Loading...', icon }: PageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          {icon || <LoadingSpinner size="lg" />}
        </div>
        <p className="text-lg text-gray-600">{message}</p>
      </div>
    </div>
  )
}

export function AgentLoadingPage() {
  return (
    <PageLoading
      message="Loading agents..."
      icon={<Bot className="h-8 w-8 animate-bounce text-blue-600" />}
    />
  )
}

export function SearchLoadingPage() {
  return (
    <PageLoading
      message="Searching..."
      icon={<Search className="h-8 w-8 animate-pulse text-green-600" />}
    />
  )
}

export function CheckoutLoadingPage() {
  return (
    <PageLoading
      message="Processing your order..."
      icon={<ShoppingCart className="h-8 w-8 animate-bounce text-purple-600" />}
    />
  )
}

// Skeleton for specific components
export function AgentCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border animate-pulse">
      <div className="p-6 space-y-4">
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-4/5"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  )
}

export function UserProfileSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border animate-pulse">
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
}

// Button loading state
interface LoadingButtonProps {
  loading?: boolean
  children: React.ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
}

export function LoadingButton({ loading, children, className, disabled, onClick }: LoadingButtonProps) {
  return (
    <button
      className={cn('inline-flex items-center justify-center gap-2 transition-colors', className)}
      disabled={loading || disabled}
      onClick={onClick}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  )
}
