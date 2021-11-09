import Player from "./Player";

export enum GameStatus {
  Waiting,
  Ongoing,
  Finished,
}

export default class Game {
  currentPlayers: Player[] = [];
  gameStatus: GameStatus = 0;
  constructor() {}
  getLoggedUsers(ws: any) {
    console.log(this.currentPlayers);
    console.log(this);
    return this.currentPlayers.map((e) => e.username);
  }
  getGameStatus(ws: any) {
    return this.gameStatus;
  }
  login(ws: any, username: string) {
    if (
      this.currentPlayers.map((e) => e.username).indexOf(username) > -1 ||
      username.length < 1
    ) {
      return false;
    }
    let newPlayer = new Player(username);
    this.currentPlayers.push(newPlayer);
    ws.player = newPlayer;
    return true;
  }
}
