const Ship = function (length) {
  // Array full with ones,
  const shipSquares = new Array(length).fill(1);
  let sunk = false;

  function isSunk() {
    sunk = shipSquares.every((hit) => hit === 0);
    return sunk;
  };

  function getLength() {
    return length;
  };

  function getHit(index) {
    // Only if index is not out of bounds
    if (index >= length || index < 0) {
      return shipSquares;
    }
    shipSquares[index] = 0;
    // if every square is hit, sunk returns true
    return shipSquares;
  };

  const getSquares = function(){
    return shipSquares
  }

  return { isSunk, getLength, getHit, getSquares};
};

const Gameboard = function () {
  // Keeps track of which ship is where.
  // 10X10 2d array of empty objects
  const boardSquares = Array(10)
    .fill()
    .map(() => [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);

  const getCurrentBoard = function () {
    return boardSquares;
  };

  function areAllShipsSunk(){
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

  function isAlreadyHit(square){
    const isEmptyAndWasHit = square.hit === true;
    const isShipAndWasHit = (square.ship !== undefined && square.ship.getSquares()[square.shipSquare] === 0)
    return  isEmptyAndWasHit || isShipAndWasHit
  }

  function isBlocked(length, rowCoord, columnCoord, direction) {
    let subArray;
    if (direction === "horizontal") {
      // get row
      subArray = boardSquares[rowCoord].slice(columnCoord, columnCoord + length);
    } else {
      // get only relevant rows
      subArray = boardSquares.filter(
        (row, i) => i >= rowCoord && i < rowCoord + length
      );
      // get only relevant columns
      subArray = subArray.map((row) =>
        row.filter((column, i) => i === columnCoord)
      );
      subArray = subArray.flat();
    }
    const isAnyOccupied = subArray.some((square) => square.hasOwnProperty('ship'));
    const isOutOfBounds = subArray.length !== length;
    return isAnyOccupied || isOutOfBounds;
  };

  function placeShip(ship, rowCoord, columnCoord, direction = "horizontal") {
    const length = ship.getLength();
    // Change board only if space is not occupied or it doesn't go out of bounds
    if (!isBlocked(length, rowCoord, columnCoord, direction)) {
      if (direction === "horizontal") {
        for (let i = 0; i < length; i++) {
          // Update list that keeps track of indices corresponding in ships
          const positionObject = boardSquares[rowCoord][i + columnCoord]
          positionObject.ship = ship;
          positionObject.shipSquare = i;
        }
      } else if (direction === "vertical"){
        // if direction is vertical
        for (let i = 0; i < length; i++) {
          const positionObject = boardSquares[rowCoord + i][columnCoord]
          positionObject.ship = ship;
          positionObject.shipSquare = i;
          
        }
      }
    }
  };


  function receiveAttack(rowCoord, columnCoord){
    if(!areAllShipsSunk()){
        const chosenSquare = boardSquares[rowCoord][columnCoord]
        if(isAlreadyHit(chosenSquare)){
            return 'Cant hit the same spot twice'
        }
    // If square is ocuppied, send hit to corresponding ship
    if(chosenSquare.hasOwnProperty('ship')){
        // If ship was allready hit
        chosenSquare.ship.getHit(chosenSquare.shipSquare);
     
    } else{
        // If its empty, update the board
        chosenSquare.hit = true; 
    }
    if(areAllShipsSunk()){
        // if ships were just sunk this turn
        return 'Ships were just sunk'
    }
} 
    return 'Ships already sunk'
  }

  return { getCurrentBoard, placeShip, receiveAttack, areAllShipsSunk};
};


function Player(){

}

export { Ship, Gameboard, Player};
