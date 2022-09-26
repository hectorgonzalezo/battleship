import PubSub from "pubsub-js";
import view from "./view";
import model from "./model";

const buttonRestart = document.querySelector("#restart");
// Restart webpage when pressing button
buttonRestart.addEventListener("click", () => {
  document.location.reload(true);
});

// Listener functions
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
function play2(minWait = 1000, closeTo = null, sankShip = false) {
  // play 2
  view.updateDisplay("Player2 turn");
  setTimeout(() => {
    let coords;
    let hit;
    if (Array.isArray(closeTo) && !sankShip) {
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
      play2(minWait * 2, coords, hit.ship.isSunk());
    } else if (model.player1Board.areAllShipsSunk()) {
      // If player 2 won stop the game
      view.updateDisplay("Sorry, you lost!");
    } else {
      // Otherwise, continue game
      makeEnemySquaresClickable();
    }
  }, Math.random() * 1000 + minWait);
}

function updateBoardHits(board) {
  const currentBoard = board.getCurrentBoard();
  currentBoard.forEach((row, i) => {
    row.forEach((square, j) => {
      if (square.hit === true) {
        view.updateBoardAt(board, i, j, true);
      }
    });
  });
}

function updateBothBoardsHits() {
  updateBoardHits(model.player1Board);
  updateBoardHits(model.player2Board);
}

// Drag and drop event listeners

PubSub.subscribe("enemy-loaded", makeEnemySquaresClickable);
PubSub.subscribe("surrounding-squares-sunk", updateBothBoardsHits);
