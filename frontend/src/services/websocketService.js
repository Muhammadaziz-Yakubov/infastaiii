import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000;
    this.listeners = new Map();
    this.isConnected = false;
    this.userId = null; // Store userId for reconnection
  }

  connect(userId) {
    if (this.socket && this.socket.connected) {
      return;
    }

    // Store userId for reconnection
    if (userId) {
      this.userId = userId;
    }

    try {
      // Connect to Socket.IO server - use environment variable or default to backend port
      const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      this.socket = io(socketUrl, {
        query: { userId: this.userId },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log('Socket.IO connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');

        // Join user room
        if (this.userId) {
          this.socket.emit('join_user', this.userId);
        }

        // Join challenge groups
        this.emit('join_challenge_groups');
      });

      this.socket.on('chat_message', (data) => {
        this.emit('chat_message', data);
      });

      this.socket.on('typing', (data) => {
        this.emit('typing', data);
      });

      this.socket.on('user_online', (data) => {
        this.emit('user_online', data);
      });

      this.socket.on('user_offline', (data) => {
        this.emit('user_offline', data);
      });

      this.socket.on('user_joined', (data) => {
        this.emit('user_joined', data);
      });

      this.socket.on('user_left', (data) => {
        this.emit('user_left', data);
      });

      this.socket.on('message_deleted', (data) => {
        this.emit('message_deleted', data);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
        this.isConnected = false;
        this.emit('disconnected');
        this.attemptReconnect();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        this.emit('error', error);
        this.attemptReconnect();
      });

    } catch (error) {
      console.error('Socket.IO connection error:', error);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect(this.userId); // Use stored userId
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect_failed');
    }
  }

  send(type, payload) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(type, payload);
    } else {
      console.warn('Socket.IO is not connected');
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }

  // Chat specific methods
  sendMessage(groupId, message) {
    if (typeof message === 'string') {
      // If message is a string, convert to object
      this.send('chat_message', {
        groupId,
        text: message,
        timestamp: new Date().toISOString()
      });
    } else {
      // If message is already an object, send as is
      this.send('chat_message', {
        groupId,
        ...message,
        timestamp: message.timestamp || new Date().toISOString()
      });
    }
  }

  joinGroup(groupId) {
    this.send('join_group', { groupId });
  }

  leaveGroup(groupId) {
    this.send('leave_group', { groupId });
  }

  sendTyping(groupId, isTyping) {
    this.send('typing', {
      groupId,
      isTyping,
      userId: localStorage.getItem('userId')
    });
  }

  deleteMessage(groupId, messageId) {
    this.send('delete_message', { groupId, messageId });
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
