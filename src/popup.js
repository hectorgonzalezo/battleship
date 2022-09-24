import { player1Board } from "./model";
const popupShips = document.querySelectorAll("#ships .ship");
const popupBoard = document.querySelector("#pop-up .board");
const buttonStart = document.querySelector("#start");

// This object stores the squares that lay behind each ship, so that they can
// be updated when moving it.
const squaresBehind = {};
const squaresSurrounding = {};

function getSquareAtIndex(number, row) {
  let squares = Array.from(row.children);
  squares = squares.filter(
    (square) => Number(square.getAttribute("data")) === number
  );
  return squares;
}

function allowVerticalRotation(e) {
  e.target.parentElement.classList.toggle("vertical");
}

// This prevents the user from placing ships besides without at least 1 space between them
function getSurroundingSquaresHorizontal(
  siblings,
  rowCoord,
  columnCoord,
  shipLength
) {
  // only horizontal for now
  const board = document.querySelector("#pop-up .board");
  const iSquareBefore = Math.max(columnCoord - 1, 0);
  const iSquareAfter = Math.min(columnCoord + shipLength, 9);
  const iRowBefore = Math.max(rowCoord - 1, 0);
  const iRowAfter = Math.min(rowCoord + 1, 9);
  let rowBefore = Array.from(Array.from(board.children)[iRowBefore].children);
  rowBefore = rowBefore.filter((square) => !square.classList.contains("ship"));
  let rowAfter = Array.from(Array.from(board.children)[iRowAfter].children);
  rowAfter = rowAfter.filter((square) => !square.classList.contains("ship"));

  let surroundingSquares = [siblings[iSquareBefore], siblings[iSquareAfter]];
  const upperSquares = rowBefore.slice(iSquareBefore, iSquareAfter + 1);
  const lowerSquares = rowAfter.slice(iSquareBefore, iSquareAfter + 1);

  surroundingSquares = surroundingSquares.concat(upperSquares);
  surroundingSquares = surroundingSquares.concat(lowerSquares);

  return surroundingSquares;
}

// Prevents hits from being removed when moving a ship, from the vicinity of another
function reAddHits() {
  const allHits = Object.values(squaresSurrounding);
  allHits.forEach((hits) => {
    if (Array.isArray(hits)) {
      hits.forEach((hit) => hit.classList.add("hit"));
    }
  });
}

function hideRelevantSquares(ship, rowCoord, columnCoord, shipLength) {
  // Show previously hidden squares
  if (squaresBehind[ship.id] !== undefined) {
    squaresBehind[ship.id].forEach((squareBehind) =>
      squareBehind.classList.remove("behind")
    );
  }

  // Remove hit from previous surrounding squares
  if (squaresSurrounding[ship.id] !== undefined) {
    squaresSurrounding[ship.id].forEach((squareSurrounding) => {
      squareSurrounding.classList.remove("hit");
      // Re add hit if it belongs to another ship
    });
    squaresSurrounding[ship.id] = {};
    reAddHits();
  }

  // remove hit from previous squares
  const board = document.querySelector("#pop-up .board");
  let relevantSquares;
  let surroundingSquares;

  if (!ship.classList.contains("vertical")) {
    if (columnCoord + shipLength <= 10) {
      // Horizontal position, if it fits
      let siblings = Array.from(Array.from(board.children)[rowCoord].children);
      siblings = siblings.filter((sibling) => sibling.id !== ship.id);

      // Get selected squares
      relevantSquares = siblings.slice(columnCoord, columnCoord + shipLength);

      // Get surrounding squares do add hit
      surroundingSquares = getSurroundingSquaresHorizontal(
        siblings,
        rowCoord,
        columnCoord,
        shipLength
      );
      surroundingSquares.forEach((surroundingSquare) =>
        surroundingSquare.classList.add("hit")
      );

      // Keep ship in position
      ship.style.position = "";

      relevantSquares.forEach((relevantSquare) =>
        relevantSquare.classList.add("behind")
      );
    }
  } else if (rowCoord + shipLength <= 10) {
    // Vertical position, only if it fits
    // Hide new relevant squares
    const relevantRows = Array.from(board.children).slice(
      rowCoord,
      rowCoord + shipLength
    );
    relevantSquares = relevantRows.map((row) =>
      getSquareAtIndex(columnCoord, row)
    );
    relevantSquares = relevantSquares.flat();

    // make ship position absolute
    const squareSizes = Number(
      getComputedStyle(ship)
        .getPropertyValue("--square-size")
        .match(/\d/g)
        .join("")
    );
    const gapSize = Number(
      getComputedStyle(ship)
        .getPropertyValue("--board-gap")
        .match(/\d/g)
        .join("")
    );
    ship.style.position = "absolute";
    ship.style.left = `${(squareSizes + gapSize) * columnCoord}px`;
  }

  squaresBehind[ship.id] = relevantSquares;
  squaresSurrounding[ship.id] = surroundingSquares;

  return relevantSquares;
}

// This function is used by the ship event listener
function allowVerticalRotationOnBoard(e) {
  const ship = e.target.parentElement;
  const rowCoord = Number(ship.getAttribute("coordrow"));
  const columnCoord = Number(ship.getAttribute("coordcolumn"));
  const shipLength = Number(ship.getAttribute("data"));

  ship.classList.toggle("vertical");
  // Reveal previously hidden squares, and hide new ones
  hideRelevantSquares(ship, rowCoord, columnCoord, shipLength);
}

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

  // Rotate on double click
  ship.addEventListener("dblclick", allowVerticalRotation);
});

// Make each square in board droppable
Array.from(popupBoard.children).forEach((row) => {
  Array.from(row.children).forEach((square) => {
    const rowNumber = Number(row.getAttribute("data"));
    square.addEventListener("drop", (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      const draggedShip = document.getElementById(id);
      const shipSize = Number(draggedShip.getAttribute("data"));
      // remove from #ships
      e.target.classList.remove("drag-over");
      const squareNumber = Number(square.getAttribute("data"));

      // So it can be rotated
      draggedShip.classList.add("dragged-in");
      draggedShip.removeEventListener("dblclick", allowVerticalRotation);
      // Changes vertical rotation behavior when inside the board
      draggedShip.addEventListener("dblclick", allowVerticalRotationOnBoard);

      // Add coordinates to object
      draggedShip.setAttribute("coordColumn", squareNumber);
      draggedShip.setAttribute("coordRow", row.getAttribute("data"));

      const relevantSquares = hideRelevantSquares(
        draggedShip,
        rowNumber,
        squareNumber,
        shipSize
      );
      // If there's enough space in grid, append the ship
      if (relevantSquares !== undefined) {
        row.insertBefore(draggedShip, square.nextSibling);
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
