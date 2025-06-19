import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface ApiCallOptions<T = unknown> {
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
  errorMessage?: string
}

interface UseApiCallResult<T, TArgs extends readonly unknown[] = readonly unknown[]> extends ApiState<T> {
  execute: (...args: TArgs) => Promise<T | null>
  reset: () => void
  refetch: () => Promise<T | null>
}

/**
 * Hook for handling API calls with loading, error states, and automatic retries
 */
export function useApiCall<T = unknown, TArgs extends readonly unknown[] = readonly unknown[]>(
  apiFunction: (...args: TArgs) => Promise<T>,
  options: ApiCallOptions<T> = {}
): UseApiCallResult<T, TArgs> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const lastArgsRef = useRef<TArgs>([] as unknown as TArgs)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const execute = useCallback(
    async (...args: TArgs): Promise<T | null> => {
      lastArgsRef.current = args

      setState(prev => ({ ...prev, loading: true, error: null }))

      try {
        const result = await apiFunction(...args)

        if (mountedRef.current) {
          setState({
            data: result,
            loading: false,
            error: null,
          })

          if (options.showSuccessToast && options.successMessage) {
            toast.success(options.successMessage)
          }

          options.onSuccess?.(result)
        }

        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'

        if (mountedRef.current) {
          setState({
            data: null,
            loading: false,
            error: errorMessage,
          })

          if (options.showErrorToast !== false) {
            toast.error(options.errorMessage || errorMessage)
          }

          options.onError?.(errorMessage)
        }

        return null
      }
    },
    [apiFunction, options]
  )

  const refetch = useCallback(() => {
    return execute(...lastArgsRef.current)
  }, [execute])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    })
  }, [])

  return {
    ...state,
    execute,
    reset,
    refetch,
  }
}

/**
 * Hook for fetching data on component mount with optional auto-refresh
 */
export function useFetch<T = unknown>(
  apiFunction: () => Promise<T>,
  options: {
    immediate?: boolean
    refreshInterval?: number
    deps?: React.DependencyList
  } & ApiCallOptions<T> = {}
): UseApiCallResult<T, []> & { refresh: () => Promise<T | null> } {
  const { immediate = true, refreshInterval, deps = [] } = options
  const apiCall = useApiCall(apiFunction, options)
  const intervalRef = useRef<NodeJS.Timeout>()

  const refresh = useCallback(() => {
    return apiCall.execute()
  }, [apiCall])

  useEffect(() => {
    if (immediate) {
      refresh()
    }
  }, [immediate, refresh, ...deps])

  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(refresh, refreshInterval)
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [refresh, refreshInterval])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    ...apiCall,
    refresh,
  }
}

/**
 * Hook for mutations (POST, PUT, DELETE) with optimistic updates
 */
export function useMutation<T = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<T>,
  options: {
    onMutate?: (variables: TVariables) => void | Promise<void>
    onSuccess?: (data: T, variables: TVariables) => void
    onError?: (error: string, variables: TVariables) => void
    onSettled?: (data: T | null, error: string | null, variables: TVariables) => void
  } & ApiCallOptions<T> = {}
) {
  const apiCall = useApiCall(mutationFn, options)

  const mutate = useCallback(
    async (variables: TVariables): Promise<T | null> => {
      try {
        options.onMutate?.(variables)
        const result = await apiCall.execute(variables)

        if (result) {
          options.onSuccess?.(result, variables)
        }

        options.onSettled?.(result, null, variables)
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Mutation failed'
        options.onError?.(errorMessage, variables)
        options.onSettled?.(null, errorMessage, variables)
        return null
      }
    },
    [apiCall, options]
  )

  return {
    ...apiCall,
    mutate,
  }
}

/**
 * Hook for retrying failed operations with exponential backoff
 */
export function useRetry<T = unknown>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number
    baseDelay?: number
    maxDelay?: number
    backoffFactor?: number
    retryCondition?: (error: Error) => boolean
  } = {}
) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = () => true,
  } = options

  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const executeWithRetry = useCallback(async (): Promise<T | null> => {
    let currentRetry = 0

    while (currentRetry <= maxRetries) {
      try {
        const result = await operation()
        setRetryCount(0)
        setIsRetrying(false)
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error')

        if (currentRetry === maxRetries || !retryCondition(err)) {
          setIsRetrying(false)
          throw error
        }

        currentRetry++
        setRetryCount(currentRetry)
        setIsRetrying(true)

        const delay = Math.min(baseDelay * backoffFactor ** (currentRetry - 1), maxDelay)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    return null
  }, [operation, maxRetries, baseDelay, maxDelay, backoffFactor, retryCondition])

  return {
    executeWithRetry,
    retryCount,
    isRetrying,
    reset: () => {
      setRetryCount(0)
      setIsRetrying(false)
    }
  }
}

/**
 * Hook for debounced API calls (useful for search)
 */
export function useDebouncedApiCall<T = unknown, TArgs extends readonly unknown[] = readonly unknown[]>(
  apiFunction: (...args: TArgs) => Promise<T>,
  delay = 300,
  options: ApiCallOptions<T> = {}
): UseApiCallResult<T, TArgs> & { debouncedExecute: (...args: TArgs) => void } {
  const apiCall = useApiCall(apiFunction, options)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const debouncedExecute = useCallback(
    (...args: TArgs) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        apiCall.execute(...args)
      }, delay)
    },
    [apiCall, delay]
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    ...apiCall,
    debouncedExecute,
  }
}

/**
 * Hook for pagination with API calls
 */
export function usePaginatedFetch<T = unknown, TArgs extends readonly unknown[] = readonly unknown[]>(
  apiFunction: (page: number, ...args: TArgs) => Promise<{ data: T[]; total: number; page: number; limit: number }>,
  options: {
    initialPage?: number
    limit?: number
    immediate?: boolean
  } & ApiCallOptions = {}
) {
  const { initialPage = 1, limit = 10, immediate = true } = options
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [allData, setAllData] = useState<T[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const apiCall = useApiCall(
    async (page: number, ...args: TArgs) => {
      const result = await apiFunction(page, ...args)
      return result
    },
    options
  )

  const loadPage = useCallback(
    async (page: number, ...args: TArgs) => {
      const result = await apiCall.execute(page, ...args)
      if (result) {
        setTotalItems(result.total)
        setHasMore(result.data.length === limit && (page * limit) < result.total)

        if (page === 1) {
          setAllData(result.data)
        } else {
          setAllData(prev => [...prev, ...result.data])
        }
      }
      return result
    },
    [apiCall, limit]
  )

  const loadMore = useCallback(
    async (...args: TArgs) => {
      if (!hasMore || apiCall.loading) return
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      return loadPage(nextPage, ...args)
    },
    [currentPage, hasMore, apiCall.loading, loadPage]
  )

  const refresh = useCallback(
    async (...args: TArgs) => {
      setCurrentPage(1)
      setAllData([])
      return loadPage(1, ...args)
    },
    [loadPage]
  )

  useEffect(() => {
    if (immediate) {
      refresh()
    }
  }, [immediate, refresh])

  return {
    data: allData,
    loading: apiCall.loading,
    error: apiCall.error,
    currentPage,
    totalItems,
    hasMore,
    loadMore,
    refresh,
    reset: () => {
      setCurrentPage(initialPage)
      setAllData([])
      setTotalItems(0)
      setHasMore(true)
      apiCall.reset()
    }
  }
}
