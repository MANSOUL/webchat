import routes from '../routes.js';
import { removeClass, addClass, text } from '../common.js';
import mSocket, { LOGIN_MESSAGE } from '../socket/socket.js';
import { changeLoginer } from "../store/store.js";

const $pageLogin = document.querySelector('.page-login');
routes.add('/', handleEnterLoginPage);

function handleEnterLoginPage() {
  removeClass($pageLogin, 'page--hidden');
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
  const $loginInput = document.querySelector('.page-login__input');
  const $loginTip = document.querySelector('.page-login__tip');
  $loginInput.value = navigator.userAgent.toLowerCase().match('android') ? 'kuangguanghu' : 'wangyudan'

  $loginInput.addEventListener('keydown', function handleLoginInputKeydown(e) {
    if (e.keyCode === 13) {
      login(e);
    }
  });

  function login(e) {
    for (let uid in databaseUsers) {
      let currentUser = databaseUsers[uid];
      if (currentUser.name === e.target.value.trim()) {
        mSocket.init();
        mSocket.sendMessage(LOGIN_MESSAGE, {
          uid
        });
        changeLoginer(uid, currentUser.name);
        routes.goto('/users');
        return;
      }
    }
    text(addClass($loginTip, 'page-login__tip--show'), '用户不存在');
  }
}