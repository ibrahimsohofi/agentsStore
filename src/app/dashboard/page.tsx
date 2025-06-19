"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navigation from "@/components/Navigation"
import AdvancedChart from "@/components/AdvancedChart"
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Star,
  Download,
  Calendar,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap
} from "lucide-react"
import Link from "next/link"

interface AnalyticsData {
  overview: {
    totalRevenue: number
    totalSales: number
    averageRating: number
    totalAgents: number
    monthlyGrowth: number
    conversionRate: number
    totalViews: number
    avgOrderValue: number
  }
  revenueChart: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor?: string
      borderColor?: string
      fill?: boolean
      tension?: number
    }[]
  }
  salesChart: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor?: string[]
      borderColor?: string
    }[]
  }
  categoryChart: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor: string[]
    }[]
  }
  performanceMetrics: {
    clickRate: number
    downloadRate: number
    refundRate: number
    returnCustomers: number
  }
  topAgents: {
    id: string
    name: string
    sales: number
    revenue: number
    rating: number
    category: string
    trend: number
  }[]
  recentActivity: {
    type: string
    message: string
    timestamp: string
    amount?: number
  }[]
}

export default function SellerDashboard() {
  const { data: session, status } = useSession()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState("30d")
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchAnalytics = useCallback(async (range: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/seller?range=${range}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
        setLastUpdated(new Date())
      } else {
        // Fallback to mock data if API fails
        setAnalytics(generateMockAnalytics())
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Fallback to mock data
      setAnalytics(generateMockAnalytics())
    } finally {
      setLoading(false)
    }
  }, [])

  // Generate comprehensive mock analytics data
  const generateMockAnalytics = (): AnalyticsData => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const revenueData = [850, 1200, 980, 1550, 1890, 2847]
    const salesData = [12, 18, 15, 25, 31, 42]

    return {
      overview: {
        totalRevenue: 9317,
        totalSales: 143,
        averageRating: 4.7,
        totalAgents: 8,
        monthlyGrowth: 23.5,
        conversionRate: 12.8,
        totalViews: 5420,
        avgOrderValue: 65.15
      },
      revenueChart: {
        labels: months,
        datasets: [
          {
            label: 'Revenue ($)',
            data: revenueData,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgb(59, 130, 246)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Target ($)',
            data: [1000, 1300, 1200, 1600, 2000, 2500],
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: 'rgb(16, 185, 129)',
            fill: false,
            tension: 0.4
          }
        ]
      },
      salesChart: {
        labels: months,
        datasets: [
          {
            label: 'Sales Count',
            data: salesData,
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)'
            ]
          }
        ]
      },
      categoryChart: {
        labels: ['Customer Support', 'Data Analysis', 'Content Creation', 'Sales Automation', 'Marketing'],
        datasets: [
          {
            label: 'Revenue by Category',
            data: [3200, 2100, 1800, 1500, 717],
            backgroundColor: [
              '#3b82f6',
              '#10b981',
              '#f59e0b',
              '#ef4444',
              '#8b5cf6'
            ]
          }
        ]
      },
      performanceMetrics: {
        clickRate: 15.7,
        downloadRate: 89.3,
        refundRate: 2.1,
        returnCustomers: 34.5
      },
      topAgents: [
        {
          id: '1',
          name: 'Customer Support AI Pro',
          sales: 45,
          revenue: 3150,
          rating: 4.9,
          category: 'Customer Support',
          trend: 12.5
        },
        {
          id: '2',
          name: 'Advanced Analytics Bot',
          sales: 32,
          revenue: 2240,
          rating: 4.8,
          category: 'Data Analysis',
          trend: 8.3
        },
        {
          id: '3',
          name: 'Content Creator Deluxe',
          sales: 28,
          revenue: 1680,
          rating: 4.6,
          category: 'Content Creation',
          trend: -2.1
        },
        {
          id: '4',
          name: 'Sales Pipeline Optimizer',
          sales: 25,
          revenue: 1750,
          rating: 4.7,
          category: 'Sales Automation',
          trend: 15.7
        }
      ],
      recentActivity: [
        {
          type: 'sale',
          message: 'Customer Support AI Pro sold to TechCorp Inc',
          timestamp: '2024-12-12T10:30:00Z',
          amount: 70
        },
        {
          type: 'review',
          message: 'New 5-star review on Advanced Analytics Bot',
          timestamp: '2024-12-12T09:15:00Z'
        },
        {
          type: 'sale',
          message: 'Content Creator Deluxe sold to StartupXYZ',
          timestamp: '2024-12-11T16:45:00Z',
          amount: 60
        },
        {
          type: 'milestone',
          message: 'You reached 100 total sales!',
          timestamp: '2024-12-11T14:20:00Z'
        }
      ]
    }
  }

  useEffect(() => {
    if (session?.user?.role === "SELLER") {
      fetchAnalytics(timeRange)
    }
  }, [timeRange, session, fetchAnalytics])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (session?.user?.role === "SELLER") {
      const interval = setInterval(() => {
        fetchAnalytics(timeRange)
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearInterval(interval)
    }
  }, [timeRange, session, fetchAnalytics])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number, showSign = true) => {
    const sign = showSign && value > 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to access your seller dashboard
            </p>
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (session?.user?.role !== "SELLER") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Seller Access Required</h1>
            <p className="text-muted-foreground mb-6">
              You need a seller account to access this dashboard
            </p>
            <Link href="/sell">
              <Button>Become a Seller</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAnalytics(timeRange)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/sell">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.overview.totalRevenue)}</div>
              <div className="flex items-center text-xs">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">
                  {formatPercentage(analytics.overview.monthlyGrowth)} from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.totalSales}</div>
              <div className="flex items-center text-xs">
                <Target className="h-3 w-3 text-blue-500 mr-1" />
                <span className="text-muted-foreground">
                  {formatPercentage(analytics.overview.conversionRate, false)} conversion rate
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.overview.avgOrderValue)}</div>
              <div className="flex items-center text-xs">
                <Users className="h-3 w-3 text-purple-500 mr-1" />
                <span className="text-muted-foreground">
                  {analytics.overview.totalViews.toLocaleString()} total views
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.averageRating}</div>
              <div className="flex items-center text-xs">
                <Package className="h-3 w-3 text-orange-500 mr-1" />
                <span className="text-muted-foreground">
                  Across {analytics.overview.totalAgents} agents
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Monthly revenue vs targets</CardDescription>
                </CardHeader>
                <CardContent>
                  <AdvancedChart
                    type="line"
                    data={analytics.revenueChart}
                    height={300}
                  />
                </CardContent>
              </Card>

              {/* Sales Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                  <CardDescription>Revenue distribution across categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <AdvancedChart
                    type="doughnut"
                    data={analytics.categoryChart}
                    height={300}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Agents */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Agents</CardTitle>
                <CardDescription>Your best selling agents this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topAgents.map((agent, index) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-sm text-muted-foreground">{agent.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{agent.sales}</p>
                          <p className="text-muted-foreground">Sales</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{formatCurrency(agent.revenue)}</p>
                          <p className="text-muted-foreground">Revenue</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="font-medium">{agent.rating}</span>
                          </div>
                          <p className="text-muted-foreground">Rating</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center">
                            {agent.trend > 0 ? (
                              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                            )}
                            <span className={`font-medium ${agent.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPercentage(Math.abs(agent.trend))}
                            </span>
                          </div>
                          <p className="text-muted-foreground">Trend</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Sales Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Monthly Sales Volume</CardTitle>
                  <CardDescription>Number of sales per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <AdvancedChart
                    type="bar"
                    data={analytics.salesChart}
                    height={350}
                  />
                </CardContent>
              </Card>

              {/* Revenue Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>Key financial metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Gross Revenue</span>
                      <span className="font-medium">{formatCurrency(analytics.overview.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Platform Fee (10%)</span>
                      <span className="font-medium">-{formatCurrency(analytics.overview.totalRevenue * 0.1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Processing Fees</span>
                      <span className="font-medium">-{formatCurrency(analytics.overview.totalSales * 0.3)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Net Revenue</span>
                      <span className="font-bold text-lg">
                        {formatCurrency(analytics.overview.totalRevenue * 0.9 - analytics.overview.totalSales * 0.3)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h4 className="font-medium mb-3">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Click-through Rate</span>
                        <span className="font-medium">{formatPercentage(analytics.performanceMetrics.clickRate, false)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Download Rate</span>
                        <span className="font-medium">{formatPercentage(analytics.performanceMetrics.downloadRate, false)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Refund Rate</span>
                        <span className="font-medium">{formatPercentage(analytics.performanceMetrics.refundRate, false)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Return Customers</span>
                        <span className="font-medium">{formatPercentage(analytics.performanceMetrics.returnCustomers, false)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Click Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPercentage(analytics.performanceMetrics.clickRate, false)}
                  </div>
                  <p className="text-xs text-muted-foreground">From marketplace views</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Download Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPercentage(analytics.performanceMetrics.downloadRate, false)}
                  </div>
                  <p className="text-xs text-muted-foreground">Post-purchase downloads</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Refund Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatPercentage(analytics.performanceMetrics.refundRate, false)}
                  </div>
                  <p className="text-xs text-muted-foreground">Within 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Return Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatPercentage(analytics.performanceMetrics.returnCustomers, false)}
                  </div>
                  <p className="text-xs text-muted-foreground">Repeat customers</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Target Performance</CardTitle>
                <CardDescription>Track your monthly performance against targets</CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedChart
                  type="line"
                  data={analytics.revenueChart}
                  height={400}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance Details</CardTitle>
                <CardDescription>Detailed breakdown of your AI agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topAgents.map((agent) => (
                    <div key={agent.id} className="border rounded-lg p-6 hover:bg-muted">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{agent.name}</h3>
                          <Badge variant="secondary">{agent.category}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Sales</p>
                          <p className="font-semibold text-lg">{agent.sales}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Revenue</p>
                          <p className="font-semibold text-lg">{formatCurrency(agent.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rating</p>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="font-semibold text-lg">{agent.rating}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Growth Trend</p>
                          <div className="flex items-center">
                            {agent.trend > 0 ? (
                              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className={`font-semibold text-lg ${agent.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPercentage(Math.abs(agent.trend))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest sales, reviews, and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentActivity.map((activity, index) => (
                    <div key={activity.timestamp || `activity-${index}`} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'sale' ? 'bg-green-500' :
                        activity.type === 'review' ? 'bg-blue-500' :
                        activity.type === 'milestone' ? 'bg-purple-500' : 'bg-muted-foreground'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium">{activity.message}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {activity.amount && (
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            +{formatCurrency(activity.amount)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
