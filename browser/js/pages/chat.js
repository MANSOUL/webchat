import routes from '../routes.js';
import { removeClass, addClass, text, map, html, hasClass, attr } from '../common.js';
import mSocket, { LOGIN_MESSAGE, CHAT_MESSAGE } from '../socket/socket.js';
import { getStore, changeInlineUsers } from '../store/store.js';

const $page = document.querySelector('.page-chat');
routes.add('/chat', handleEnterChatPage);

function handleEnterChatPage() {
  const chater = getStore().toUser;
  const loginer = getStore().loginer;
  if (!chater) {
    window.history.back();
    return;
  }
  removeClass($page, 'page--hidden');
  let chatHistory = [];
  const $chatList = document.querySelector('.page-chat__msgs');
  const $chatInput = document.querySelector('.page-chat__input');
  const $chatSend = document.querySelector('.page-chat__send');
  const $chatHeader = document.querySelector('.page-chat__header');
  text($chatHeader, chater.uname);

  function newMessage(from, content, type) {
    // chat history
    chatHistory.push({
      from, content, type
    });
    // 
    const $chatItem = createChatItem(from, content, type);
    $chatList.appendChild($chatItem);
  }

  function createChatItem(from, content, type) {
    // create element
    const $li = document.createElement('li');
    $li.className = `chat-item chat-item--${type}`;
    html($li, `
    <p class="chat-item__name">${from}</p>
    <p class="chat-item__content">${content}</p>`);
    return $li;
  }

  function sendMessage(content) {
    newMessage(loginer.uname, content, 'to');
    // clear
    $chatInput.value = '';
    // socket send message
    mSocket.sendMessage(CHAT_MESSAGE, {
      content,
      touid: chater.uid
    });
  }

  function handleReceivedMessage(message) {
    const { fromUser, content } = message.data;
    newMessage(fromUser.name, content, 'from');
  }

  function handleChatSendClick() {
    sendMessage($chatInput.value.trim());
  }

  // listen for message
  mSocket.on('message', handleReceivedMessage);
  // bind event
  $chatSend.addEventListener('click', handleChatSendClick);
  // routes listen
  routes.willChange(function handleRoutesChange() {
    mSocket.off('message', handleReceivedMessage);
    $chatSend.removeEventListener('click', handleChatSendClick);
  });
}