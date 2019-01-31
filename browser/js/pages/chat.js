import routes from '../routes.js';
import { removeClass, addClass, text, map, html, hasClass, attr } from '../common.js';
import mSocket, { LOGIN_MESSAGE, CHAT_MESSAGE } from '../socket/socket.js';
import { getStore, changeInlineUsers } from '../store/store.js';

const $page = document.querySelector('.page-chat');
routes.add('/chat', handleEnterChatPage);

function handleEnterChatPage() {
  removeClass($page, 'page--hidden');
  const $chatList = document.querySelector('.page-chat__msgs');
  const $chatInput = document.querySelector('.page-chat__input');
  const $chatSend = document.querySelector('.page-chat__send');
  // listen for message
  mSocket.on('message', function handleReceivedMessage(message) {
    const { fromUser, toUser, content } = message.data;
    const $chatItem = createChatItem(fromUser.name, content);
    $chatList.appendChild($chatItem);
  });

  // bind event
  $chatInput.addEventListener('keydown', function handleChatInputKeydown(e) {
    if (e.keyCode === 13) {
      sendMessage(e.target.value.trim());
    }
  });

  $chatSend.addEventListener('click', function handleChatSendClick(e) {
    sendMessage($chatInput.value.trim());
  });

  function createChatItem(from, content) {
    const $li = document.createElement('li');
    html($li, `<li class="chat-item chat-item--from">
        <p class="chat-item__name">${from}</p>
        <p class="chat-item__content">${content}</p>
      </li>`);
    return $li;
  }

  function sendMessage(content) {
    console.log(getStore());
    mSocket.sendMessage(CHAT_MESSAGE, {
      content,
      touid: getStore().touid
    });
  }
}