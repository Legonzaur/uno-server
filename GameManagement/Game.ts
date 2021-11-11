import Player from "./Player";

import { shuffle } from "../methods";

import { createDeck } from "./deck";

export enum GameStatus {
  Waiting,
  Ongoing,
  Finished,
}

export interface Card {
  color: string;
  number: string;
  id: number;
}

export interface Deck {
  name: string;
  cards: Card[];
}

export default class Game {
  currentPlayers: Player[] = [];
  gameStatus: GameStatus = 0;
  defaultCardNumber = 7;
  decks = {
    poubelle: <Deck>{ name: "poubelle", cards: [] },
    pioche: <Deck>{ name: "pioche", cards: [] },
  };
  order = 1;
  currentTurn = 0;
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
  updateGameStatus() {
    this.notifyAllPlayers({
      order: "updateGameStatus",
      data: this.gameStatus,
    });
  }
  login(username: string) {
    if (
      this.currentPlayers.map((e) => e.username).indexOf(username) > -1 ||
      username.length < 1 ||
      this.gameStatus > 0
    ) {
      return null;
    }
    let newPlayer = new Player(username, this);
    this.currentPlayers.push(newPlayer);
    this.updateLoggedUsers();
    return newPlayer;
  }
  startGame() {
    this.gameStatus = 1;
    this.decks.pioche.cards = createDeck();
    this.decks.pioche.cards = shuffle(this.decks.pioche.cards);
    this.updateGameStatus();
    //Distribute cards to every player
    this.currentPlayers.forEach((player) => {
      for (let i = 0; i < this.defaultCardNumber; i++) {
        this.moveCard(
          this.decks.pioche,
          { name: player.username, cards: player.cards },
          this.decks.pioche.cards[0],
          player
        );
      }
    });
  }
  moveCard(from: Deck, to: Deck, card, player: Player) {
    let cardExists = !!from.cards.find((card) => card.id == card.id);
    if (!cardExists) {
      return false;
    }
    let cardIndex = from.cards.map((c) => c.id).indexOf(card.id);
    from.cards.splice(cardIndex, 1);
    to.cards.push(card);
    this.currentPlayers.forEach((p: Player) => {
      let dataToSend = <any>{ from: from.name, to: to.name };
      if (p.username == player.username) {
        dataToSend = { ...dataToSend, card: card };
      }
      p.sendMessage({
        order: "eventCardTransfer",
        data: dataToSend,
      });
    });
    return true;
  }
  nextTurn() {
    this.currentTurn =
      (this.currentTurn + this.order) % this.currentPlayers.length;
    if (this.currentTurn < 0) {
      this.currentTurn = this.currentPlayers.length - 1;
    }
  }
}
