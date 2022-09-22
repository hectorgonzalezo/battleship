import getRandomNumber from './getRandomNumber';

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

const Gameboard = function(playerNumber) {
    const associatedDiv = document.querySelector(`#player${playerNumber}-board`);
  // Keeps track of which ship is where.
  // 10X10 2d array of empty objects
  const boardSquares = Array(10)
    .fill()
    .map(() => [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);

  const getCurrentBoard = function () {
    return boardSquares;
  };

  const getDiv = function(){
    return associatedDiv
  }

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

  function isAlreadyHit(square) {
    const isEmptyAndWasHit = square.hit === true;
    const isShipAndWasHit =
      square.ship !== undefined &&
      square.ship.getSquares()[square.shipSquare] === 0;
    return isEmptyAndWasHit || isShipAndWasHit;
  }

  // gets only items from row, from start -1 to start + length + 1
  function getSurroundingSquares(row, start, length){
    const array = [];
    [-1, 0, 1].forEach(num => {
        // only get squares inside bounds
        if((row + num >= 0) && (row + num <= 9)){
            const currentRow = boardSquares[row + num].slice(Math.max(0, (start - 1)), Math.min(10, (start + length + 1)))
            array.push(currentRow)
        }
    })
    return array.flat();
  }

  function isBlocked(length, rowCoord, columnCoord, direction) {
    let subArray;
    let offendingSquares;
    if (direction === "horizontal") {
      // get row, including surrounding squares
      subArray = getSurroundingSquares(rowCoord, columnCoord, length);
      offendingSquares = boardSquares[rowCoord].slice(columnCoord, columnCoord + length);
    } else {
      // get only relevant rows
      subArray = boardSquares.filter(
        (row, i) => i >= Math.max(0, (rowCoord - 1)) && i < Math.min(10, (rowCoord + length + 1))
      );
      offendingSquares = boardSquares.filter(
        (row, i) => i >= rowCoord && i < rowCoord + length
      );
      // get only relevant columns
      subArray = subArray.map((row) =>
        row.filter((column, i) => i >= Math.max(0, (columnCoord - 1)) || i <= Math.min(9, (columnCoord + 1)))
      );
      offendingSquares = offendingSquares.map((row) =>
      row.filter((column, i) => i === columnCoord)
    );
      subArray = subArray.flat();
      offendingSquares = offendingSquares.flat();
    }

    // console.log(subArray)

    const isAnyOccupied = subArray.some((square) => square.hasOwnProperty("ship")
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
      return ship
    }
  }

  function receiveAttack(rowCoord, columnCoord) {
    if (!areAllShipsSunk()) {
      const chosenSquare = boardSquares[rowCoord][columnCoord];
      if (isAlreadyHit(chosenSquare)) {
        return "Cant hit the same spot twice";
      }
      // If square is ocuppied, send hit to corresponding ship
      if (chosenSquare.hasOwnProperty("ship")) {
        // If ship was allready hit
        chosenSquare.ship.getHit(chosenSquare.shipSquare);
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
  async function placeRandomShips(number = 1){
    const ships = [];
    // place ships until there are six in board
    while (ships.length !== number){
        const randomLength = getRandomNumber(4) + 1;
        const randomRowCoord = getRandomNumber(9);
        const randomColumnCoord = getRandomNumber(9);
        const randomDirection = ['horizontal', 'vertical'][getRandomNumber(1)];

        const ship = placeShip(Ship(randomLength), randomRowCoord, randomColumnCoord, randomDirection);
        // If ship was succesfully placed, append it to array
        if(ship !== undefined){
            ships.push(ship);
        }
    }
    return Promise.resolve(ships)
  }

  return { getCurrentBoard, getDiv, placeShip, receiveAttack, areAllShipsSunk, placeRandomShips};
};

function Player(oponentGameboard, number) {
  function playTurn(rowCoord, columnCoord) {
    return oponentGameboard.receiveAttack(rowCoord, columnCoord);
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

    const currentBoard = oponentGameboard.getCurrentBoard();
    // If those coords are occupied choose anothers
    while (
      currentBoard[randomRow][randomColumn].hasOwnProperty("hit") ||
      currentBoard[randomRow][randomColumn].hasOwnProperty("ship")
    ) {
      randomRow = getRandomNumber();
      randomColumn = getRandomNumber();
    }

    return oponentGameboard.receiveAttack(randomRow, randomColumn);
  }
  return Object.assign(prototype, { playRandom });
}

export { Ship, Gameboard, Player, AIPlayer };
