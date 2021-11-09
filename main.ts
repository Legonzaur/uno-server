import NetworkServer from "./ConnectionManagement/NetworkServer";
import Game from "./GameManagement/Game";
const game = new Game();
const network = new NetworkServer(8081, game);
