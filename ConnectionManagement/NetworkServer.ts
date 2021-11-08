import WebSocket, { WebSocketServer } from "ws";

function heartbeat() {
  this.isAlive = true;
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
  wss: WebSocketServer;
  interval: NodeJS.Timer;
  knownUsers = { "::ffff:127.0.0.1": ["Legonzaur"] };
  messageId = 0;
  constructor(port: number = 8081) {
    this.wss = new WebSocketServer({
      port,
      perMessageDeflate,
    });
    this.wss.on("connection", this.onConnection.bind(this));
    this.wss.on("message", this.onMessage.bind(this));
    this.wss.on("close", this.onClose.bind(this));

    //Closes broken connections (30000ms ping)
    this.interval = setInterval(() => {
      this.wss.clients.forEach((ws: any) => {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        this.sendMessage(ws, "ping");
      });
    }, 30000);
  }
  onMessage(message) {
    console.log("received: %s", message);
  }
  onConnection(ws, req) {
    ws.isAlive = true;
    ws.on("pong", heartbeat);
    this.sendMessage(ws, "ping");

    const ip =
      (req.headers["x-forwarded-for"] as String)?.split(",")[0].trim() ??
      req.socket.remoteAddress;
    this.sendMessage(ws, "getKnownUsersSharingIp", this.knownUsers[ip]);
  }
  onClose() {
    clearInterval(this.interval);
  }
  sendMessage(ws: WebSocket, order: String, data: any = null) {
    ws.send(JSON.stringify({ order, data, id: this.messageId++ }));
  }
}
