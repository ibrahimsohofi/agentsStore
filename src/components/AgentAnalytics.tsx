"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Users,
  Star,
  DollarSign,
  Eye,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Zap,
  ShoppingCart,
  Award,
  Activity,
  Calendar,
  RefreshCw
} from "lucide-react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AgentInsights {
  overview: {
    totalSales: number;
    totalRevenue: number;
    recentSales: number;
    recentRevenue: number;
    averageRating: number;
    totalReviews: number;
    conversionRate: number;
    customerSatisfaction: number;
    performanceScore: number;
  };
  trends: {
    sales: Array<{ date: string; value: number }>;
    rating: Array<{ date: string; value: number }>;
    revenue: Array<{ date: string; value: number }>;
  };
  marketPosition: {
    rank: number;
    category: string;
    competitorsAhead: number;
    marketShare: number;
    categoryLeader: boolean;
  };
  competitiveAnalysis: {
    averagePrice: number;
    pricePosition: string;
    strengthsVsCompetitors: string[];
    improvementAreas: string[];
  };
  customerInsights: {
    topCustomerSegments: Array<{ segment: string; percentage: number; revenue: number }>;
    averageOrderValue: number;
    repeatCustomerRate: number;
    churnRate: number;
  };
  recommendations: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    expectedImpact: string;
    timeToImplement: string;
  }>;
}

interface AgentAnalyticsProps {
  agentId: string;
  agentName: string;
}

const timeRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' }
];

