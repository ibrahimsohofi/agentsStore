import type { Server as NetServer } from 'node:http'
import { NextApiResponse } from 'next'
import type { Server as ServerIO } from 'socket.io'

declare global {
  var httpServer: NetServer | undefined
}
import { initializeSocket } from '@/lib/socket'

export const dynamic = 'force-dynamic'

let io: ServerIO | null = null

export async function GET(req: Request) {
  if (!io) {
    const httpServer: NetServer | undefined = globalThis.httpServer
    if (!httpServer) {
      return new Response('Server not available', { status: 503 })
    }

    io = initializeSocket(httpServer)
  }

  return new Response('Socket.IO server running', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}

export async function POST(req: Request) {
  return GET(req)
}
