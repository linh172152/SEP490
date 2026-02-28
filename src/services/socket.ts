import { io, Socket } from 'socket.io-client';

// Use a mock URL for this generated project. In production it would be an environment variable
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Function[]> = new Map();

    connect() {
        if (!this.socket) {
            // For mock purposes we can disable autoConnect if desired, but we'll connect normally
            this.socket = io(SOCKET_URL, {
                autoConnect: false, // We'll manually connect
                reconnection: true,
            });

            this.socket.on('connect', () => {
                console.log('socket connected:', this.socket?.id);
            });

            this.socket.on('disconnect', () => {
                console.log('socket disconnected');
            });

            // Wildcard listener setup
            this.socket.onAny((event, ...args) => {
                const eventListeners = this.listeners.get(event);
                if (eventListeners) {
                    eventListeners.forEach((fn) => fn(...args));
                }
            });
        }

        // Auto-connecting for realistic behavior testing even if no real backend
        // this.socket.connect(); 
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);
    }

    off(event: string, callback: Function) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            this.listeners.set(
                event,
                eventListeners.filter((cb) => cb !== callback)
            );
        }
    }

    emit(event: string, data: any) {
        if (this.socket) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket not connected. Cannot emit:', event);
        }
    }
}

export const socketService = new SocketService();
