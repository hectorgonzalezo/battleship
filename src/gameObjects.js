import getRandomNumber from "./getRandomNumber";
import PubSub from "pubsub-js";

const hitChecker = (function hitChecker() {
  // Receives a square from Gameboard and checks if it was previously hit
  function isAlreadyHit(square) {
    const isEmptyAndWasHit = square.hit === true;
    const isShipAndWasHit =
      square.ship !== undefined &&
      square.ship.getSquares()[square.shipSquare] === 0;
    return isEmptyAndWasHit || isShipAndWasHit;
  }

  //   receives a coordinate and checks if it is out of bounds
  function isCoordOutOfBounds(coords) {
    const isRowOutOfBounds = coords[0] < 0 || coords[0] > 9;
    const isColumnOutOfBounds = coords[1] < 0 || coords[1] > 9;
    return isRowOutOfBounds || isColumnOutOfBounds;
  }
  return { isAlreadyHit, isCoordOutOfBounds };
})();

const Ship = function (length) {
  // Array full with ones,
  const shipSquares = new Array(length).fill(1);
  let sunk = false;

  function isSunk() {
    sunk = shipSquares.every((hit) => hit === 0);
    return sunk;
  }

  function getLength() {
    return length;
  }

  function getHit(index) {
    // Only if index is not out of bounds
    if (index >= length || index < 0) {
      return shipSquares;
    }
    shipSquares[index] = 0;
    // if every square is hit, sunk returns true
    return shipSquares;
  }

  const getSquares = function () {
    return shipSquares;
  };

  return { isSunk, getLength, getHit, getSquares };
};

