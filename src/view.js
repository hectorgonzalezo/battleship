import PubSub from "pubsub-js";
import { Ship, Gameboard } from "./gameObjects";

const player1DivBoard = document.querySelector("#player1-board");
const player2DivBoard = document.querySelector("#player2-board");

const player1Board = Gameboard(player1DivBoard);
const player2Board = Gameboard(player2DivBoard);

function createNewBoardElement(board) {
    const parentDiv = board.getDiv();
  // RenderSquares
  board.getCurrentBoard().forEach((row, i) => {
    // create row
    const newRow = document.createElement("div");
    newRow.classList.add("row");
    newRow.setAttribute("data", i);
    parentDiv.append(newRow);
    row.forEach((square, j) => {
      // create squares
      const newSquare = document.createElement("div");
      newSquare.classList.add("square");
      newSquare.setAttribute("data", j);
      newRow.append(newSquare);
    });
  });
}

function renderShips(board){
    const parentDiv = board.getDiv()

    board.getCurrentBoard().forEach((row, i) => {
        row.forEach((square, j) => {
            // if theres a ship in square, add class to it
            if(square.ship !== undefined){
                // Access corresponding square in DivBoard and change its color
                const shipSquare = parentDiv.children[i].children[j];
                shipSquare.classList.add('ship-square')
            }
        });
      });

}

function renderRandomShips(){
    player1Board.placeRandomShips(5);
    player2Board.placeRandomShips(5);

  renderShips(player1Board);
  renderShips(player2Board);
}

function startBoards() {
  createNewBoardElement(player1Board);
  createNewBoardElement(player2Board);
}

PubSub.subscribe("window-loaded", startBoards);
PubSub.subscribe("window-loaded", renderRandomShips);

const view = { renderRandomShips };

// export default view
