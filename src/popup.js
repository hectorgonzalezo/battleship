import { player1Board } from "./model";
const popupShips = document.querySelectorAll("#ships .ship");
const popupBoard = document.querySelector("#pop-up .board");
const buttonStart = document.querySelector("#start");

// This object stores the squares that lay behind each ship, so that they can
// be updated when moving it.
const squaresBehind = {
  carrier: [],
  battleship: [],
  cruiser: [],
  submarine1: [],
  submarine2: [],
  destroyer1: [],
  destroyer2: [],
  destroyer3: [],
};
const squaresSurrounding = {
  carrier: [],
  battleship: [],
  cruiser: [],
  submarine1: [],
  submarine2: [],
  destroyer1: [],
  destroyer2: [],
  destroyer3: [],
};

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

// This prevents the user from placing ships besides each other
// without at least 1 space between them
function getSurroundingSquaresHorizontal(
  siblings,
  rowCoord,
  columnCoord,
  shipLength
) {
  const iSquareBefore = Math.max(columnCoord - 1, 0);
  const iSquareAfter = Math.min(columnCoord + shipLength, 9);
  const iRowBefore = Math.max(rowCoord - 1, 0);
  const iRowAfter = Math.min(rowCoord + 1, 9);

  let rowBefore = Array.from(
    Array.from(popupBoard.children)[iRowBefore].children
  );
  rowBefore = rowBefore.filter((square) => !square.classList.contains("ship"));
  let rowAfter = Array.from(
    Array.from(popupBoard.children)[iRowAfter].children
  );
  rowAfter = rowAfter.filter((square) => !square.classList.contains("ship"));

  let surroundingSquares = [siblings[iSquareBefore], siblings[iSquareAfter]];
  const upperSquares = rowBefore.slice(iSquareBefore, iSquareAfter + 1);
  const lowerSquares = rowAfter.slice(iSquareBefore, iSquareAfter + 1);

  surroundingSquares = surroundingSquares.concat(upperSquares);
  surroundingSquares = surroundingSquares.concat(lowerSquares);

  return surroundingSquares;
}

