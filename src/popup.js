import { player1Board } from "./model";
const popupShips = document.querySelectorAll("#ships .ship");
const popupBoard = document.querySelector("#pop-up .board");
const buttonStart = document.querySelector("#start");

// This object stores the squares that lay behind each ship, so that they can
// be updated when moving it.
const squaresBehind = {};

popupShips.forEach((ship) => {
  ship.addEventListener("dragstart", (e) => {
    // e.dataTransfer.clearData();
    setTimeout(() => {
      // Hide ship when dragging
      e.target.classList.add("hide");
    }, 0);
    e.dataTransfer.setData("text/plain", e.target.id);
  });
  // return original color if it wasn't dropped
  ship.addEventListener("dragend", (e) => {
    setTimeout(() => {
      // Hide ship when dragging
      e.target.classList.remove("hide");
    }, 0);
  });
});

// Make each square in board droppable
Array.from(popupBoard.children).forEach((row) => {
  Array.from(row.children).forEach((square) => {
    square.addEventListener("drop", (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      const draggedShip = document.getElementById(id);
      const shipSize = Number(draggedShip.getAttribute("data"));
      // remove from #ships
      e.target.classList.remove("drag-over");
      const squareNumber = Number(square.getAttribute("data"));

      // If there's enough space in grid
      if (squareNumber + shipSize <= 10) {
        // Updates squares behind when moving it withing board
        if (squaresBehind[id] !== undefined) {
          squaresBehind[id].forEach((squareBehind) =>
            squareBehind.classList.remove("behind")
          );
        }

        // Prevent squares from overflowing if selecting the first one
        let siblings = Array.from(square.parentElement.children)
        siblings = siblings.filter(sibling => sibling.id !== id);

        // Get selected squares
        const relevantSquares = siblings.slice(
          squareNumber,
          squareNumber + shipSize
        );

        relevantSquares.forEach((shipSquare) => {
          shipSquare.classList.add("behind");
        });
        squaresBehind[id] = relevantSquares;

        // Append the ship
        row.insertBefore(draggedShip, square.nextSibling)
      }
    });

    // When entering square
    square.addEventListener("dragenter", (e) => {
      e.preventDefault();
      e.target.classList.add("drag-over");
    });

    // This has to be here in order for it to work
    square.addEventListener("dragover", (e) => e.preventDefault());

    // When leaving square
    square.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.target.classList.remove("drag-over");
    });
  });
});

// Start game with button
buttonStart.addEventListener("click", () => {
  // Start game
  console.log("start");
});
