const users = require('./users.json');

class InlineModel {
  constructor() {
    this.inlineUser = {};
  }

  add(uid, socketID) {
    // 用户存在且未登录
    if (users[uid] && !this.inlineUser[uid]) {
      let user = Object.assign({}, users[uid]);
      user.socketID = socketID;
      this.inlineUser[uid] = user;
    }
  }

  remove(uid) {
    if (this.inlineUser[uid]) {
      delete this.inlineUser[uid];
    }
  }

  removeBySocketID(id) {
    for(let key in this.inlineUser) {
      if (this.inlineUser[key].socketID === id) {
        this.remove(key);
        break;
      }
    }
  }

  list() {
    return this.inlineUser;
  }
}

module.exports = InlineModel;