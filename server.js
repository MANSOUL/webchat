const os = require('os');
const nodeStatic = require('node-static');
const http = require('http');
const socketIO = require('socket.io');
const InlineModel = require('./inline.js');
const inlineModel = new InlineModel();

var fileServer = new(nodeStatic.Server)();
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res);
}).listen(8888);

var io = socketIO.listen(app);
io.sockets.on('connection', function(socket) {
  console.log('a user connect.');
  console.log(`id: ${socket.id}`);
  const socketID = socket.id;

  socket.on('uid', function handleReceiveUID(message) {
    inlineModel.add(message.uid, socketID);
    // 有用户登录，发出广播
    io.emit('log', {
      users: inlineModel.list()
    });
  });

  socket.on('message', function handleReceivedMessage(message) {
    const {to, content, from} = message;
    const toSocket = io.sockets.connected[to];
    toSocket.emit('message', {
      from,
      content
    });
  });

  socket.on('disconnect', function handleSocketDisconnect() {
    console.log('user disconnect.');
    inlineModel.removeBySocketID(socketID);
    // 有用户登出，发出广播
    io.emit('log', {
      users: inlineModel.list()
    });
  });
});