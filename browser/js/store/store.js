const store = {
  inlineUsers: [],
  touid: null
};

export function changeInlineUsers(users) {
  store.inlineUsers = users;
}

export function changeToUID(uid) {
  store.touid = uid;
}

export function getStore() {
  return store;
}