"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bot,
  Plus,
  TrendingUp,
  DollarSign,
  Users,
  Star,
  Eye,
  Download,
  Edit,
  Trash2,
  BarChart3,
  Calendar,
  Upload,
  FileText,
  Settings,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import AgentUploadForm from "@/components/AgentUploadForm";

// Mock seller data
const sellerStats = {
  totalSales: 1250,
  totalRevenue: 34750,
  totalAgents: 12,
  averageRating: 4.8,
  monthlyGrowth: 23.5,
  lastMonth: {
    sales: 180,
    revenue: 4920
  }
};

const mockAgents = [
  {
    id: 1,
    name: "Advanced Customer Support AI",
    status: "published",
    price: 29,
    sales: 124,
    revenue: 3596,
    rating: 4.9,
    reviews: 124,
    views: 2340,
    lastUpdated: "2024-12-15"
  },
  {
    id: 2,
    name: "Sales Analytics Dashboard Bot",
    status: "published",
    price: 49,
    sales: 89,
    revenue: 4361,
    rating: 4.8,
    reviews: 89,
    views: 1890,
    lastUpdated: "2024-12-10"
  },
  {
    id: 3,
    name: "Content Creator Pro",
    status: "draft",
    price: 19,
    sales: 0,
    revenue: 0,
    rating: 0,
    reviews: 0,
    views: 45,
    lastUpdated: "2024-12-12"
  }
];

export default function SellPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
          <p className="text-xl text-gray-600">Manage your AI agents and track performance</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="agents">My Agents</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${sellerStats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +${sellerStats.lastMonth.revenue} from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sellerStats.totalSales}</div>
                  <p className="text-xs text-muted-foreground">
                    +{sellerStats.lastMonth.sales} from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sellerStats.totalAgents}</div>
                  <p className="text-xs text-muted-foreground">
                    2 published this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sellerStats.averageRating}</div>
                  <p className="text-xs text-muted-foreground">
                    +{sellerStats.monthlyGrowth}% growth
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>Your latest agent purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { agent: "Customer Support AI", buyer: "TechCorp", price: 29, date: "2 hours ago" },
                      { agent: "Sales Analytics Bot", buyer: "StartupXYZ", price: 49, date: "5 hours ago" },
                      { agent: "Customer Support AI", buyer: "E-Commerce Plus", price: 29, date: "1 day ago" },
                      { agent: "Sales Analytics Bot", buyer: "DataDriven Inc", price: 49, date: "2 days ago" }
                    ].map((sale, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{sale.agent}</p>
                          <p className="text-sm text-gray-500">Purchased by {sale.buyer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${sale.price}</p>
                          <p className="text-sm text-gray-500">{sale.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Agent
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Workflow File
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">My Agents</h2>
              <AgentUploadForm />
            </div>

            <div className="space-y-4">
              {mockAgents.map((agent) => (
                <Card key={agent.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <Bot className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{agent.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <Badge
                              variant={agent.status === 'published' ? 'default' : 'secondary'}
                              className={agent.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {agent.status}
                            </Badge>
                            <span>Updated {agent.lastUpdated}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-center">
                        <div>
                          <p className="text-2xl font-bold">${agent.price}</p>
                          <p className="text-sm text-gray-500">Price</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{agent.sales}</p>
                          <p className="text-sm text-gray-500">Sales</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">${agent.revenue}</p>
                          <p className="text-sm text-gray-500">Revenue</p>
                        </div>
                        <div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{agent.rating || 'N/A'}</span>
                          </div>
                          <p className="text-sm text-gray-500">({agent.reviews} reviews)</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Your earnings over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>Revenue chart would go here</p>
                      <p className="text-sm">(Chart component integration needed)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Agents</CardTitle>
                  <CardDescription>Your best-selling agents this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAgents.filter(a => a.status === 'published').map((agent, index) => (
                      <div key={agent.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-sm text-gray-500">{agent.sales} sales</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${agent.revenue}</p>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-sm">{agent.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Detailed breakdown of your agent performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">2,340</div>
                      <p className="text-gray-600">Total Views</p>
                      <p className="text-sm text-green-600">+12% this month</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">5.3%</div>
                      <p className="text-gray-600">Conversion Rate</p>
                      <p className="text-sm text-green-600">+0.8% this month</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">$278</div>
                      <p className="text-gray-600">Avg. Monthly Revenue</p>
                      <p className="text-sm text-green-600">+23% this month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-8">
            <div className="max-w-2xl space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your seller profile and verification status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-xl">AP</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold flex items-center">
                        AutomationPro
                        <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                      </h3>
                      <p className="text-gray-500">Verified Seller</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Update Photo
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Display Name</label>
                      <Input defaultValue="AutomationPro" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <Input defaultValue="contact@automationpro.com" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Bio</label>
                    <textarea
                      className="w-full p-3 border rounded-lg"
                      rows={3}
                      defaultValue="Expert in AI automation and n8n workflows. Helping businesses streamline operations with intelligent agents."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>Manage how you receive payments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">Payment method verified</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      PayPal account: ****@automationpro.com
                    </p>
                  </div>

                  <Button variant="outline">Update Payment Method</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Sales</p>
                        <p className="text-sm text-gray-500">Get notified when someone purchases your agent</p>
                      </div>
                      <Button variant="outline" size="sm">Enabled</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Reviews</p>
                        <p className="text-sm text-gray-500">Get notified when someone reviews your agent</p>
                      </div>
                      <Button variant="outline" size="sm">Enabled</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Reports</p>
                        <p className="text-sm text-gray-500">Receive weekly performance summaries</p>
                      </div>
                      <Button variant="outline" size="sm">Enabled</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
