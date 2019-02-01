const os = require('os');
const nodeStatic = require('node-static');
const http = require('http');
const socketIO = require('socket.io');
const InlineModel = require('./model/inline.js');
const inlineModel = new InlineModel();

const fileServer = new nodeStatic.Server('./browser', {
  cache: 0
});
const app = http.createServer(function (req, res) {
  fileServer.serve(req, res);
}).listen(8888);

const CHAT_MESSAGE = 'CHAT_MESSAGE';
const LOGIN_MESSAGE = 'LOGIN_MESSAGE';
const CANDIDATE = 'candidate';
const OFFER = 'offer';
const ANSWER = 'answer';
const BYE = 'BYE';
const JOINED = 'joined';
const io = socketIO.listen(app);

io.sockets.on('connection', function (socket) {
  console.log('a user connect.');
  console.log(`id: ${socket.id}`);
  const socketID = socket.id;

  function singleBroardcastLog() {
    for (let key in io.sockets.connected) {
      io.sockets.connected[key].emit('log', {
        data: {
          users: inlineModel.listExceptSocketID(key)
        }
      });
    }
  }

  socket.on('message', function handleReceivedMessage(message) {
    const { type } = message;
    if (type === LOGIN_MESSAGE) {
      const { uid } = message.data;
      inlineModel.add(uid, socketID);
      singleBroardcastLog();
    }
    else if (type === CHAT_MESSAGE) {
      const { content, touid } = message.data;
      console.log(content, touid);
      const toUser = inlineModel.getUserByUID(touid);
      const fromUser = inlineModel.getUserBySocketID(socketID);
      const toSocket = io.sockets.connected[toUser.socketID];
      toSocket.emit('message', {
        data: {
          fromUser,
          toUser,
          content
        }
      });
    }
    else if (type === OFFER || type === ANSWER || type === CANDIDATE || type === BYE || type === JOINED) {
      const { touid, data } = message.data;
      console.log(touid, data)
      const toUser = inlineModel.getUserByUID(touid);
      const fromUser = inlineModel.getUserBySocketID(socketID);
      const toSocket = io.sockets.connected[toUser.socketID];
      toSocket.emit('message', {
        type,
        data
      });
    }
  });

  socket.on('disconnect', function handleSocketDisconnect() {
    console.log('user disconnect.');
    inlineModel.removeBySocketID(socketID);
    // 有用户登出，发出广播
    singleBroardcastLog();
  });
});