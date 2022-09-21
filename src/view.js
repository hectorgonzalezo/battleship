import PubSub from "pubsub-js";
import { Gameboard } from "./gameObjects";

const player1DivBoard = document.querySelector("#player1-board");
const player2DivBoard = document.querySelector("#player2-board");

const player1Board = Gameboard();
const player2Board = Gameboard();

function renderNewBoard(parentDiv, board) {
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
      newRow.setAttribute("data", j);
      newRow.append(newSquare);
    });
  });

  return player1Board;
}

function startBoards() {
  renderNewBoard(player1DivBoard, player1Board);
  renderNewBoard(player2DivBoard, player2Board);
}

PubSub.subscribe("window-loaded", startBoards);
export { renderNewBoard };
