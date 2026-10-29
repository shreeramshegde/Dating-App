import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'http://3.25.130.67:8080/ws';

class WebSocketService {
  private client: Client | null = null;
  private isConnected: boolean = false;
  private messageListeners: Map<string, (msg: any) => void> = new Map();
  private matchNotificationListeners: Array<(notif: any) => void> = [];

  connect(token: string | null) {
    if (this.client && this.isConnected) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_BASE_URL),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
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
      console.warn('[WebSocket] STOMP broker error:', frame.headers['message']);
    };

    try {
      this.client.activate();
    } catch (err) {
      console.warn('[WebSocket] Activation failed (backend may be offline):', err);
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

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.isConnected = false;
    }
  }
}

export const wsService = new WebSocketService();
