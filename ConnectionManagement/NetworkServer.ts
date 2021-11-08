import { WebSocketServer } from "ws";

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
  constructor(port1: Number = 8081) {
    this.wss = new WebSocketServer({
      port: 8081,
      perMessageDeflate,
    });
    this.wss.on("connection", this.onConnection);
    this.wss.on("message", this.onMessage);
    this.wss.on("close", this.onClose);

    //Closes broken connections (30000ms ping)
    this.interval = setInterval(
      function ping() {
        this.wss.clients.forEach(function each(ws) {
          if (ws.isAlive === false) return ws.terminate();

          ws.isAlive = false;
          ws.ping();
        });
      }.bind(this),
      30000
    );
  }
  onMessage(message) {
    console.log("received: %s", message);
  }
  onConnection(ws, req) {
    ws.isAlive = true;
    ws.on("pong", heartbeat);

    const ip =
      (req.headers["x-forwarded-for"] as String)?.split(",")[0].trim() ??
      req.socket.remoteAddress;
    console.log(ip);
  }
  onClose() {
    clearInterval(this.interval);
  }
}
