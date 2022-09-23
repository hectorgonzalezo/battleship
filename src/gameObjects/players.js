import hitChecker from './hitChecker';
import getRandomNumber from './getRandomNumber';

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

export { Player, AIPlayer };

