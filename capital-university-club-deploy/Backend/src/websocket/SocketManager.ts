import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import type { Express } from 'express';

interface AuthenticatedSocket extends Socket {
  staffId?: number;
  memberId?: number;
  userId?: string;
}

class SocketManager {
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> set of socketIds

  /**
   * Initialize Socket.io server with Express app and HTTP server
   */
  public initialize(httpServer: HTTPServer, allowedOrigins: string[]) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingInterval: 25000,
      pingTimeout: 60000,
    });

    this.setupEventHandlers();
    console.log('✅ WebSocket server initialized');
    return this.io;
  }

  /**
   * Setup event handlers for Socket.io
   */
  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`[WebSocket] Client connected: ${socket.id}`);

      // Handle authentication
      socket.on('authenticate', (data: { token?: string; staffId?: number; memberId?: number; userId?: string }) => {
        const { staffId, memberId, userId } = data;

        // Store user identification
        if (staffId) socket.staffId = staffId;
        if (memberId) socket.memberId = memberId;
        if (userId) socket.userId = userId;

        const userKey = this.getUserKey(socket);
        if (userKey) {
          if (!this.userSockets.has(userKey)) {
            this.userSockets.set(userKey, new Set());
          }
          this.userSockets.get(userKey)!.add(socket.id);
          console.log(`[WebSocket] User ${userKey} authenticated on socket ${socket.id}`);
        }

        socket.emit('authenticated', { success: true });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        const userKey = this.getUserKey(socket);
        if (userKey) {
          const socketSet = this.userSockets.get(userKey);
          if (socketSet) {
            socketSet.delete(socket.id);
            if (socketSet.size === 0) {
              this.userSockets.delete(userKey);
            }
          }
        }
        console.log(`[WebSocket] Client disconnected: ${socket.id}`);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`[WebSocket] Error on socket ${socket.id}:`, error);
      });
    });
  }

  /**
   * Get unique user key from socket
   */
  private getUserKey(socket: AuthenticatedSocket): string | null {
    if (socket.staffId) return `staff_${socket.staffId}`;
    if (socket.memberId) return `member_${socket.memberId}`;
    if (socket.userId) return `user_${socket.userId}`;
    return null;
  }

  /**
   * Emit privilege update to a specific user
   */
  public emitPrivilegeUpdate(userType: 'staff' | 'member' | 'user', userId: number | string, privileges: string[]) {
    if (!this.io) return;

    const userKey = `${userType}_${userId}`;
    const socketIds = this.userSockets.get(userKey);

    if (socketIds && socketIds.size > 0) {
      console.log(`[WebSocket] Sending privilege update to ${userKey} (${socketIds.size} connections)`);
      socketIds.forEach((socketId) => {
        this.io!.to(socketId).emit('privilege_update', {
          privileges,
          timestamp: new Date().toISOString(),
        });
      });
    } else {
      console.log(`[WebSocket] User ${userKey} not connected, skipping privilege update`);
    }
  }

  /**
   * Broadcast privilege update to all connected users
   */
  public broadcastPrivilegeUpdate(userType: 'staff' | 'member', userId: number | string, privileges: string[]) {
    this.emitPrivilegeUpdate(userType, userId, privileges);
  }

  /**
   * Get Socket.io instance
   */
  public getIO(): SocketIOServer | null {
    return this.io;
  }

  /**
   * Get number of connected users
   */
  public getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get list of connected user keys for debugging
   */
  public getConnectedUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }
}

// Export singleton instance
export const socketManager = new SocketManager();
