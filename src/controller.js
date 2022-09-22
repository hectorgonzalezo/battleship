import PubSub from "pubsub-js";

const popupShips = document.querySelectorAll("#ships .ship");
const popupBoard = document.querySelector("#pop-up .board");

function addShip(size, coordRow, coordColumn, direction) {
  // view.renderShip(size, coordRow, coordColumn)
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
