"use client"

import { useEffect, useRef } from 'react'
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
  Filler
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
  options?: any
}

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: (context: any) => {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          if (context.parsed.y !== null) {
            if (context.dataset.label?.includes('Revenue') || context.dataset.label?.includes('$')) {
              label += '$' + context.parsed.y.toLocaleString()
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
        color: '#6b7280'
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(107, 114, 128, 0.1)'
      },
      ticks: {
        color: '#6b7280',
        callback: (value: any) => {
          if (typeof value === 'number') {
            return value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value
          }
          return value
        }
      }
    }
  }
}

const lineOptions = {
  ...defaultOptions,
  elements: {
    point: {
      radius: 4,
      hoverRadius: 6,
      backgroundColor: '#3b82f6',
      borderColor: '#ffffff',
      borderWidth: 2
    },
    line: {
      tension: 0.4
    }
  }
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        generateLabels: (chart: any) => {
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
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      callbacks: {
        label: (context: any) => {
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

export default function AdvancedChart({
  type,
  data,
  title,
  height = 300,
  options: customOptions
}: AdvancedChartProps) {
  const chartRef = useRef<any>(null)

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [])

  const getOptions = () => {
    const baseOptions = type === 'doughnut' ? doughnutOptions :
                      type === 'line' ? lineOptions : defaultOptions
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {title}
        </h3>
      )}
      {chartComponent()}
    </div>
  )
}
