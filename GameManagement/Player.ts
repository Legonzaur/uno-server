import Game from "./Game";

export default class Player {
  username: string;
  game: Game;
  cards = [];
  sendMessage: (message) => any;
  constructor(username, game) {
    this.username = username;
    this.game = game;
  }
  startGame() {
    if (this.game.gameStatus == 0) {
      this.game.startGame();
      return true;
    }
    return false;
  }
  playCard(card) {
    if (
      this.game.currentPlayers[this.game.currentTurn].username == this.username
    ) {
      if (this.cards.find((c) => c.id == card.id)) {
        let hasCardMoved = this.game.moveCard(
          { name: this.username, cards: this.cards },
          this.game.decks.pioche,
          card,
          this
        );
        if (hasCardMoved) {
          this.game.nextTurn();
          return true;
        }
      }
    }
    return false;
  }
}
