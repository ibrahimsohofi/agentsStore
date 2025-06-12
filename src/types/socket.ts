import type { Server as HTTPServer } from 'node:http'
import type { Server as SocketIOServer } from 'socket.io'

export interface SocketServer extends SocketIOServer {
  // Add any custom socket server properties here
}

export interface ServerWithSocket extends HTTPServer {
  io?: SocketServer
}

export interface ChatMessage {
  id: string
  userId: string
  message: string
  timestamp: Date
  type: 'user' | 'support'
}

export interface SupportTicket {
  id: string
  userId: string
  subject: string
  status: 'open' | 'pending' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}
