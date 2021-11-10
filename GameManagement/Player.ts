export default class Player {
  username: string;
  sendMessage: (message) => any;
  constructor(username) {
    this.username = username;
  }
}
