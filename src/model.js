import view from './view'
import { Player, AIPlayer, Gameboard } from './gameObjects'

const player1Board = Gameboard(1);
const player2Board = Gameboard(2);

// get oponent board
const player1 = Player(player2Board, 1);
const player2 = AIPlayer(player1Board, 2);

player1Board.placeRandomShips(6);
player2Board.placeRandomShips(6);

// send boards so that view can render them
const divBoards = view.startBoards(player1Board, player2Board)



const model = { player1, player2, player1Board, player2Board}

export default model
