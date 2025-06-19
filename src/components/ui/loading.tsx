import type React from 'react'
import { Loader2, ShoppingCart, User, Star, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

// Basic spinner component
export function Spinner({ className, size = 'default' }: {
  className?: string
  size?: 'sm' | 'default' | 'lg'
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  )
}

// Full page loading screen
export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4 text-blue-600" />
        <p className="text-muted-foreground text-lg">{message}</p>
      </div>
    </div>
  )
}

// Button loading state
export function ButtonLoader({
  children,
  loading = false,
  className,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center',
        loading && 'cursor-not-allowed opacity-70',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" className="mr-2" />}
      {children}
    </button>
  )
}

// Skeleton loaders for different content types
export function SkeletonLine({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-muted rounded h-4', className)} />
  )
}

export function SkeletonCard() {
  return (
    <div className="p-6 border border-border rounded-lg shadow-sm animate-pulse">
      <div className="flex space-x-4">
        <div className="rounded-md bg-muted h-12 w-12" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-muted rounded" />
        <div className="h-3 bg-muted rounded w-5/6" />
        <div className="h-3 bg-muted rounded w-3/4" />
      </div>
    </div>
  )
}

// Agent card skeleton
export function AgentCardSkeleton() {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden animate-pulse">
      <div className="h-48 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded" />
          <div className="h-3 bg-muted rounded w-5/6" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-6 w-16 bg-muted rounded" />
          <div className="h-8 w-20 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}

// Data table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={`table-row-${Math.random()}-${i}`} className="flex space-x-4">
          {Array.from({ length: columns }, (_, j) => (
            <div key={`table-col-${Math.random()}-${j}`} className="flex-1">
              <SkeletonLine className={j === 0 ? 'w-1/3' : j === columns - 1 ? 'w-1/4' : 'w-full'} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// Loading overlay for existing content
export function LoadingOverlay({
  loading = false,
  children,
  message = 'Loading...'
}: {
  loading?: boolean
  children: React.ReactNode
  message?: string
}) {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <Spinner className="mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Contextual loading states with icons
export function CartLoader() {
  return (
    <div className="flex items-center space-x-2 text-muted-foreground">
      <ShoppingCart className="h-4 w-4 animate-pulse" />
      <span className="text-sm">Updating cart...</span>
    </div>
  )
}

export function UserLoader() {
  return (
    <div className="flex items-center space-x-2 text-muted-foreground">
      <User className="h-4 w-4 animate-pulse" />
      <span className="text-sm">Loading profile...</span>
    </div>
  )
}

export function ReviewLoader() {
  return (
    <div className="flex items-center space-x-2 text-muted-foreground">
      <Star className="h-4 w-4 animate-pulse" />
      <span className="text-sm">Loading reviews...</span>
    </div>
  )
}

export function DocumentLoader() {
  return (
    <div className="flex items-center space-x-2 text-muted-foreground">
      <FileText className="h-4 w-4 animate-pulse" />
      <span className="text-sm">Loading content...</span>
    </div>
  )
}

// Grid skeleton for agent listings
export function AgentGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <AgentCardSkeleton key={`agent-card-${Date.now()}-${i}`} />
      ))}
    </div>
  )
}

// List skeleton for orders/reviews
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={`list-item-${Date.now()}-${i}`} />
      ))}
    </div>
  )
}

// Inline loading state for buttons and small actions
export function InlineLoader({ message }: { message?: string }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Spinner size="sm" />
      {message && <span>{message}</span>}
    </div>
  )
}

// Search results skeleton
export function SearchSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <SkeletonLine className="w-32 h-6" />
        <SkeletonLine className="w-24 h-8" />
      </div>
      <AgentGridSkeleton count={9} />
    </div>
  )
}
