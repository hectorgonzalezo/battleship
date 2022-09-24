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

export default hitChecker;
