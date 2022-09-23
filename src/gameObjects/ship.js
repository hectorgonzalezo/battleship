
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
}

export default Ship