const Gameboard = function (playerNumber) {
  const associatedDiv = document.querySelector(`#player${playerNumber}-board`);
  // Keeps track of which ship is where.
  // 10X10 2d array of empty objects
  const boardSquares = Array(10)
    .fill()
    .map(() => [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);

  const getCurrentBoard = function () {
    return boardSquares;
  };

  const getDiv = function () {
    return associatedDiv;
  };

  function areAllShipsSunk() {
    // Checks if every ship in the board is sunk
    return boardSquares.every((row) =>
      row.every((square) => {
        if (square.ship !== undefined) {
          return square.ship.isSunk();
        }
        return true;
      })
    );
  }

  function calculateShipStart(square, rowCoord, columnCoord) {
    const currentIndex = square.shipSquare;
    if (square.direction === "horizontal") {
      return [rowCoord, columnCoord - currentIndex];
    }
    return [rowCoord - currentIndex, columnCoord];
  }

  // gets only items from row, from start -1 to start + length + 1
  function getSurroundingSquaresHorizontal(rowCoord, columnCoord, length) {
    const array = [];
    [-1, 0, 1].forEach((num) => {
      // only get squares inside bounds
      if (rowCoord + num >= 0 && rowCoord + num <= 9) {
        const currentRow = boardSquares[rowCoord + num].slice(
          Math.max(0, columnCoord - 1),
          Math.min(10, columnCoord + length + 1)
        );
        array.push(currentRow);
      }
    });

    const offendingSquares = boardSquares[rowCoord].slice(
      columnCoord,
      columnCoord + length
    );

    return [array.flat(), offendingSquares];
  }

  function getSurroundingSquaresVertical(rowCoord, columnCoord, length) {
    let subArray;
    let offendingSquares;
    // get only relevant rows
    subArray = boardSquares.filter(
      (row, i) =>
        i >= Math.max(0, rowCoord - 1) &&
        i < Math.min(10, rowCoord + length + 1)
    );
    offendingSquares = boardSquares.filter(
      (row, i) => i >= rowCoord && i < rowCoord + length
    );
    // get only relevant columns
    subArray = subArray.map((row) =>
      row.filter(
        (column, i) =>
          i >= Math.max(0, columnCoord - 1) || i <= Math.min(9, columnCoord + 1)
      )
    );
    offendingSquares = offendingSquares.map((row) =>
      row.filter((column, i) => i === columnCoord)
    );
    subArray = subArray.flat();
    offendingSquares = offendingSquares.flat();

    return [subArray, offendingSquares];
  }

  function updateSurroundingSquaresIfSunk(square, rowCoord, columnCoord) {
    if (square.ship.isSunk()) {
      const start = calculateShipStart(square, rowCoord, columnCoord);
      const length = square.ship.getLength();
      let surroundingSquares;
      if (square.direction === "horizontal") {
        [surroundingSquares] = getSurroundingSquaresHorizontal(
          start[0],
          start[1],
          length
        );
      } else {
        [surroundingSquares] = getSurroundingSquaresVertical(
          start[0],
          start[1],
          length
        );
      }

      surroundingSquares = surroundingSquares.filter(
        (square) => square.ship === undefined
      );

      // Sink every square that is not a ship
      surroundingSquares.forEach((square) => (square.hit = true));
      PubSub.publish("surrounding-squares-sunk");
    }
  }

  function isBlocked(length, rowCoord, columnCoord, direction) {
    let subArray;
    let offendingSquares;
    if (direction === "horizontal") {
      // get row, including surrounding squares
      [subArray, offendingSquares] = getSurroundingSquaresHorizontal(
        rowCoord,
        columnCoord,
        length
      );
    } else {
      [subArray, offendingSquares] = getSurroundingSquaresVertical(
        rowCoord,
        columnCoord,
        length
      );
    }
    const isAnyOccupied = subArray.some((square) =>
      square.hasOwnProperty("ship")
    );
    const isOutOfBounds = offendingSquares.length !== length;

    return isAnyOccupied || isOutOfBounds;
  }

  function placeShip(ship, rowCoord, columnCoord, direction = "horizontal") {
    const length = ship.getLength();
    // Change board only if space is not occupied or it doesn't go out of bounds
    if (!isBlocked(length, rowCoord, columnCoord, direction)) {
      if (direction === "horizontal") {
        for (let i = 0; i < length; i++) {
          // Update list that keeps track of indices corresponding in ships
          const positionObject = boardSquares[rowCoord][i + columnCoord];
          positionObject.ship = ship;
          positionObject.shipSquare = i;
          positionObject.direction = direction;
        }
      } else if (direction === "vertical") {
        // if direction is vertical
        for (let i = 0; i < length; i++) {
          const positionObject = boardSquares[rowCoord + i][columnCoord];
          positionObject.ship = ship;
          positionObject.shipSquare = i;
          positionObject.direction = direction;
        }
      }
      return ship;
    }
  }

  function receiveAttack(rowCoord, columnCoord) {
    if (!areAllShipsSunk()) {
      const chosenSquare = boardSquares[rowCoord][columnCoord];
      if (hitChecker.isAlreadyHit(chosenSquare)) {
        return "Cant hit the same spot twice";
      }
      // If square is occupied, send hit to corresponding ship
      if (chosenSquare.hasOwnProperty("ship")) {
        chosenSquare.ship.getHit(chosenSquare.shipSquare);
        // hit surrounding squares if ship is sunk
        updateSurroundingSquaresIfSunk(chosenSquare, rowCoord, columnCoord);
      } else {
        // If its empty, update the board
        chosenSquare.hit = true;
      }
      if (areAllShipsSunk()) {
        // if ships were just sunk this turn
        return "Ships were just sunk";
      }
      return chosenSquare;
    }
    return "Ships already sunk";
  }

  // Populates the gameboard with number ships
  async function placeRandomShips(number = 1) {
    const ships = [];
    // place ships until there are six in board
    while (ships.length !== number) {
      const randomLength = getRandomNumber(4) + 1;
      const randomRowCoord = getRandomNumber(9);
      const randomColumnCoord = getRandomNumber(9);
      const randomDirection = ["horizontal", "vertical"][getRandomNumber(1)];

      const ship = placeShip(
        Ship(randomLength),
        randomRowCoord,
        randomColumnCoord,
        randomDirection
      );
      // If ship was succesfully placed, append it to array
      if (ship !== undefined) {
        ships.push(ship);
      }
    }
    return Promise.resolve(ships);
  }

  return {
    getCurrentBoard,
    getDiv,
    placeShip,
    receiveAttack,
    areAllShipsSunk,
    placeRandomShips,
  };
};

function Player(oponentGameboard, number) {
  function playTurn(rowCoord, columnCoord) {
    // Returns ship being hit
    // Coordinates are extracted by controller from DOM, so they have to be
    // converted into integers
    return oponentGameboard.receiveAttack(
      Number(rowCoord),
      Number(columnCoord)
    );
  }

  function getNumber() {
    return number;
  }
  return { playTurn, getNumber };
}

function AIPlayer(oponentGameboard, number) {
  const prototype = Player(oponentGameboard, number);

  function playRandom() {
    let randomRow = getRandomNumber();
    let randomColumn = getRandomNumber();
    let tentativeLocation =
      oponentGameboard.getCurrentBoard()[randomRow][randomColumn];

    // If those coords are occupied choose anothers
    while (hitChecker.isAlreadyHit(tentativeLocation)) {
      randomRow = getRandomNumber();
      randomColumn = getRandomNumber();
      tentativeLocation =
        oponentGameboard.getCurrentBoard()[randomRow][randomColumn];
    }

    const hit = oponentGameboard.receiveAttack(randomRow, randomColumn);
    // Returns coordinates so that it can be used to
    return [[randomRow, randomColumn], hit];
  }

  // If AIPlayer got a hit, continue playing around the same square
  function playAround(coords) {
    const randomOffsetRow = getRandomNumber(1) * [1, -1][getRandomNumber(1)];
    let randomRow = coords[0] + randomOffsetRow;
    let randomOffsetColumn;
    let hit;

    // This prevents the AI from choosing a square in a diagonal direction
    if (randomOffsetRow === 0) {
      randomOffsetColumn = getRandomNumber(1) * [1, -1][getRandomNumber(1)];
    } else {
      randomOffsetColumn = 0;
    }

    let randomColumn = coords[1] + randomOffsetColumn;
    let tentativeLocation;

    // Dont look for tentative location if coordinates are out of bounds
    if (!hitChecker.isCoordOutOfBounds([randomRow, randomColumn])) {
      tentativeLocation =
        oponentGameboard.getCurrentBoard()[randomRow][randomColumn];
    }

    // If those coords are occupied choose another set by calling recursively
    if (
      hitChecker.isCoordOutOfBounds([randomRow, randomColumn]) ||
      hitChecker.isAlreadyHit(tentativeLocation)
    ) {
      [[randomRow, randomColumn], hit] = playAround(coords);
    } else {
      // base case
      // the hit bubbles up the stack
      hit = oponentGameboard.receiveAttack(randomRow, randomColumn);
    }
    // Returns coordinates so that it can be used to
    return [[randomRow, randomColumn], hit];
  }

  return Object.assign(prototype, { playRandom, playAround });
}

export { Ship, Gameboard, Player, AIPlayer };
