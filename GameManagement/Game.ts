import Player from "./Player";

export enum GameStatus {
  Waiting,
  Ongoing,
  Finished,
}

export default class Game {
  currentPlayers: Player[] = [];
  gameStatus: GameStatus = 0;
  notifyAllPlayers: (message: any) => void;
  constructor() {}
  removePlayer(player: Player) {
    this.currentPlayers.splice(this.currentPlayers.indexOf(player), 1);
  }
  getLoggedUsers() {
    return this.currentPlayers.map((e) => e.username);
  }
  getGameStatus() {
    return this.gameStatus;
  }
  updateLoggedUsers() {
    this.notifyAllPlayers({
      order: "updateLoggedUsers",
      data: this.getLoggedUsers(),
    });
  }
  login(username: string) {
    if (
      this.currentPlayers.map((e) => e.username).indexOf(username) > -1 ||
      username.length < 1
    ) {
      return null;
    }
    let newPlayer = new Player(username);
    this.currentPlayers.push(newPlayer);
    this.updateLoggedUsers();
    return newPlayer;
  }
}