export default function AgentAnalytics({ agentId, agentName }: AgentAnalyticsProps) {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const [insights, setInsights] = useState<AgentInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/agents/${agentId}/insights?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user, agentId, timeRange]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Improvement';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (current < previous) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading analytics...</span>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No analytics data</h3>
        <p className="text-gray-600">Analytics will be available after your first sales</p>
      </div>
    );
  }

  // Chart configurations
  const getChartColors = () => {
    if (typeof window !== 'undefined') {
      const style = getComputedStyle(document.documentElement);
      return {
        primary: `hsl(${style.getPropertyValue('--chart-1')})`,
        success: `hsl(${style.getPropertyValue('--chart-2')})`,
        warning: `hsl(${style.getPropertyValue('--chart-3')})`,
        danger: `hsl(${style.getPropertyValue('--chart-4')})`,
        purple: `hsl(${style.getPropertyValue('--chart-5')})`,
        primaryAlpha: `hsla(${style.getPropertyValue('--chart-1')}, 0.1)`,
        successAlpha: `hsla(${style.getPropertyValue('--chart-2')}, 0.1)`,
        segmentColors: [
          `hsla(${style.getPropertyValue('--chart-1')}, 0.8)`,
          `hsla(${style.getPropertyValue('--chart-2')}, 0.8)`,
          `hsla(${style.getPropertyValue('--chart-3')}, 0.8)`,
          `hsla(${style.getPropertyValue('--chart-4')}, 0.8)`,
          `hsla(${style.getPropertyValue('--chart-5')}, 0.8)`,
        ]
      };
    }
    // Fallback colors for SSR
    return {
      primary: 'hsl(12, 76%, 61%)',
      success: 'hsl(173, 58%, 39%)',
      warning: 'hsl(197, 37%, 24%)',
      danger: 'hsl(43, 74%, 66%)',
      purple: 'hsl(27, 87%, 67%)',
      primaryAlpha: 'hsla(12, 76%, 61%, 0.1)',
      successAlpha: 'hsla(173, 58%, 39%, 0.1)',
      segmentColors: [
        'hsla(12, 76%, 61%, 0.8)',
        'hsla(173, 58%, 39%, 0.8)',
        'hsla(197, 37%, 24%, 0.8)',
        'hsla(43, 74%, 66%, 0.8)',
        'hsla(27, 87%, 67%, 0.8)',
      ]
    };
  };

  const colors = getChartColors();

  const salesTrendData = {
    labels: insights.trends.sales.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Sales',
        data: insights.trends.sales.map(item => item.value),
        borderColor: colors.primary,
        backgroundColor: colors.primaryAlpha,
        tension: 0.1,
      },
    ],
  };

  const revenueTrendData = {
    labels: insights.trends.revenue.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Revenue ($)',
        data: insights.trends.revenue.map(item => item.value),
        borderColor: colors.success,
        backgroundColor: colors.successAlpha,
        tension: 0.1,
      },
    ],
  };

  const customerSegmentData = {
    labels: insights.customerInsights.topCustomerSegments.map(seg => seg.segment),
    datasets: [
      {
        data: insights.customerInsights.topCustomerSegments.map(seg => seg.percentage),
        backgroundColor: colors.segmentColors,
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
          <p className="text-gray-600">Comprehensive insights for {agentName}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchInsights}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {lastUpdated && (
        <div className="text-sm text-gray-500 flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold">{insights.overview.totalSales}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {insights.overview.recentSales} in selected period
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${insights.overview.totalRevenue}</p>
                <p className="text-xs text-gray-500 mt-1">
                  ${insights.overview.recentRevenue} in selected period
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold">{insights.overview.averageRating.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {insights.overview.totalReviews} reviews
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance Score</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(insights.overview.performanceScore)}`}>
                  {insights.overview.performanceScore}/100
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getPerformanceLabel(insights.overview.performanceScore)}
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{(insights.overview.conversionRate * 100).toFixed(1)}%</div>
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <Progress value={insights.overview.conversionRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Customer Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{(insights.overview.customerSatisfaction * 100).toFixed(0)}%</div>
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <Progress value={insights.overview.customerSatisfaction * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Market Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rank in {insights.marketPosition.category}</span>
                <span className="font-bold">#{insights.marketPosition.rank}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Market Share</span>
                <span className="font-bold">{(insights.marketPosition.marketShare * 100).toFixed(1)}%</span>
              </div>
              {insights.marketPosition.categoryLeader && (
                <Badge className="bg-yellow-100 text-yellow-800">Category Leader</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
          <TabsTrigger value="competitive">Competitive Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Sales volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <Line data={salesTrendData} options={chartOptions} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Revenue performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <Line data={revenueTrendData} options={chartOptions} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>Top customer segments by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <Doughnut data={customerSegmentData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Order Value</span>
                  <span className="font-bold">${insights.customerInsights.averageOrderValue}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Repeat Customer Rate</span>
                  <span className="font-bold">{(insights.customerInsights.repeatCustomerRate * 100).toFixed(1)}%</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Churn Rate</span>
                  <span className="font-bold">{(insights.customerInsights.churnRate * 100).toFixed(1)}%</span>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Top Segments</h4>
                  <div className="space-y-2">
                    {insights.customerInsights.topCustomerSegments.map((segment, index) => (
                      <div key={`segment-${segment.segment}-${index}`} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{segment.segment}</span>
                        <div className="text-right">
                          <div className="text-sm font-bold">${segment.revenue}</div>
                          <div className="text-xs text-gray-500">{segment.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competitive" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Competitive Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Category Price</span>
                    <span className="font-bold">${insights.competitiveAnalysis.averagePrice}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Price Position</span>
                    <Badge variant="outline">{insights.competitiveAnalysis.pricePosition}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strengths vs Competitors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.competitiveAnalysis.strengthsVsCompetitors.map((strength, index) => (
                    <div key={`strength-${index}-${strength.slice(0, 20)}`} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.competitiveAnalysis.improvementAreas.map((area, index) => (
                    <div key={`area-${index}-${area.slice(0, 20)}`} className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <div className="space-y-4">
            {insights.recommendations.map((rec, index) => (
              <Card key={`rec-${rec.title}-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Lightbulb className="h-5 w-5 text-yellow-600" />
                        <h3 className="font-semibold text-lg">{rec.title}</h3>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-4">{rec.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Expected Impact: </span>
                          <span>{rec.expectedImpact}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Time to Implement: </span>
                          <span>{rec.timeToImplement}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {rec.type === 'performance' && <Zap className="h-6 w-6 text-blue-600" />}
                      {rec.type === 'marketing' && <TrendingUp className="h-6 w-6 text-green-600" />}
                      {rec.type === 'pricing' && <DollarSign className="h-6 w-6 text-purple-600" />}
                      {rec.type === 'content' && <Activity className="h-6 w-6 text-orange-600" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
