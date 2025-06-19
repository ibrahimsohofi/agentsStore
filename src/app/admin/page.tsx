"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Users,
  Bot,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Check,
  X,
  Search,
  Filter,
  MoreVertical,
  Shield,
  TrendingUp,
  Star,
  Clock,
  Eye
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Agent {
  id: string;
  title: string;
  seller?: { name: string };
}

interface AdminDashboardData {
  totalUsers: number;
  totalAgents: number;
  totalOrders: number;
  totalRevenue: number;
  pendingAgents: Agent[];
  recentUsers: User[];
  recentOrders: unknown[];
  flaggedContent: unknown[];
  platformMetrics: {
    dailyActiveUsers: number;
    conversionRate: number;
    avgOrderValue: number;
    customerSatisfaction: number;
  };
}

interface AdminAction {
  action: string;
  targetType: string;
  targetId: string;
  reason: string;
  details?: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionDialog, setActionDialog] = useState<{ open: boolean; type: string; target: Agent | User | null }>({
    open: false,
    type: "",
    target: null
  });
  const [actionReason, setActionReason] = useState("");

  // Redirect if not admin
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`/api/admin/dashboard?range=${timeRange}`);
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "ADMIN") {
      fetchDashboardData();
    }
  }, [session, timeRange]);

  const handleAdminAction = async (action: AdminAction) => {
    try {
      const response = await fetch("/api/admin/actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(action),
      });

      if (response.ok) {
        // Refresh dashboard data
        const dashboardResponse = await fetch(`/api/admin/dashboard?range=${timeRange}`);
        if (dashboardResponse.ok) {
          const data = await dashboardResponse.json();
          setDashboardData(data);
        }
        setActionDialog({ open: false, type: "", target: null });
        setActionReason("");
      }
    } catch (error) {
      console.error("Failed to execute admin action:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-2">Platform management and oversight</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Shield className="h-3 w-3 mr-1" />
                Admin Access
              </Badge>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active: {dashboardData?.platformMetrics?.dailyActiveUsers || 0} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalAgents || 0}</div>
              <p className="text-xs text-muted-foreground">
                Pending: {dashboardData?.pendingAgents?.length || 0} review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${((dashboardData?.totalRevenue || 0) / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg: ${((dashboardData?.platformMetrics?.avgOrderValue || 0) / 100).toFixed(2)} per order
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                {((dashboardData?.platformMetrics?.conversionRate || 0) * 100).toFixed(1)}% conversion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="agents">Agent Moderation</TabsTrigger>
            <TabsTrigger value="orders">Order Management</TabsTrigger>
            <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Latest user registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.recentUsers?.map((user: User) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{user.role}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Agent Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    Pending Agent Reviews
                    {(dashboardData?.pendingAgents?.length || 0) > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {dashboardData?.pendingAgents?.length}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Agents awaiting approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.pendingAgents?.map((agent: Agent) => (
                      <div key={agent.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <Clock className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium">{agent.title}</p>
                            <p className="text-sm text-muted-foreground">by {agent.seller?.name}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActionDialog({
                              open: true,
                              type: "APPROVE_AGENT",
                              target: agent
                            })}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActionDialog({
                              open: true,
                              type: "REJECT_AGENT",
                              target: agent
                            })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(!dashboardData?.pendingAgents || dashboardData.pendingAgents.length === 0) && (
                      <p className="text-center text-muted-foreground py-4">No pending agent reviews</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
                <div className="border rounded-lg">
                  <div className="p-4 border-b bg-muted">
                    <div className="grid grid-cols-5 gap-4 font-medium text-sm">
                      <span>User</span>
                      <span>Role</span>
                      <span>Status</span>
                      <span>Joined</span>
                      <span>Actions</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-center text-muted-foreground">User management interface coming soon...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Moderation</CardTitle>
                <CardDescription>Review and moderate AI agents on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <div className="p-4 border-b bg-muted">
                    <div className="grid grid-cols-6 gap-4 font-medium text-sm">
                      <span>Agent</span>
                      <span>Seller</span>
                      <span>Category</span>
                      <span>Status</span>
                      <span>Rating</span>
                      <span>Actions</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-center text-muted-foreground">Agent moderation interface coming soon...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>Monitor and manage platform transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <div className="p-4 border-b bg-muted">
                    <div className="grid grid-cols-6 gap-4 font-medium text-sm">
                      <span>Order ID</span>
                      <span>Customer</span>
                      <span>Agent</span>
                      <span>Amount</span>
                      <span>Status</span>
                      <span>Actions</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-center text-muted-foreground">Order management interface coming soon...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Conversion Rate</span>
                        <span className="font-medium">
                          {((dashboardData?.platformMetrics?.conversionRate || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(dashboardData?.platformMetrics?.conversionRate || 0) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Customer Satisfaction</span>
                        <span className="font-medium">
                          {(dashboardData?.platformMetrics?.customerSatisfaction || 0).toFixed(1)}/5.0
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${((dashboardData?.platformMetrics?.customerSatisfaction || 0) / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    ${((dashboardData?.totalRevenue || 0) / 100).toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Average order: ${((dashboardData?.platformMetrics?.avgOrderValue || 0) / 100).toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{dashboardData?.totalUsers || 0}</div>
                  <p className="text-sm text-muted-foreground">
                    Active today: {dashboardData?.platformMetrics?.dailyActiveUsers || 0}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Dialog */}
        <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionDialog.type === "APPROVE_AGENT" && "Approve Agent"}
                {actionDialog.type === "REJECT_AGENT" && "Reject Agent"}
                {actionDialog.type === "SUSPEND_USER" && "Suspend User"}
                {actionDialog.type === "ACTIVATE_USER" && "Activate User"}
              </DialogTitle>
              <DialogDescription>
                {actionDialog.target && (
                  <span>
                    Action will be applied to: <strong>{'title' in actionDialog.target ? actionDialog.target.title : actionDialog.target.name}</strong>
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Provide a reason for this action..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setActionDialog({ open: false, type: "", target: null })}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAdminAction({
                  action: actionDialog.type,
                  targetType: actionDialog.type.includes("AGENT") ? "agent" : "user",
                  targetId: actionDialog.target?.id,
                  reason: actionReason
                })}
                disabled={!actionReason.trim()}
              >
                Confirm Action
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
