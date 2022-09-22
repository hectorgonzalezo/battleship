import PubSub from "pubsub-js";
import view from "./view"
import model from './model'
import { Player } from './gameObjects'

const popupShips = document.querySelectorAll("#ships .ship");
const popupBoard = document.querySelector("#pop-up .board");


let enemySquares;


function enemySquaresListener(event){
    const square = event.target;
    const rowCoord = square.parentElement.getAttribute('data');
    const columnCoord = square.getAttribute('data');
    const player1 = model.player1;
    // Attack selected square
    player1.playTurn(rowCoord, columnCoord);
    // Show hit on webpage
    view.updateBoardAt(model.player2Board, rowCoord, columnCoord);
}

function makeEnemySquaresClickable(){
    enemySquares = document.querySelectorAll('.square.enemy');
    enemySquares.forEach(square => {
        square.addEventListener('click', enemySquaresListener);
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

