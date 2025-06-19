"use client"

declare global {
  interface Window {
    cartStore?: {
      clearCart: () => void
    }
  }
}

import { useSession } from "next-auth/react"
import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navigation from "@/components/Navigation"
import {
  Package,
  Download,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Bot,
  ExternalLink,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Receipt,
  MessageSquare,
  Star,
  SortDesc,
  ArrowUpDown
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Order {
  id: string
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED"
  paymentStatus: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELLED" | "REFUNDED"
  totalAmount: number
  createdAt: string
  downloadCount: number
  maxDownloads: number
  expiresAt?: string
  agent: {
    id: string
    name: string
    image: string
    seller: string
    sellerId: string
  }
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const searchParams = useSearchParams()

  const fetchOrders = useCallback(async () => {
    if (!session?.user) return

    setIsLoading(true)
    try {
      const url = new URL('/api/orders', window.location.origin)
      if (statusFilter !== 'all') {
        url.searchParams.set('status', statusFilter)
      }

      const response = await fetch(url.toString())
      if (!response.ok) throw new Error('Failed to fetch orders')

      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }, [session?.user, statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    // Check for successful checkout
    const success = searchParams.get('success')
    if (success === 'true') {
      toast.success('Order completed successfully!')
      // Clear the cart and show success message
      if (typeof window !== 'undefined') {
        const cartStore = window.cartStore
        if (cartStore?.clearCart) {
          cartStore.clearCart()
        }
      }
    }
  }, [searchParams])

  const handleDownload = async (orderId: string, agentId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/download`)
      if (!response.ok) throw new Error('Download failed')

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `agent-${agentId}.zip`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      // Refresh orders to update download count
      fetchOrders()
      toast.success('Download started!')
    } catch (error) {
      toast.error('Failed to download agent')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      COMPLETED: "default",
      PENDING: "secondary",
      CANCELLED: "destructive",
      REFUNDED: "outline"
    } as const

    const colors = {
      COMPLETED: "text-green-600",
      PENDING: "text-yellow-600",
      CANCELLED: "text-red-600",
      REFUNDED: "text-gray-600"
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        <div className={`w-2 h-2 rounded-full mr-2 ${
          status === 'COMPLETED' ? 'bg-green-500' :
          status === 'PENDING' ? 'bg-yellow-500' :
          status === 'CANCELLED' ? 'bg-red-500' : 'bg-gray-500'
        }`} />
        {status}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      SUCCEEDED: "text-green-600",
      PENDING: "text-yellow-600",
      FAILED: "text-red-600",
      CANCELLED: "text-gray-600",
      REFUNDED: "text-orange-600"
    } as const

    return (
      <span className={`text-xs ${colors[status as keyof typeof colors] || 'text-gray-600'}`}>
        {status}
      </span>
    )
  }

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = order.agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           order.agent.seller.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'amount-high':
          return b.totalAmount - a.totalAmount
        case 'amount-low':
          return a.totalAmount - b.totalAmount
        case 'name':
          return a.agent.name.localeCompare(b.agent.name)
        default:
          return 0
      }
    })

  // Group orders by status for tabs
  const ordersByStatus = {
    all: filteredOrders,
    completed: filteredOrders.filter(o => o.status === 'COMPLETED'),
    pending: filteredOrders.filter(o => o.status === 'PENDING'),
    cancelled: filteredOrders.filter(o => o.status === 'CANCELLED' || o.status === 'REFUNDED')
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h1>
            <p className="text-gray-600 mb-6">
              Please sign in to view your orders
            </p>
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600">
            Track and manage your AI agent purchases
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by agent name or seller..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount-high">Highest Amount</SelectItem>
                  <SelectItem value="amount-low">Lowest Amount</SelectItem>
                  <SelectItem value="name">Agent Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{ordersByStatus.completed.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{ordersByStatus.pending.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All ({ordersByStatus.all.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({ordersByStatus.completed.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({ordersByStatus.pending.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({ordersByStatus.cancelled.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Try adjusting your search or filters'
                      : "You haven't made any purchases yet"}
                  </p>
                  <Link href="/marketplace">
                    <Button>Browse AI Agents</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Order Info */}
                        <div className="flex items-start space-x-4 flex-1">
                          <img
                            src={order.agent.image}
                            alt={order.agent.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900 truncate">
                                  {order.agent.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  by {order.agent.seller}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">
                                  ${order.totalAmount.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Order #{order.id.slice(-8)}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <Download className="h-4 w-4 mr-1" />
                                {order.downloadCount}/{order.maxDownloads} downloads
                              </div>
                              {order.expiresAt && (
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Expires {new Date(order.expiresAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                          <div className="space-y-2">
                            {getStatusBadge(order.status)}
                            <div className="text-xs text-gray-500">
                              Payment: {getPaymentStatusBadge(order.paymentStatus)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {order.status === 'COMPLETED' && order.downloadCount < order.maxDownloads && (
                              <Button
                                onClick={() => handleDownload(order.id, order.agent.id)}
                                size="sm"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            )}

                            <Link href={`/agent/${order.agent.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View Agent
                              </Button>
                            </Link>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Receipt className="h-4 w-4 mr-2" />
                                  Download Receipt
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Contact Seller
                                </DropdownMenuItem>
                                {order.status === 'COMPLETED' && (
                                  <DropdownMenuItem>
                                    <Star className="h-4 w-4 mr-2" />
                                    Write Review
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Order Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
