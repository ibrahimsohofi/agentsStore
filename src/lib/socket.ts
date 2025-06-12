import { Server } from 'socket.io'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ServerWithSocket, SocketServer } from '@/types/socket'
import type { Server as HTTPServer } from 'node:http'

let io: Server | null = null

export function initializeSocket(httpServer: HTTPServer): Server {
  if (io) return io

  io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.NEXTAUTH_URL
        : ['http://localhost:3000', 'https://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id)

    // Authentication middleware
    socket.on('authenticate', async (token) => {
      try {
        // Verify user session
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
          socket.emit('auth_error', 'Authentication failed')
          socket.disconnect()
          return
        }

        socket.data.userId = session.user.id
        socket.data.userRole = session.user.role
        socket.emit('authenticated', { userId: session.user.id })

        // Join user-specific room
        socket.join(`user:${session.user.id}`)

        // Join admin room if admin
        if (session.user.role === 'ADMIN') {
          socket.join('admin')
        }
      } catch (error) {
        console.error('Auth error:', error)
        socket.emit('auth_error', 'Authentication failed')
      }
    })

    // Join chat room
    socket.on('join_chat', async (chatId) => {
      try {
        if (!socket.data.userId) {
          socket.emit('error', 'Not authenticated')
          return
        }

        // Verify user has access to this chat
        const chat = await prisma.chatSession.findFirst({
          where: {
            id: chatId,
            OR: [
              { userId: socket.data.userId },
              { assignedAgentId: socket.data.userId }
            ]
          }
        })

        if (!chat && socket.data.userRole !== 'ADMIN') {
          socket.emit('error', 'Access denied to chat')
          return
        }

        socket.join(`chat:${chatId}`)
        socket.emit('joined_chat', chatId)
      } catch (error) {
        console.error('Join chat error:', error)
        socket.emit('error', 'Failed to join chat')
      }
    })

    // Send message
    socket.on('send_message', async (data) => {
      try {
        if (!socket.data.userId) {
          socket.emit('error', 'Not authenticated')
          return
        }

        const { chatId, content, type = 'text' } = data

        // Save message to database
        const message = await prisma.chatMessage.create({
          data: {
            chatSessionId: chatId,
            senderId: socket.data.userId,
            content,
            type,
            timestamp: new Date()
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                role: true,
                image: true
              }
            }
          }
        })

        // Update chat session last activity
        await prisma.chatSession.update({
          where: { id: chatId },
          data: {
            lastActivity: new Date(),
            lastMessageId: message.id
          }
        })

        // Broadcast message to chat room
        io?.to(`chat:${chatId}`).emit('new_message', {
          id: message.id,
          content: message.content,
          type: message.type,
          timestamp: message.timestamp,
          sender: message.sender,
          chatId
        })

        // Send notification to offline users
        const chatSession = await prisma.chatSession.findUnique({
          where: { id: chatId },
          include: {
            user: true,
            assignedAgent: true
          }
        })

        if (chatSession) {
          const recipientId = socket.data.userId === chatSession.userId
            ? chatSession.assignedAgentId
            : chatSession.userId

          if (recipientId) {
            // Check if recipient is online
            const recipientSockets = await io?.in(`user:${recipientId}`).fetchSockets()
            if (!recipientSockets || recipientSockets.length === 0) {
              // Create notification for offline user
              await prisma.notification.create({
                data: {
                  userId: recipientId,
                  type: 'CHAT_MESSAGE',
                  title: 'New Chat Message',
                  message: `${message.sender.name}: ${content.substring(0, 100)}`,
                  data: JSON.stringify({ chatId, messageId: message.id })
                }
              })
            }
          }
        }
      } catch (error) {
        console.error('Send message error:', error)
        socket.emit('error', 'Failed to send message')
      }
    })

    // Typing indicator
    socket.on('typing_start', (chatId) => {
      socket.to(`chat:${chatId}`).emit('user_typing', {
        userId: socket.data.userId,
        chatId
      })
    })

    socket.on('typing_stop', (chatId) => {
      socket.to(`chat:${chatId}`).emit('user_stopped_typing', {
        userId: socket.data.userId,
        chatId
      })
    })

    // Agent status updates
    socket.on('agent_status_update', (status) => {
      if (socket.data.userRole === 'ADMIN' || socket.data.userRole === 'SELLER') {
        socket.to('admin').emit('agent_status_changed', {
          agentId: socket.data.userId,
          status,
          timestamp: new Date()
        })
      }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  return io
}

export function getSocketInstance() {
  return io
}