function getSurroundingSquaresVertical(rowCoord, columnCoord, shipLength) {
  const iSquareBefore = Math.max(columnCoord - 1, 0);
  const iSquareAfter = Math.min(columnCoord + 1, 9);
  const iRowBefore = Math.max(rowCoord - 1, 0);
  const iRowAfter = Math.min(rowCoord + shipLength, 9);

  // upper and lower rows
  let rowBefore = Array.from(
    Array.from(popupBoard.children)[iRowBefore].children
  )
    .filter((square) => !square.classList.contains("ship"))
    .slice(iSquareBefore, iSquareAfter + 1);
  rowBefore = rowBefore.filter((square) => !square.classList.contains("ship"));
  let rowAfter = Array.from(Array.from(popupBoard.children)[iRowAfter].children)
    .filter((square) => !square.classList.contains("ship"))
    .slice(iSquareBefore, iSquareAfter + 1);
  rowAfter = rowAfter.filter((square) => !square.classList.contains("ship"));

  // squares before and after
  let shipRows = Array.from(popupBoard.children).filter(
    (square) => !square.classList.contains("ship")
  );
  shipRows = shipRows.slice(rowCoord, rowCoord + shipLength);
  const sideSquares = shipRows
    .map((row) => {
      let rowArray = Array.from(row.children);
      rowArray = rowArray.filter(
        (square) => !square.classList.contains("ship")
      );
      return rowArray.slice(iSquareBefore, iSquareAfter + 1);
    })
    .flat();
  let surroundingSquares = [];

  surroundingSquares = surroundingSquares.concat(rowBefore);
  surroundingSquares = surroundingSquares.concat(rowAfter);
  surroundingSquares = surroundingSquares.concat(sideSquares);

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

// Keeps track of the squares currently surrounding a ship
function updateSurroundingSquares(ship) {
  const previousSquaresBehind = squaresBehind[ship.id];
  squaresBehind[ship.id].forEach((squareBehind) =>
    squareBehind.classList.remove("behind")
  );

  // Remove hit from previous surrounding squares
  const previousSquaresSurrounding = squaresSurrounding[ship.id];
  squaresSurrounding[ship.id].forEach((squareSurrounding) => {
    squareSurrounding.classList.remove("hit");
    // Re add hit if it belongs to another ship
    squaresSurrounding[ship.id] = {};
    reAddHits();
  });
  return [previousSquaresBehind, previousSquaresSurrounding];
}

// Checks if theres a ship or a     surrounding square in the way
function isClashingHorizontally(ship, rowCoord, columnCoord, shipLength) {
  if (columnCoord + shipLength > 10) {
    return true;
  }

  let siblings = Array.from(Array.from(popupBoard.children)[rowCoord].children);
  siblings = siblings.filter(
    (sibling) => sibling.id !== ship.id && !sibling.classList.contains("ship")
  );
  const prospectiveSquares = siblings.slice(
    columnCoord,
    columnCoord + shipLength
  );

  // check if the rest of the squaresSurrounding arrays include the square
  const { [ship.id]: omitted, ...restOfArray } = squaresSurrounding;
  const restOfSquaresSurrounding = Object.values(restOfArray).flat();

  // Return true if any square is a ship or a hit
  const isAnyClashing = prospectiveSquares.some(
    (square) =>
      restOfSquaresSurrounding.includes(square) ||
      (square.classList.contains("ship") && square.id !== ship.id)
  );
  return isAnyClashing;
}

function isClashingVertically(ship, rowCoord, columnCoord, shipLength) {
  if (rowCoord + shipLength > 10) {
    return true;
  }
  const prospectiveSquares = [];
  const rows = Array.from(popupBoard.children).slice(
    rowCoord,
    rowCoord + shipLength
  );

  rows.forEach((row) => {
    let rowArray = Array.from(row.children);
    rowArray = rowArray.filter(
      (square) => square.id !== ship.id || !square.classList.contains("ship")
    );
    return rowArray.forEach((square) => {
      if (Number(square.getAttribute("data")) === columnCoord) {
        prospectiveSquares.push(square);
      }
    });
  });

  const surroundingSquares = getSurroundingSquaresVertical(
    rowCoord,
    columnCoord,
    shipLength
  );
  const isASurroundingSquareShip = surroundingSquares.some((square) =>
    square.classList.contains("ship")
  );

  // check if the rest of the squaresSurrounding arrays include the square
  const { [ship.id]: omitted, ...restOfArray } = squaresSurrounding;
  const restOfSquaresSurrounding = Object.values(restOfArray).flat();

  // Return true if any square is a ship or a hit
  const isAnyClashing = prospectiveSquares.some(
    (square) =>
      restOfSquaresSurrounding.includes(square) ||
      isASurroundingSquareShip ||
      (square.classList.contains("ship") && square.id !== ship.id)
  );
  return isAnyClashing;
}

function hideRelevantSquares(ship, rowCoord, columnCoord, shipLength) {
  let relevantSquares = [];
  let surroundingSquares = [];

  if (!ship.classList.contains("vertical")) {
    if (!isClashingHorizontally(ship, rowCoord, columnCoord, shipLength)) {
      updateSurroundingSquares(ship);
      // Horizontal position, if it fits and doesn't hit another ship or a surrounding square
      let siblings = Array.from(
        Array.from(popupBoard.children)[rowCoord].children
      );
      siblings = siblings.filter(
        (sibling) =>
          sibling.id !== ship.id && !sibling.classList.contains("ship")
      );

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
  } else if (!isClashingVertically(ship, rowCoord, columnCoord, shipLength)) {
    // Vertical position, only if it fits
    updateSurroundingSquares(ship);
    const relevantRows = Array.from(popupBoard.children).slice(
      rowCoord,
      rowCoord + shipLength
    );
    relevantSquares = relevantRows.map((row) =>
      getSquareAtIndex(columnCoord, row)
    );
    relevantSquares = relevantSquares.flat();

    surroundingSquares = getSurroundingSquaresVertical(
      rowCoord,
      columnCoord,
      shipLength
    );
    surroundingSquares.forEach((surroundingSquare) =>
      surroundingSquare.classList.add("hit")
    );

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

  if (
    (!isClashingHorizontally(ship, rowCoord, columnCoord, shipLength) &&
      ship.classList.contains("vertical")) ||
    (!isClashingVertically(ship, rowCoord, columnCoord, shipLength) &&
      !ship.classList.contains("vertical"))
  ) {
    ship.classList.toggle("vertical");
    // Reveal previously hidden squares, and hide new ones
    hideRelevantSquares(ship, rowCoord, columnCoord, shipLength);
  }
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
      draggedShip.setAttribute("coordcolumn", squareNumber);
      draggedShip.setAttribute("coordrow", row.getAttribute("data"));

      hideRelevantSquares(draggedShip, rowNumber, squareNumber, shipSize);

      // If there's enough space in grid, append the ship
      if (
        (!isClashingHorizontally(
          draggedShip,
          rowNumber,
          squareNumber,
          shipSize
        ) &&
          !draggedShip.classList.contains("vertical")) ||
        (!isClashingVertically(
          draggedShip,
          rowNumber,
          squareNumber,
          shipSize
        ) &&
          draggedShip.classList.contains("vertical"))
      ) {
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
