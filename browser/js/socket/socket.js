const mSocket = {
  socket: null,
  init() {
    if (!this.socket) {
      this.socket = io();
    }
  },
  sendMessage(type, data) {
    this.socket.emit('message', {
      type,
      data: data
    });
  },
  on(type, handler) {
    this.socket && this.socket.on(type, handler);
  }
}

export const CHAT_MESSAGE = 'CHAT_MESSAGE';
export const LOGIN_MESSAGE = 'LOGIN_MESSAGE';
export default mSocket;


