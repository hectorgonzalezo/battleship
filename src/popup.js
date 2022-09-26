import PubSub from "pubsub-js";
import model from "./model";
import Ship from "./gameObjects/ship";
import { SurroundingSquares, ClashChecker } from "./popupSquaresClasses";

const popup = document.querySelector("#pop-up");
const shipsArea = document.querySelector("#ships");
const popupShips = document.querySelectorAll("#pop-up .ship");
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

function getNumberValueFromProperty(ship, property) {
  return Number(
    getComputedStyle(ship).getPropertyValue(property).match(/\d/g).join("")
  );
}

// Extract values from ship div
function getValuesFromShipElement(ship) {
  const rowCoord = Number(ship.getAttribute("coordrow"));
  const columnCoord = Number(ship.getAttribute("coordcolumn"));
  const shipLength = Number(ship.getAttribute("data"));

  return [shipLength, rowCoord, columnCoord];
}

function hideRelevantSquares(ship, rowCoord, columnCoord, shipLength) {
  let relevantSquares = [];
  let surroundingSquares = [];

  // These two constants are used to place the ship with position: absolute
  const squareSizes = getNumberValueFromProperty(ship, "--square-size");
  const gapSize = getNumberValueFromProperty(ship, "--board-gap");

  updateSurroundingSquares(ship);

  if (!ship.classList.contains("vertical")) {
    // Horizontal position, if it fits and doesn't hit another ship or a surrounding square
    const siblings = Array.from(
      Array.from(popupBoard.children)[rowCoord].children
    );
    // Get selected squares
    relevantSquares = siblings.slice(columnCoord, columnCoord + shipLength);

    // Get surrounding squares do add hit

    surroundingSquares = new SurroundingSquares(
      rowCoord,
      columnCoord,
      shipLength
    ).getHorizontal();

    // Keep ship in position
    relevantSquares.forEach((relevantSquare) =>
      relevantSquare.classList.add("behind")
    );
  } else {
    // Vertical position, only if it fits
    const relevantRows = Array.from(popupBoard.children).slice(
      rowCoord,
      rowCoord + shipLength
    );
    relevantSquares = relevantRows.map((row) =>
      getSquareAtIndex(columnCoord, row)
    );
    relevantSquares = relevantSquares.flat();

    surroundingSquares = new SurroundingSquares(
      rowCoord,
      columnCoord,
      shipLength
    ).getVertical();
  }

  surroundingSquares.forEach((surroundingSquare) =>
    surroundingSquare.classList.add("hit")
  );

  ship.style.top = `${(squareSizes + gapSize) * rowCoord}px`;
  ship.style.left = `${(squareSizes + gapSize) * columnCoord}px`;

  squaresBehind[ship.id] = relevantSquares;
  squaresSurrounding[ship.id] = surroundingSquares;

  return relevantSquares;
}

// This function is used by the ship event listener
function allowVerticalRotationOnBoard(e) {
  const ship = e.target.parentElement;

  const [shipLength, rowCoord, columnCoord] = getValuesFromShipElement(ship);

  if (
    (!new ClashChecker(
      ship,
      rowCoord,
      columnCoord,
      shipLength,
      squaresBehind,
      squaresSurrounding
    ).horizontal() &&
      ship.classList.contains("vertical")) ||
    (!new ClashChecker(
      ship,
      rowCoord,
      columnCoord,
      shipLength,
      squaresBehind,
      squaresSurrounding
    ).vertical() &&
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
  ship.addEventListener("click", allowVerticalRotation);
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

      // If there's enough space in grid, append the ship
      if (
        (!new ClashChecker(
          draggedShip,
          rowNumber,
          squareNumber,
          shipSize,
          squaresBehind,
          squaresSurrounding
        ).horizontal() &&
          !draggedShip.classList.contains("vertical")) ||
        (!new ClashChecker(
          draggedShip,
          rowNumber,
          squareNumber,
          shipSize,
          squaresBehind,
          squaresSurrounding
        ).vertical() &&
          draggedShip.classList.contains("vertical"))
      ) {
        // So it can be rotated
        draggedShip.classList.add("dragged-in");
        draggedShip.removeEventListener("click", allowVerticalRotation);
        // Changes vertical rotation behavior when inside the board
        draggedShip.addEventListener("click", allowVerticalRotationOnBoard);
        // Add coordinates to object
        draggedShip.setAttribute("coordcolumn", squareNumber);
        draggedShip.setAttribute("coordrow", row.getAttribute("data"));

        hideRelevantSquares(draggedShip, rowNumber, squareNumber, shipSize);
        popupBoard.appendChild(draggedShip);
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
  // If player finished placing ships
  if (shipsArea.children.length === 0) {
    popupShips.forEach((ship) => {
      const [shipLength, rowCoord, columnCoord] =
        getValuesFromShipElement(ship);
      const newShip = Ship(shipLength);
      // Append each ship to player board
      model.player1Board.placeShip(newShip, rowCoord, columnCoord);
    });
    // Hide popup
    popup.classList.add("inactive");
    // Show game
    document.querySelector("#game").classList.remove("inactive");

    PubSub.publish("game-started", model.player1Board);
  }
});

buttonStart.addEventListener("mouseover", () => {
  if (shipsArea.children.length !== 0) {
    buttonStart.classList.add("not-yet");
  } else {
    buttonStart.classList.add("ready");
  }
});

buttonStart.addEventListener("mouseout", () => {
  buttonStart.classList.remove("not-yet");
  buttonStart.classList.remove("ready");
});
