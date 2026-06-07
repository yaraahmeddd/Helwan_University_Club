"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketManager = void 0;
const socket_io_1 = require("socket.io");
class SocketManager {
    constructor() {
        this.io = null;
        this.userSockets = new Map(); // userId -> set of socketIds
    }
    /**
     * Initialize Socket.io server with Express app and HTTP server
     */
    initialize(httpServer, allowedOrigins) {
        this.io = new socket_io_1.Server(httpServer, {
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
    setupEventHandlers() {
        if (!this.io)
            return;
        this.io.on('connection', (socket) => {
            console.log(`[WebSocket] Client connected: ${socket.id}`);
            // Handle authentication
            socket.on('authenticate', (data) => {
                const { staffId, memberId, userId } = data;
                // Store user identification
                if (staffId)
                    socket.staffId = staffId;
                if (memberId)
                    socket.memberId = memberId;
                if (userId)
                    socket.userId = userId;
                const userKey = this.getUserKey(socket);
                if (userKey) {
                    if (!this.userSockets.has(userKey)) {
                        this.userSockets.set(userKey, new Set());
                    }
                    this.userSockets.get(userKey).add(socket.id);
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
    getUserKey(socket) {
        if (socket.staffId)
            return `staff_${socket.staffId}`;
        if (socket.memberId)
            return `member_${socket.memberId}`;
        if (socket.userId)
            return `user_${socket.userId}`;
        return null;
    }
    /**
     * Emit privilege update to a specific user
     */
    emitPrivilegeUpdate(userType, userId, privileges) {
        if (!this.io)
            return;
        const userKey = `${userType}_${userId}`;
        const socketIds = this.userSockets.get(userKey);
        if (socketIds && socketIds.size > 0) {
            console.log(`[WebSocket] Sending privilege update to ${userKey} (${socketIds.size} connections)`);
            socketIds.forEach((socketId) => {
                this.io.to(socketId).emit('privilege_update', {
                    privileges,
                    timestamp: new Date().toISOString(),
                });
            });
        }
        else {
            console.log(`[WebSocket] User ${userKey} not connected, skipping privilege update`);
        }
    }
    /**
     * Broadcast privilege update to all connected users
     */
    broadcastPrivilegeUpdate(userType, userId, privileges) {
        this.emitPrivilegeUpdate(userType, userId, privileges);
    }
    /**
     * Get Socket.io instance
     */
    getIO() {
        return this.io;
    }
    /**
     * Get number of connected users
     */
    getConnectedUsersCount() {
        return this.userSockets.size;
    }
    /**
     * Get list of connected user keys for debugging
     */
    getConnectedUsers() {
        return Array.from(this.userSockets.keys());
    }
}
// Export singleton instance
exports.socketManager = new SocketManager();
//# sourceMappingURL=SocketManager.js.map