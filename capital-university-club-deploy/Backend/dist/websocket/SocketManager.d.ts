import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
declare class SocketManager {
    private io;
    private userSockets;
    /**
     * Initialize Socket.io server with Express app and HTTP server
     */
    initialize(httpServer: HTTPServer, allowedOrigins: string[]): SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
    /**
     * Setup event handlers for Socket.io
     */
    private setupEventHandlers;
    /**
     * Get unique user key from socket
     */
    private getUserKey;
    /**
     * Emit privilege update to a specific user
     */
    emitPrivilegeUpdate(userType: 'staff' | 'member' | 'user', userId: number | string, privileges: string[]): void;
    /**
     * Broadcast privilege update to all connected users
     */
    broadcastPrivilegeUpdate(userType: 'staff' | 'member', userId: number | string, privileges: string[]): void;
    /**
     * Get Socket.io instance
     */
    getIO(): SocketIOServer | null;
    /**
     * Get number of connected users
     */
    getConnectedUsersCount(): number;
    /**
     * Get list of connected user keys for debugging
     */
    getConnectedUsers(): string[];
}
export declare const socketManager: SocketManager;
export {};
//# sourceMappingURL=SocketManager.d.ts.map