// Extracts the squares around a particular ship
class SurroundingSquares {
  popupBoard = document.querySelector("#pop-up .board");

  constructor(rowCoord, columnCoord, shipLength) {
    this.rowCoord = rowCoord;
    this.columnCoord = columnCoord;
    this.shipLength = shipLength;
    this.iSquareBefore = Math.max(columnCoord - 1, 0);
    this.iRowBefore = Math.max(rowCoord - 1, 0);
    this.rowBefore = Array.from(
      Array.from(this.popupBoard.children)[this.iRowBefore].children
    );
    this.surroundingSquares = [];
  }

  getHorizontal() {
    const iSquareAfter = Math.min(this.columnCoord + this.shipLength, 9);
    const iRowAfter = Math.min(this.rowCoord + 1, 9);

    const siblings = Array.from(
      Array.from(this.popupBoard.children)[this.rowCoord].children
    );

    const rowAfter = Array.from(
      Array.from(this.popupBoard.children)[iRowAfter].children
    );

    this.surroundingSquares = [
      siblings[this.iSquareBefore],
      siblings[iSquareAfter],
    ];
    const upperSquares = this.rowBefore.slice(
      this.iSquareBefore,
      iSquareAfter + 1
    );
    const lowerSquares = rowAfter.slice(this.iSquareBefore, iSquareAfter + 1);

    this.surroundingSquares = this.surroundingSquares.concat(upperSquares);
    this.surroundingSquares = this.surroundingSquares.concat(lowerSquares);

    return this.surroundingSquares;
  }

  getVertical() {
    const iSquareAfter = Math.min(this.columnCoord + 1, 9);
    const iRowAfter = Math.min(this.rowCoord + this.shipLength, 9);

    this.rowBefore = this.rowBefore.slice(this.iSquareBefore, iSquareAfter + 1);

    const rowAfter = Array.from(
      Array.from(this.popupBoard.children)[iRowAfter].children
    ).slice(this.iSquareBefore, iSquareAfter + 1);

    // squares before and after
    const shipRows = Array.from(this.popupBoard.children).slice(
      this.rowCoord,
      this.rowCoord + this.shipLength
    );
    const sideSquares = shipRows
      .map((row) => {
        const rowArray = Array.from(row.children);
        return rowArray.slice(this.iSquareBefore, iSquareAfter + 1);
      })
      .flat();

    this.surroundingSquares = this.surroundingSquares.concat(this.rowBefore);
    this.surroundingSquares = this.surroundingSquares.concat(rowAfter);
    this.surroundingSquares = this.surroundingSquares.concat(sideSquares);

    return this.surroundingSquares;
  }
}

// Checks wether there are any clashes when moving
class ClashChecker {
  popupBoard = document.querySelector("#pop-up .board");

  constructor(
    ship,
    rowCoord,
    columnCoord,
    shipLength,
    squaresSurrounding,
    squaresBehind
  ) {
    this.ship = ship;
    this.rowCoord = rowCoord;
    this.columnCoord = columnCoord;
    this.shipLength = shipLength;
    this.squaresSurrounding = squaresSurrounding;
    this.squaresBehind = squaresBehind;
    this.prospectiveSquares = [];
  }

  isClashing() {
    const { [this.ship.id]: omittedSurrouding, ...restOfSurroundingArray } =
      this.squaresSurrounding;
    const restOfSquaresSurrounding = Object.values(
      restOfSurroundingArray
    ).flat();

    const { [this.ship.id]: omittedBehind, ...restOfBehindArray } =
      this.squaresBehind;
    const restOfSquaresBehind = Object.values(restOfBehindArray).flat();

    // Return true if any square is a ship or a hit
    const isAnyClashing = this.prospectiveSquares.some(
      (square) =>
        restOfSquaresSurrounding.includes(square) ||
        restOfSquaresBehind.includes(square)
    );
    return isAnyClashing;
  }

  horizontal() {
    if (this.columnCoord + this.shipLength > 10) {
      return true;
    }

    const siblings = Array.from(
      Array.from(this.popupBoard.children)[this.rowCoord].children
    );
    this.prospectiveSquares = siblings.slice(
      this.columnCoord,
      this.columnCoord + this.shipLength
    );
    return this.isClashing();
  }

  vertical() {
    if (this.rowCoord + this.shipLength > 10) {
      return true;
    }

    const rows = Array.from(this.popupBoard.children).slice(
      this.rowCoord,
      this.rowCoord + this.shipLength
    );

    rows.forEach((row) => {
      const rowArray = Array.from(row.children);
      return rowArray.forEach((square) => {
        if (Number(square.getAttribute("data")) === this.columnCoord) {
          this.prospectiveSquares.push(square);
        }
      });
    });

    return this.isClashing();
  }
}

export { SurroundingSquares, ClashChecker };
