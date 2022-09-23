import PubSub from "pubsub-js";
import view from "./view";
import model from "./model";
import { Player } from "./gameObjects";

const popupShips = document.querySelectorAll("#ships .ship");
const popupBoard = document.querySelector("#pop-up .board");

// Player 1 turn
function play1(rowCoord, columnCoord) {
  // Attack selected square
  const hit = model.player1.playTurn(rowCoord, columnCoord);
  // Show hit on webpage
  view.updateBoardAt(model.player2Board, rowCoord, columnCoord);
  // Stop turn only after you missed a hit
  if (hit.ship === undefined) {
    if (model.player2Board.areAllShipsSunk()) {
      // If you won
      view.updateDisplay("You won!");
    } else if (model.player1Board.areAllShipsSunk()) {
      // If player 2 won
      view.updateDisplay("Sorry, you lost!");
    } else {
      // If nobody won, continue playing
      play2();
    }
    makeEnemySquaresUnclickable();
  }
}

// Player 2 turn
function play2(minWait = 1000, closeTo = null) {
  // play 2
  view.updateDisplay("Player2 turn");
  setTimeout(() => {
    let coords;
    let hit;
    if (Array.isArray(closeTo)) {
      // If it just scored a hit, play around the same square
      [coords, hit] = model.player2.playAround(closeTo);
    } else {
      // Otherwise, play at random
      [coords, hit] = model.player2.playRandom();
    }
    view.updateBoardAt(model.player1Board, coords[0], coords[1]);
    // Only stop turn after not hitting a target
    if (hit.ship !== undefined) {
      // Recursive call
      play2(minWait * 2, coords);
    } else if (model.player1Board.areAllShipsSunk()) {
      // If player 2 won stop the game
      view.updateDisplay("Sorry, you lost!");
    } else {
      // Otherwise, continue game
      makeEnemySquaresClickable();
    }
  }, Math.random() * 1000 + minWait);
}

function enemySquaresListener(event) {
  const square = event.target;
  const rowCoord = square.parentElement.getAttribute("data");
  const columnCoord = square.getAttribute("data");

  // Player 1 makes a play
  play1(rowCoord, columnCoord);
}

function makeEnemySquaresClickable() {
  const enemySquares = document.querySelectorAll(".square.enemy");
  enemySquares.forEach((square) => {
    square.addEventListener("click", enemySquaresListener);
  });
  view.updateDisplay("Your turn");
}

function makeEnemySquaresUnclickable() {
  const enemySquares = document.querySelectorAll(".square.enemy");
  enemySquares.forEach((square) => {
    square.removeEventListener("click", enemySquaresListener);
  });
}

function updateBoardHits(board) {
  const currentBoard = board.getCurrentBoard();
  currentBoard.forEach((row, i) => {
    row.forEach((square, j) => {
      if (square.hit === true) {
        console.log(board);
        view.updateBoardAt(board, i, j, true);
      }
    });
  });
}

function updateBothBoardsHits() {
  console.log(model.player1Board);
  updateBoardHits(model.player1Board);
  updateBoardHits(model.player2Board);
}

// Drag and drop event listeners
popupShips.forEach((ship) => {
  ship.addEventListener("dragstart", (e) => {
    // grey out ship when dragging
    e.currentTarget.classList.add("dragging");
    e.dataTransfer.clearData();
    e.dataTransfer.setData("text/plain", e.target.id);
  });
  // return original color if it wasn't dropped
  ship.addEventListener("dragend", (e) => {
    e.currentTarget.classList.remove("dragging");
  });
});

// Make each square in board dropable
Array.from(popupBoard.children).forEach((row) => {
  Array.from(row.children).forEach((square) => {
    square.addEventListener("drop", (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      const draggedShip = document.getElementById(id);
      const shipSize = draggedShip.getAttribute("data");
      // remove from #ships
      draggedShip.remove();

      // addShip(size, coordRow, coordColumn, 'horizontal');
    });
    square.addEventListener("dragover", (e) => e.preventDefault());
  });
});

PubSub.subscribe("enemy-loaded", makeEnemySquaresClickable);
PubSub.subscribe("surrounding-squares-sunk", updateBothBoardsHits);
