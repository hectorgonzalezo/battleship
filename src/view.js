import PubSub from "pubsub-js";
import confetti from "canvas-confetti";

const player1DivBoard = document.querySelector("#player1-board");
const player2DivBoard = document.querySelector("#player2-board");
const chooseBoard = document.querySelector("#choose-board");
const infoDisplay = document.querySelector("header h1");

function createNewBoardElement(board, enemy = false) {
  const fakeBoard = Array(10)
    .fill()
    .map(() => [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);
  // RenderSquares
  fakeBoard.forEach((row, i) => {
    // create row
    const newRow = document.createElement("div");
    newRow.classList.add("row");
    newRow.setAttribute("data", i);
    board.append(newRow);
    row.forEach((square, j) => {
      // create squares
      const newSquare = document.createElement("div");
      newSquare.classList.add("square");
      if (enemy) {
        newSquare.classList.add("enemy");
      }
      newSquare.setAttribute("data", j);
      newRow.append(newSquare);
    });
  });
}

async function renderShips(board) {
  const currentBoard = board.getCurrentBoard();
  const div = board.getDiv();
  currentBoard.forEach((row, i) => {
    row.forEach((square, j) => {
      // if theres a ship in square, add class to it
      if (square.ship !== undefined) {
        // Access corresponding square in DivBoard and change its color
        const shipSquare = div.children[i].children[j];
        shipSquare.classList.add("ship-square");
      }
    });
  });
}

function removePreviousHit() {
  const previousHit = document.querySelector(".hit.just-hit");
  if (previousHit !== null) {
    previousHit.classList.remove("just-hit");
  }
}

function updateBoardAt(board, rowCoord, columnCoord, updatingHits = false) {
  const div = board.getDiv();
  // Access corresponding square in DivBoard and change its color
  const shipSquare = div.children[rowCoord].children[columnCoord];
  shipSquare.classList.add("hit");
  // remove just-hit from previous div. This allows the page to
  // highligh only the latest hit
  removePreviousHit();
  if (!updatingHits) {
    shipSquare.classList.add("just-hit");
  }
}

function updateDisplay(string) {
  infoDisplay.classList.remove("typing");
  // Magic step!
  void infoDisplay.offsetWidth;

  infoDisplay.innerText = string;
  infoDisplay.classList.add("typing");
}

function updateLoose() {
  infoDisplay.classList.add("loose");
}

function updateWin() {
  infoDisplay.classList.add("win");
  confetti();
}

async function startBoards(player2Board) {
  createNewBoardElement(player1DivBoard);
  // Adds a special class for enemies, so that you can point and shoot.
  createNewBoardElement(player2DivBoard, true);
  createNewBoardElement(chooseBoard);

  await renderShips(player2Board);
  PubSub.publish("enemy-loaded");
}

function renderPlayer1Ships(msg, data) {
  const player1Board = data;
  renderShips(player1Board);
}

PubSub.subscribe("game-started", renderPlayer1Ships);

const view = {
  startBoards,
  renderShips,
  updateBoardAt,
  updateDisplay,
  updateLoose,
  updateWin,
};

export default view;
