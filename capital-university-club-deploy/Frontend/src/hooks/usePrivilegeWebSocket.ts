import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface UsePrivilegeWebSocketOptions {
  staffId?: number;
  memberId?: number;
  userId?: string;
  onPrivilegeUpdate?: (privileges: string[]) => void;
  enabled?: boolean;
}

let socket: Socket | null = null;
let connectionCount = 0;

/**
 * Hook to establish WebSocket connection and listen for privilege updates
 * Automatically authenticates with the provided user identifier
 * Handles reconnection and cleanup on unmount
 */
export function usePrivilegeWebSocket({
  staffId,
  memberId,
  userId,
  onPrivilegeUpdate,
  enabled = true,
}: UsePrivilegeWebSocketOptions) {
  // Setup connection (only once)
  useEffect(() => {
    if (!enabled) return;

    // Only connect if we have an identifier
    if (!staffId && !memberId && !userId) {
      console.warn('[WebSocket] No user identifier provided for WebSocket connection');
      return;
    }

    // Create socket connection (reuse existing if available)
    if (!socket) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Extract hostname from current location and connect to backend on port 3000
      const hostname = window.location.hostname;
      const socketUrl = `${protocol}//${hostname}:3000`;

      console.log('[WebSocket] Connecting to:', socketUrl);

      socket = io(socketUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
      });

      // Handle connection
      socket.on('connect', () => {
        console.log('[WebSocket] Connected, sending authentication...');
        socket!.emit('authenticate', { staffId, memberId, userId });
      });

      // Handle authentication response
      socket.on('authenticated', () => {
        console.log('[WebSocket] Successfully authenticated');
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error('[WebSocket] Connection error:', error);
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log('[WebSocket] Disconnected:', reason);
      });
    } else {
      // Socket already exists, just re-authenticate
      console.log('[WebSocket] Reusing existing connection, re-authenticating...');
      socket.emit('authenticate', { staffId, memberId, userId });
    }

    connectionCount++;

    return () => {
      connectionCount--;
      // Only disconnect when all components using the hook are unmounted
      if (connectionCount === 0 && socket) {
        console.log('[WebSocket] Closing connection as no components are listening');
        socket.disconnect();
        socket = null;
      }
    };
  }, [staffId, memberId, userId, enabled]);

  // Setup privilege update listener (updates when callback changes)
  useEffect(() => {
    if (!socket || !enabled) return;

    const handlePrivilegeUpdateEvent = (data: { privileges: string[]; timestamp: string }) => {
      console.log('[WebSocket] Received privilege update event:', data);
      if (onPrivilegeUpdate) {
        onPrivilegeUpdate(data.privileges);
      }
    };

    // Remove old listener if it exists
    socket.off('privilege_update');
    // Add new listener with updated callback
    socket.on('privilege_update', handlePrivilegeUpdateEvent);

    console.log('[WebSocket] Privilege update listener registered');

    return () => {
      socket?.off('privilege_update', handlePrivilegeUpdateEvent);
    };
  }, [onPrivilegeUpdate, enabled]);

  return socket;
}

/**
 * Get the current socket instance (for manual operations if needed)
 */
export function getSocketInstance(): Socket | null {
  return socket;
}

/**
 * Manually disconnect the WebSocket
 */
export function disconnectWebSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    connectionCount = 0;
  }
}
