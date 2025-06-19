import React from 'react'
import { Loader2, Clock, Download, Search, ShoppingCart, Upload, Users, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Basic loading spinner
export function LoadingSpinner({
  size = 'default',
  className
}: {
  size?: 'sm' | 'default' | 'lg'
  className?: string
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <Loader2
      className={cn('animate-spin', sizeClasses[size], className)}
    />
  )
}

// Loading with text
export function LoadingWithText({
  text = 'Loading...',
  size = 'default',
  className
}: {
  text?: string
  size?: 'sm' | 'default' | 'lg'
  className?: string
}) {
  const sizeClasses = {
    sm: 'h-4 w-4 text-sm',
    default: 'h-6 w-6 text-base',
    lg: 'h-8 w-8 text-lg'
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size].split(' ').slice(0, 2).join(' '))} />
      <span className={cn('text-muted-foreground', sizeClasses[size].split(' ')[2])}>{text}</span>
    </div>
  )
}

// Contextual loading indicators
export function ContextualLoading({
  type,
  text,
  size = 'default',
  className
}: {
  type: 'search' | 'upload' | 'download' | 'cart' | 'analytics' | 'users' | 'processing'
  text?: string
  size?: 'sm' | 'default' | 'lg'
  className?: string
}) {
  const iconMap = {
    search: Search,
    upload: Upload,
    download: Download,
    cart: ShoppingCart,
    analytics: BarChart3,
    users: Users,
    processing: Clock,
  }

  const textMap = {
    search: 'Searching...',
    upload: 'Uploading...',
    download: 'Downloading...',
    cart: 'Processing cart...',
    analytics: 'Loading analytics...',
    users: 'Loading users...',
    processing: 'Processing...',
  }

  const Icon = iconMap[type]
  const defaultText = textMap[type]

  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Icon className={cn('animate-pulse', sizeClasses[size])} />
      <span className="text-muted-foreground">{text || defaultText}</span>
    </div>
  )
}

// Page loading overlay
export function PageLoading({
  title = 'Loading',
  subtitle,
  showProgress = false,
  progress = 0
}: {
  title?: string
  subtitle?: string
  showProgress?: boolean
  progress?: number
}) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <LoadingSpinner size="lg" />
            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {showProgress && (
              <div className="w-full">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Skeleton loading for cards
export function AgentCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <Skeleton className="h-48 w-full mb-4 rounded-lg" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

// Skeleton for lists
export function ListItemSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`list-item-skeleton-${Date.now()}-${i}`} className="flex items-center space-x-4 p-3 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

// Skeleton for tables
export function TableSkeleton({
  rows = 5,
  columns = 4
}: {
  rows?: number
  columns?: number
}) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4 p-3 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-col-${Date.now()}-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={`table-skeleton-row-${Date.now()}-${i}`} className="flex space-x-4 p-3">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={`table-skeleton-col-${Date.now()}-${i}-${j}`} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// Loading state for forms
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  )
}

// Dashboard loading state
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={`dashboard-card-${Date.now()}-${i}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-28 mb-4" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Inline loading for buttons
export function ButtonLoading({ children, loading, ...props }: {
  children: React.ReactNode
  loading: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button disabled={loading} {...props}>
      {loading ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          {children}
        </div>
      ) : (
        children
      )}
    </button>
  )
}

// Progressive loading dots
export function LoadingDots({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-1 w-1',
    default: 'h-2 w-2',
    lg: 'h-3 w-3'
  }

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-current rounded-full animate-pulse',
            sizeClasses[size]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  )
}

// Custom hook for loading states
export function useLoadingState(initialState = false) {
  const [loading, setLoading] = React.useState(initialState)
  const [error, setError] = React.useState<string | null>(null)

  const startLoading = React.useCallback(() => {
    setLoading(true)
    setError(null)
  }, [])

  const stopLoading = React.useCallback(() => {
    setLoading(false)
  }, [])

  const setLoadingError = React.useCallback((error: string) => {
    setLoading(false)
    setError(error)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    clearError,
  }
}
