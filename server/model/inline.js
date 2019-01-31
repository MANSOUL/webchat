const users = require('../data/users.json');

class InlineModel {
  constructor() {
    this.inlineUser = [];
  }

  exist(uid) {
    for (let i = 0; i < this.inlineUser.length; i++) {
      if (this.inlineUser[i].uid === uid) {
        return true;
      }
    }
    return false;
  }

  add(uid, socketID) {
    // 用户存在且未登录
    if (users[uid] && !this.exist(uid)) {
      let user = Object.assign({}, users[uid]);
      user.uid = uid;
      user.socketID = socketID;
      this.inlineUser.push(user);
    }
  }

  remove(uid) {
    for (let i = 0; i < this.inlineUser.length; i++) {
      if (this.inlineUser[i].uid === uid) {
        this.inlineUser.splice(i, 1);
        break;
      }
    }
  }

  removeBySocketID(id) {
    for (let i = 0; i < this.inlineUser.length; i++) {
      if (this.inlineUser[i].socketID === id) {
        this.inlineUser.splice(i, 1);
        break;
      }
    }
  }

  list() {
    return this.inlineUser;
  }

  listExceptSocketID(id) {
    const users = [...this.inlineUser];
    for (let i = 0; i < users.length; i++) {
      if (users[i].socketID === id) {
        users.splice(i, 1);
      }
    }
    return users;
  }

  getUserByUID(id) {
    for (let i = 0; i < this.inlineUser.length; i++) {
      if (this.inlineUser[i].uid === id) {
        return this.inlineUser[i];
      }
    }
  }

  getUserBySocketID(id) {
    for (let i = 0; i < this.inlineUser.length; i++) {
      if (this.inlineUser[i].socketID === id) {
        return this.inlineUser[i];
      }
    }
  }
}

module.exports = InlineModel;