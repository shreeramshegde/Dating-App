import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'http://3.25.130.67:8080/ws';

class WebSocketService {
  private client: Client | null = null;
  private isConnected: boolean = false;
  private messageListeners: Map<string, (msg: any) => void> = new Map();
  private matchNotificationListeners: Array<(notif: any) => void> = [];

  connect(token: string | null) {
    // Only connect if a valid, non-mock JWT token is present
    if (!token || !token.trim() || token.startsWith('mock_')) {
      console.log('[WebSocket] Skipping STOMP connection: missing or mock JWT token');
      return;
    }

    if (this.client && this.isConnected) return;

    // If client exists but is not connected, deactivate first
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {
        // ignore
      }
      this.client = null;
      this.isConnected = false;
    }

    try {
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

      this.client = new Client({
        webSocketFactory: () => {
          try {
            return new SockJS(WS_BASE_URL);
          } catch (err) {
            console.warn('[WebSocket] SockJS creation error:', err);
            return null as any;
          }
        },
        connectHeaders: { Authorization: authHeader },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = () => {
        this.isConnected = true;
        console.log('[WebSocket] Connected to STOMP broker');

        // Subscribe to personal notification queue (e.g. instant match popup)
        this.client?.subscribe('/user/queue/notifications', (frame) => {
          try {
            const notification = JSON.parse(frame.body);
            this.matchNotificationListeners.forEach((listener) => listener(notification));
          } catch (e) {
            console.error('[WebSocket] Notification parse error:', e);
          }
        });
      };

      this.client.onDisconnect = () => {
        this.isConnected = false;
        console.log('[WebSocket] Disconnected');
      };

      this.client.onStompError = (frame) => {
        const errorMsg = frame.headers['message'] || '';
        console.warn('[WebSocket] STOMP broker error:', errorMsg);

        // If rejected due to missing or invalid JWT, halt reconnect loop
        if (errorMsg.toLowerCase().includes('unauthorized') || errorMsg.toLowerCase().includes('jwt')) {
          console.warn('[WebSocket] Authentication rejected by broker. Halting STOMP reconnect.');
          this.disconnect();
        }
      };

      this.client.activate();
    } catch (err) {
      console.warn('[WebSocket] Activation failed:', err);
    }
  }

  disconnect() {
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (err) {
        console.warn('[WebSocket] Error during disconnect:', err);
      }
      this.client = null;
      this.isConnected = false;
    }
  }

  subscribeToMatch(matchId: string, onMessageReceived: (msg: any) => void) {
    if (!this.client || !this.isConnected) {
      this.messageListeners.set(matchId, onMessageReceived);
      return () => this.messageListeners.delete(matchId);
    }

    const sub = this.client.subscribe(`/topic/match.${matchId}`, (frame) => {
      try {
        const msg = JSON.parse(frame.body);
        onMessageReceived(msg);
      } catch (e) {
        console.error('[WebSocket] Message parse error:', e);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }

  onMatchNotification(listener: (notif: any) => void) {
    this.matchNotificationListeners.push(listener);
    return () => {
      this.matchNotificationListeners = this.matchNotificationListeners.filter((l) => l !== listener);
    };
  }

  sendChatMessage(matchId: string, content: string) {
    if (!this.client || !this.isConnected) {
      console.warn('[WebSocket] Not connected, fallback to REST API');
      return false;
    }

    this.client.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify({ matchId, content }),
    });
    return true;
  }
}

export const wsService = new WebSocketService();
