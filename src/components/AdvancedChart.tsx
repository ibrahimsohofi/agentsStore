"use client"

import { useEffect, useRef } from 'react'
import { useTheme } from '@/hooks/use-theme'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string
    borderWidth?: number
    fill?: boolean
    tension?: number
  }[]
}

interface AdvancedChartProps {
  type: 'line' | 'bar' | 'doughnut'
  data: ChartData
  title?: string
  height?: number
  options?: Partial<ChartOptions>
}

const getThemeAwareColors = (isDark: boolean) => ({
  tooltip: {
    backgroundColor: isDark ? 'rgba(23, 23, 23, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    titleColor: isDark ? '#fafafa' : '#171717',
    bodyColor: isDark ? '#fafafa' : '#171717',
    borderColor: isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(228, 228, 231, 0.5)',
  },
  grid: {
    color: isDark ? 'rgba(64, 64, 64, 0.3)' : 'rgba(228, 228, 231, 0.5)'
  },
  ticks: {
    color: isDark ? '#a1a1aa' : '#71717a'
  },
  point: {
    backgroundColor: isDark ? 'hsl(var(--primary))' : 'hsl(var(--primary))',
    borderColor: isDark ? 'hsl(var(--background))' : 'hsl(var(--background))',
  }
})

const defaultOptions = (isDark: boolean) => {
  const themeColors = getThemeAwareColors(isDark)

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: themeColors.ticks.color
        }
      },
      tooltip: {
        backgroundColor: themeColors.tooltip.backgroundColor,
        titleColor: themeColors.tooltip.titleColor,
        bodyColor: themeColors.tooltip.bodyColor,
        borderColor: themeColors.tooltip.borderColor,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context: { dataset: { label?: string }; parsed: { y: number | null } }) => {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              if (context.dataset.label?.includes('Revenue') || context.dataset.label?.includes('$')) {
                label += `${context.parsed.y.toLocaleString()}`
              } else {
                label += context.parsed.y.toLocaleString()
              }
            }
            return label
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: themeColors.ticks.color
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: themeColors.grid.color
        },
        ticks: {
          color: themeColors.ticks.color,
          callback: (value: number | string) => {
            if (typeof value === 'number') {
              return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value
            }
            return value
          }
        }
      }
    }
  }
}

const lineOptions = (isDark: boolean) => {
  const themeColors = getThemeAwareColors(isDark)

  return {
    ...defaultOptions(isDark),
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        backgroundColor: themeColors.point.backgroundColor,
        borderColor: themeColors.point.borderColor,
        borderWidth: 2
      },
      line: {
        tension: 0.4
      }
    }
  }
}

const doughnutOptions = (isDark: boolean) => {
  const themeColors = getThemeAwareColors(isDark)

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: themeColors.ticks.color,
          generateLabels: (chart: { data: { labels: string[]; datasets: Array<{ data: number[]; backgroundColor: string[] }> } }) => {
            const data = chart.data
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i]
                const percentage = ((value / data.datasets[0].data.reduce((a: number, b: number) => a + b, 0)) * 100).toFixed(1)
                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i
                }
              })
            }
            return []
          }
        }
      },
      tooltip: {
        backgroundColor: themeColors.tooltip.backgroundColor,
        titleColor: themeColors.tooltip.titleColor,
        bodyColor: themeColors.tooltip.bodyColor,
        callbacks: {
          label: (context: { label: string; parsed: number; dataset: { data: number[] } }) => {
            const label = context.label || ''
            const value = context.parsed
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value} (${percentage}%)`
          }
        }
      }
    },
    cutout: '60%'
  }
}

export default function AdvancedChart({
  type,
  data,
  title,
  height = 300,
  options: customOptions
}: AdvancedChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const { theme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [])

  const getOptions = () => {
    const baseOptions = type === 'doughnut' ? doughnutOptions(isDark) :
                      type === 'line' ? lineOptions(isDark) : defaultOptions(isDark)
    return { ...baseOptions, ...customOptions }
  }

  const chartComponent = () => {
    switch (type) {
      case 'line':
        return <Line ref={chartRef} data={data} options={getOptions()} />
      case 'bar':
        return <Bar ref={chartRef} data={data} options={getOptions()} />
      case 'doughnut':
        return <Doughnut ref={chartRef} data={data} options={getOptions()} />
      default:
        return null
    }
  }

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      {title && (
        <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
          {title}
        </h3>
      )}
      {chartComponent()}
    </div>
  )
}
