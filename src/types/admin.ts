export interface AdminActionRequest {
  action: string
  targetType: string
  targetId: string
  reason?: string
  details?: Record<string, unknown>
}

export interface AdminActionResult {
  success: boolean
  message: string
  data?: Record<string, unknown>
}

export interface AdminDashboardMetrics {
  totalUsers: number
  totalAgents: number
  totalOrders: number
  totalRevenue: number
  activeUsers: number
  pendingAgents: number
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: string
  description: string
  timestamp: Date
  userId?: string
  targetId?: string
}

export interface NotificationData {
  orderId?: string
  agentId?: string
  agentName?: string
  amount?: number
  [key: string]: unknown
}
