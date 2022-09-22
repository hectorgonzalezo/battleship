import PubSub from "pubsub-js";
import view from "./view"
import model from './model'
import { Player } from './gameObjects'

const popupShips = document.querySelectorAll("#ships .ship");
const popupBoard = document.querySelector("#pop-up .board");


// Player 2 turn
async function play2(){
    // play 2
    view.updateDisplay("Player2 turn");
    setTimeout(() => {
      const coords = model.player2.playRandom();
      if(model.player1Board.areAllShipsSunk()){
        // If player 2 won stop the game
        view.updateDisplay('Sorry, you lost!')
    } else{
      makeEnemySquaresClickable();
      view.updateBoardAt(model.player1Board, coords[0], coords[1]);
    }
    }, (Math.random() * 1000) + 1000);
}

// Listener allows for player to play turn
function enemySquaresListener(event){
    const square = event.target;
    const rowCoord = square.parentElement.getAttribute('data');
    const columnCoord = square.getAttribute('data');
    // Attack selected square
    model.player1.playTurn(rowCoord, columnCoord);
    // Show hit on webpage
    view.updateBoardAt(model.player2Board, rowCoord, columnCoord);
    if(model.player2Board.areAllShipsSunk()){
        // If you won
        view.updateDisplay('You won!')
    } else if(model.player1Board.areAllShipsSunk()){
        // If player 2 won
        view.updateDisplay('Sorry, you lost!')
    } else {
        // If nobody won, continue playing
        play2();
    }
    makeEnemySquaresUnclickable();
}


function makeEnemySquaresClickable(){
    const enemySquares = document.querySelectorAll('.square.enemy');
    enemySquares.forEach(square => {
        square.addEventListener('click', enemySquaresListener);
    });
    view.updateDisplay('Your turn')
}

function makeEnemySquaresUnclickable(){
    const enemySquares = document.querySelectorAll('.square.enemy');
    enemySquares.forEach(square => {
        square.removeEventListener('click', enemySquaresListener);
    });
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


PubSub.subscribe('enemy-loaded', makeEnemySquaresClickable)

