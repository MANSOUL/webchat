/**
 * p1 

createOffer() => description

// client
socket.emit('message', {
  type: 'offer',
  to: 'xxx',
  decription
})

// server
socket.on('message', (message) => {
  const {type, to, description} = message.description;
  // find specific socket
  // send description
  if(type === 'offer') {
    socket.emit('message', {
      type: 'offer',
      desciption
    });
  }
});

p2

// client
socket.on('message', (message) => {
  const type = message.type;
  if(type === 'offer') {
    peerConnection.setRemoteDescription(message.desciption);
    // createAnwser() => desciption
  }
});
 */
const socket = io();
const databaseUsers = {
  "user-0001": {
    "name": "kuangguanghu"
  },
  "user-0002": {
    "name": "liuzhihui"
  },
  "user-0003": {
    "name": "wangyudan"
  }
};
let currentUser = null;
let chatUID = null;

const $loginPanel = document.querySelector('.login-panel');
const $loginInput = document.querySelector('#login-input');
const $userList = document.querySelector('.user-list');
const $chatList = document.querySelector('.chat-list');
const $sendMessageInput = document.querySelector('#send-message');


$loginInput.addEventListener('keydown', function handleLoginInputKeydown(e) {
  if (e.keyCode === 13) {
    for (let uid in databaseUsers) {
      let currentUser = databaseUsers[uid];
      if (currentUser.name === e.target.value.trim()) {
        socket.emit('uid', {
          uid
        });
        break;
      }
    }
    $loginPanel.style.display = 'none';
  }
});

$sendMessageInput.addEventListener('keydown', function handleSendMessageKeyDown(e) {
  if (e.keyCode === 13) {
    socket.emit('message', {
      from: currentUser.name,
      content: e.target.value.trim(),
      to: chatUID
    })
  }
});

socket.on('log', function handleUserLogin(message) {
  const users = message.users;
  let html = '';
  for (let uid in users) {
    html += `<li data-uid="${uid}">${users[uid].name}</li>`
    let $li = document.createElement('li');
  }
  $userList.innerHTML = html;
});

socket.on('message', function handleReceivedMessage(message) {
  const { from, content } = message;
  let $li = document.createElement('li');
  $li.textContent = `from:${from}, ${content}`;
  $chatList.appendChild($li);
});



