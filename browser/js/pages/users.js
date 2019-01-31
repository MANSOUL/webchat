import routes from '../routes.js';
import { removeClass, addClass, text, map, html, hasClass, attr, parent } from '../common.js';
import mSocket, { LOGIN_MESSAGE } from '../socket/socket.js';
import { getStore, changeInlineUsers, changeToUID } from '../store/store.js';

const $page = document.querySelector('.page-users');
routes.add('/users', handleEnterUsersPage);

function handleEnterUsersPage() {
  removeClass($page, 'page--hidden');
  let initUsers = false;
  const $userList = document.querySelector('.page-users__inline-list');
  const $inlineUserCount = document.querySelector('.page-users__inline-count');

  // listen user log
  mSocket.on('log', function handleUserLogin(message) {
    const users = message.data.users;
    changeInlineUsers(users);
    createInlineUers(users);
  });

  // create inline user list
  function createInlineUers(users) {
    // if (initUsers) {
    //   return;
    // }
    initUsers = true;
    let htmlString = '';
    map(users, function (item) {
      htmlString +=
        `<li data-uid="${item.uid}" data-name="${item.name}" class="page-users__inline-item">
          <span>${item.name}</span>
          <div>
            <button class="inline-item__option inline-item__option-video">video</button>
            <button class="inline-item__option inline-item__option-chat">chat</button>
          </div>
        </li>`;
    });
    text($inlineUserCount, users.length);
    html($userList, htmlString);
  }

  // bind proxy click event
  $userList.addEventListener('click', function handleUserListClick(e) {
    const $target = e.target;
    if (hasClass($target, 'inline-item__option-video')) {
      const $item = parent($target, '.page-users__inline-item');
      startWebRTC(attr($item, 'data-uid'), attr($item, 'data-name'));
      return;
    }
    if (hasClass($target, 'inline-item__option-chat')) {
      const $item = parent($target, '.page-users__inline-item');
      startChat(attr($item, 'data-uid'), attr($item, 'data-name'));
      return;
    }
  });

  // web rtc
  function startWebRTC(uid) {

  }

  // websocket chat
  function startChat(uid, uname) {
    changeToUID(uid, uname);
    routes.goto('/chat');
  }
}