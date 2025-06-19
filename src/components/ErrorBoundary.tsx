'use client'

import React, { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  level?: 'page' | 'component' | 'critical'
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  retryCount: number
}

class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo)
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })
  }

  private logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a real app, this would send to a service like Sentry, LogRocket, etc.
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level: this.props.level || 'component',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    // Mock service call
    console.error('Error logged to service:', errorData)
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1,
      }))
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private renderError() {
    const { level = 'component' } = this.props
    const { error, retryCount } = this.state
    const canRetry = retryCount < this.maxRetries

    // Use custom fallback if provided
    if (this.props.fallback) {
      return this.props.fallback
    }

    // Different UI based on error level
    if (level === 'critical') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-950">
          <Card className="w-full max-w-md border-red-200 dark:border-red-800">
            <CardHeader className="text-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-700 dark:text-red-300">Critical Error</CardTitle>
              <CardDescription className="text-red-600 dark:text-red-400">
                The application encountered a critical error and cannot continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
                <p className="text-sm font-mono text-red-800 dark:text-red-200">
                  {error?.message || 'Unknown error occurred'}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={this.handleReload} variant="destructive">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Application
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    if (level === 'page') {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="w-full max-w-lg border-orange-200 dark:border-orange-800">
            <CardHeader className="text-center">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <CardTitle className="text-orange-700 dark:text-orange-300">Page Error</CardTitle>
              <CardDescription className="text-orange-600 dark:text-orange-400">
                This page encountered an error and couldn't load properly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-lg mb-4">
                  <p className="text-sm font-mono text-orange-800 dark:text-orange-200">
                    {error?.message || 'Unknown error occurred'}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2 justify-center">
              <Button onClick={this.handleGoHome} variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
              {canRetry && (
                <Button onClick={this.handleRetry}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again ({this.maxRetries - retryCount} left)
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )
    }

    // Component level error (default)
    return (
      <div className="p-4 border border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-950">
        <div className="flex items-center gap-3 mb-3">
          <Bug className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <h3 className="text-amber-800 dark:text-amber-200 font-medium">
            Component Error
          </h3>
        </div>
        <p className="text-amber-700 dark:text-amber-300 text-sm mb-3">
          This component encountered an error and couldn't render properly.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded text-xs font-mono text-amber-800 dark:text-amber-200 mb-3">
            {error?.message || 'Unknown error occurred'}
          </div>
        )}
        {canRetry && (
          <Button onClick={this.handleRetry} size="sm" variant="outline">
            <RefreshCw className="h-3 w-3 mr-2" />
            Retry ({this.maxRetries - retryCount} left)
          </Button>
        )}
      </div>
    )
  }

  render() {
    if (this.state.hasError) {
      return this.renderError()
    }

    return this.props.children
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Hook for manual error reporting
export function useErrorHandler() {
  return React.useCallback((error: Error, context?: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Manual error report ${context ? `[${context}]` : ''}:`, error)
    }

    // In production, log to service
    if (process.env.NODE_ENV === 'production') {
      const errorData = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }
      console.error('Manual error logged to service:', errorData)
    }
  }, [])
}

export default ErrorBoundary
