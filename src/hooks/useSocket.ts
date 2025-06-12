"use client";

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { io, type Socket } from 'socket.io-client'

interface ChatMessage {
  id: string
  content: string
  type: 'text' | 'image' | 'file'
  timestamp: Date
  sender: {
    id: string
    name: string
    role: string
    image?: string
  }
  chatId: string
}

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  sendMessage: (chatId: string, content: string, type?: string) => void
  joinChat: (chatId: string) => void
  leaveChat: (chatId: string) => void
  startTyping: (chatId: string) => void
  stopTyping: (chatId: string) => void
  messages: ChatMessage[]
  typingUsers: string[]
}

export function useSocket(): UseSocketReturn {
  const { data: session, status } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const socketInstance = io(process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_SOCKET_URL || ''
        : 'http://localhost:3000', {
        path: '/api/socket',
        transports: ['websocket', 'polling'],
        autoConnect: true
      })

      socketInstance.on('connect', () => {
        console.log('Connected to socket server')
        setIsConnected(true)
        // Authenticate with session token
        socketInstance.emit('authenticate', session.user.id)
      })

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from socket server')
        setIsConnected(false)
      })

      socketInstance.on('authenticated', (data) => {
        console.log('Authenticated:', data)
      })

      socketInstance.on('auth_error', (error) => {
        console.error('Authentication error:', error)
      })

      socketInstance.on('new_message', (message: ChatMessage) => {
        setMessages(prev => [...prev, message])
      })

      socketInstance.on('user_typing', ({ userId, chatId }) => {
        setTypingUsers(prev => {
          if (!prev.includes(userId)) {
            return [...prev, userId]
          }
          return prev
        })
      })

      socketInstance.on('user_stopped_typing', ({ userId, chatId }) => {
        setTypingUsers(prev => prev.filter(id => id !== userId))
      })

      socketInstance.on('joined_chat', (chatId) => {
        console.log('Joined chat:', chatId)
      })

      socketInstance.on('error', (error) => {
        console.error('Socket error:', error)
      })

      setSocket(socketInstance)

      return () => {
        socketInstance.disconnect()
      }
    }
  }, [session, status])

  const sendMessage = (chatId: string, content: string, type = 'text') => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        chatId,
        content,
        type
      })
    }
  }

  const joinChat = (chatId: string) => {
    if (socket && isConnected) {
      socket.emit('join_chat', chatId)
    }
  }

  const leaveChat = (chatId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_chat', chatId)
    }
  }

  const startTyping = (chatId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_start', chatId)

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Auto-stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(chatId)
      }, 3000)
    }
  }

  const stopTyping = (chatId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', chatId)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = null
      }
    }
  }

  return {
    socket,
    isConnected,
    sendMessage,
    joinChat,
    leaveChat,
    startTyping,
    stopTyping,
    messages,
    typingUsers
  }
}
