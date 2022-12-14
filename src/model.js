import view from "./view";
import { Player, AIPlayer } from "./gameObjects/players";
import Gameboard from "./gameObjects/gameBoard";

const player1Board = Gameboard(1);
const player2Board = Gameboard(2);

// get opponent board
const player1 = Player(player2Board, 1);
const player2 = AIPlayer(player1Board, 2);

player2Board.placeRandomShips();

// send boards so that view can render them
view.startBoards(player2Board);

const model = { player1, player2, player1Board, player2Board };

export default model;
