const store = {
  inlineUsers: [],
  toUser: null,
  loginer: null
};

export function changeInlineUsers(users) {
  store.inlineUsers = users;
}

export function changeToUID(uid, uname) {
  store.toUser = {
    uid,
    uname
  };
}

export function changeLoginer(uid, uname) {
  store.loginer = {
    uid,
    uname
  };
}

export function getStore() {
  return store;
}