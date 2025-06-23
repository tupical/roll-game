// Реализация Socket клиента
import { ISocketClient } from '../interfaces/api.interfaces';
import { io, Socket } from 'socket.io-client';

type EventHandler<T = any> = (data: T) => void;

export class SocketClient implements ISocketClient {
  private socket: Socket | null = null;
  private url: string;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private isConnecting: boolean = false;
  private connectionPromise: Promise<void> | null = null;
  private connectionResolve: (() => void) | null = null;
  private connectionReject: ((error: Error) => void) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  async connect(): Promise<void> {
    // If already connected, return immediately
    if (this.socket?.connected) {
      return;
    }
    
    // If connection is in progress, return the existing promise
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    console.log('Connecting to socket server at:', this.url);
    this.isConnecting = true;
    
    // Create a new promise that will resolve when the socket connects
    this.connectionPromise = new Promise<void>((resolve, reject) => {
      this.connectionResolve = resolve;
      this.connectionReject = reject;

      try {
        // Initialize socket connection
        this.socket = io(this.url, {
          transports: ['websocket', 'polling'],
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        // Set up connection event handlers
        const onConnect = () => {
          console.log('Socket connected successfully');
          cleanup();
          this.connectionResolve?.();
        };

        const onConnectError = (error: Error) => {
          console.error('Socket connection error:', error);
          cleanup();
          this.connectionReject?.(error);
        };

        const onDisconnect = (reason: string) => {
          console.log('Socket disconnected:', reason);
          if (reason === 'io server disconnect') {
            // Attempt to reconnect if server disconnects us
            this.socket?.connect();
          }
        };

        // Clean up event listeners
        const cleanup = () => {
          if (this.socket) {
            this.socket.off('connect', onConnect);
            this.socket.off('connect_error', onConnectError);
            this.socket.off('disconnect', onDisconnect);
          }
          this.isConnecting = false;
          this.connectionResolve = null;
          this.connectionReject = null;
        };

        // Set up one-time connection handlers
        this.socket.once('connect', onConnect);
        this.socket.once('connect_error', onConnectError);
        this.socket.on('disconnect', onDisconnect);

        // Register all existing event handlers
        this.reregisterHandlers();
      } catch (error) {
        this.cleanupConnection();
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });

    return this.connectionPromise;
  }

  private cleanupConnection(): void {
    this.connectionPromise = null;
    this.connectionResolve = null;
    this.connectionReject = null;
    this.isConnecting = false;
  }

  private reregisterHandlers(): void {
    if (!this.socket) return;
    
    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach(handler => {
        this.socket?.on(event, handler);
      });
    });
  }

  async emit(event: string, data: any): Promise<void> {
    // Ensure we're connected before emitting
    if (!this.socket?.connected) {
      await this.connect();
    }
    
    if (!this.socket) {
      throw new Error('Failed to initialize socket connection');
    }
    
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket is not connected'));
        return;
      }
      
      // Add a callback for the server's response
      this.socket.emit(event, data, (response: any) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  on<T = any>(event: string, callback: (data: T) => void): void {
    // Save the handler for reconnection
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    
    this.eventHandlers.get(event)?.add(callback as EventHandler);
    
    // Register the handler if socket is connected
    if (this.socket?.connected) {
      this.socket.on(event, callback);
    } else if (!this.isConnecting) {
      // If not connected and not already connecting, try to connect
      this.connect().catch(console.error);
    }
  }

  off(event: string, callback?: (data: any) => void): void {
    if (!this.socket) return;
    
    if (callback) {
      // Remove specific handler
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(callback);
        if (handlers.size === 0) {
          this.eventHandlers.delete(event);
          this.socket.off(event);
        } else if (this.socket) {
          // Re-register remaining handlers
          this.socket.off(event);
          handlers.forEach(handler => {
            this.socket?.on(event, handler);
          });
        }
      }
    } else {
      // Remove all handlers for the event
      this.eventHandlers.delete(event);
      this.socket.off(event);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.cleanupConnection();
  }
}
