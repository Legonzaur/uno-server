import WebSocket, { WebSocketServer } from "ws";
import Game from "../GameManagement/Game";

function heartbeat() {
  this.isAlive = true;
}

interface GameMessage {
  order: string;
  data: any;
  id: number;
}

const perMessageDeflate = {
  zlibDeflateOptions: {
    // See zlib defaults.
    chunkSize: 1024,
    memLevel: 7,
    level: 3,
  },
  zlibInflateOptions: {
    chunkSize: 10 * 1024,
  },
  // Other options settable:
  clientNoContextTakeover: true, // Defaults to negotiated value.
  serverNoContextTakeover: true, // Defaults to negotiated value.
  serverMaxWindowBits: 10, // Defaults to negotiated value.
  // Below options specified as default values.
  concurrencyLimit: 10, // Limits zlib concurrency for perf.
  threshold: 1024, // Size (in bytes) below which messages
  // should not be compressed if context takeover is disabled.
};

export default class NetworkServer {
  _game: Game;
  wss: WebSocketServer;
  interval: NodeJS.Timer;
  constructor(port: number = 8081, game: Game) {
    this._game = game;
    this._game.notifyAllPlayers = this.broadcast.bind(this);
    this.wss = new WebSocketServer({
      port,
      perMessageDeflate,
    });
    this.wss.on("connection", this.onConnection.bind(this));
    this.wss.on("close", this.onClose.bind(this));

    //Closes broken connections (30000ms ping)
    this.interval = setInterval(() => {
      this.wss.clients.forEach((ws: any) => {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.send("ping");
      });
    }, 30000);
  }

  onConnection(ws, req) {
    ws.isAlive = true;
    // ws.on("pong", heartbeat);
    ws.send("ping");
    const ip =
      (req.headers["x-forwarded-for"] as String)?.split(",")[0].trim() ??
      req.socket.remoteAddress;
    //this.sendMessage(ws, "getKnownUsersSharingIp", this.knownUsers[ip]);
    ws.on("message", (message: any) => {
      if (message == "pong") {
        heartbeat.bind(ws)();
        return;
      }
      const parsedMessage = JSON.parse(message.toString());
      if (parsedMessage.order) {
        if (parsedMessage.order == "login") {
          let player = this._game.login(parsedMessage.data);
          if (player) {
            player.sendMessage = ws.send;
            ws.player = player;
            ws.send(JSON.stringify({ ...parsedMessage, data: true }));
          } else {
            ws.send(JSON.stringify({ ...parsedMessage, data: false }));
          }
          return;
        }
        if (
          parsedMessage.order == "getLoggedUsers" ||
          parsedMessage.order == "getGameStatus"
        ) {
          let answer = this._game[parsedMessage.order](parsedMessage.data);
          ws.send(JSON.stringify({ ...parsedMessage, data: answer }));
        }
      }
      console.log(parsedMessage);
    });
    ws.on("close", () => {
      this._game.removePlayer(ws.player);
      delete ws.player;
      this._game.notifyAllPlayers({
        order: "updateLoggedUsers",
        data: this._game.getLoggedUsers(),
      });
    });
  }
  onClose() {
    clearInterval(this.interval);
  }
  broadcast(message: any) {
    this.wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}
