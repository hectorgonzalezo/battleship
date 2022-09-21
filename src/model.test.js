/* eslint no-undef: 0 */
import { Ship, Gameboard, Player, AIPlayer} from "./model";

test("Ship object returns false to sunk when created", () => {
  const newShip = Ship(3);
  expect(newShip.isSunk()).toBe(false);
});

test("Ship object outputs correct length", () => {
  const newShip = Ship(5);
  expect(newShip.getLength()).toBe(5);
});

test("Ship object capable of getting hit", () => {
  const newShip = Ship(5);

  // Can't hit out of bounds
  expect(newShip.getHit(-1)).toEqual([1, 1, 1, 1, 1]);

  expect(newShip.getHit(1)).toEqual([1, 0, 1, 1, 1]);
  expect(newShip.getHit(0)).toEqual([0, 0, 1, 1, 1]);

  // Can't hit twice
  expect(newShip.getHit(0)).toEqual([0, 0, 1, 1, 1]);
});

test("Ship object capable of being sunk", () => {
  const newShip = Ship(1);
  expect(newShip.isSunk()).toEqual(false);
  newShip.getHit(0);
  expect(newShip.isSunk()).toEqual(true);
});

test("Gameboard empty when created", () => {
  expect(Gameboard().getCurrentBoard()).toEqual([
    [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
  ]);
});

test("Gameboard updated when placing ship", () => {
  const newShip = Ship(5);
  const newGameboard = Gameboard();
  // place a ship horizontally
  newGameboard.placeShip(newShip, 0, 0, "horizontal");

  // All chosen squares should have a ship
  const placedShip = newGameboard.getCurrentBoard()[0].slice(0, 5);
  placedShip.forEach((square) => expect(square).toHaveProperty("ship"));
  // Rest of the row should not
  const restOfRow = newGameboard.getCurrentBoard()[0].slice(6);
  restOfRow.forEach((square) => expect(square).not.toHaveProperty("ship"));
  // Rest of board shouldn't either
  const restOfBoard = newGameboard.getCurrentBoard().slice(1);
  restOfBoard.forEach((row) => {
    row.forEach((square) => {
      expect(square).not.toHaveProperty("ship");
    });
  });

  // place a ship vertically
  newGameboard.placeShip(Ship(3), 2, 3, "vertical");

  const currentBoard = newGameboard.getCurrentBoard();

  // All chosen squares should have a ship
  const secondPlacedShip = [
    currentBoard[2][3],
    currentBoard[3][3],
    currentBoard[4][3],
  ];
  secondPlacedShip.forEach((square) => expect(square).toHaveProperty("ship"));
});

test("Gameboard not updated when ship is placed out of bounds", () => {
  const newGameboard = Gameboard();
  newGameboard.placeShip(Ship(5), 0, 0, "horizontal");
  newGameboard.placeShip(Ship(3), 2, 3, "vertical");

  const initialBoard = newGameboard.getCurrentBoard();

  // Don't update if ship is to big for available space horizontally
  newGameboard.placeShip(Ship(3), 2, 2, "horizontal");
  expect(newGameboard.getCurrentBoard()).toEqual(initialBoard);

  newGameboard.placeShip(Ship(3), 5, 6, "horizontal");
  // Don't update if ship is to big for available space vertically
  newGameboard.placeShip(Ship(5), 4, 7, "vertical");
  expect(newGameboard.getCurrentBoard()).toEqual(initialBoard);

  // Don't update if ship is to big for board bounds
  newGameboard.placeShip(Ship(3), 9, 2, "vertical");
  expect(newGameboard.getCurrentBoard()).toEqual(initialBoard);
});

test("Gameboard not updated when ship is with a typo on direction", () => {
  const newGameboard = Gameboard();

  const initialBoard = newGameboard.getCurrentBoard();

  // Don't update if ship is to big for available space horizontally
  newGameboard.placeShip(Ship(3), 2, 2, "horizon");
  expect(newGameboard.getCurrentBoard()).toEqual(initialBoard);
});

test("Gameboard receiveAttack hits a ship", () => {
  const firstShip = Ship(5);
  const secondShip = Ship(3);
  const newGameboard = Gameboard();
  // place a ship horizontally
  newGameboard.placeShip(firstShip, 1, 0, "horizontal");
  newGameboard.placeShip(secondShip, 4, 5, "vertical");

  // Attack on horizontal ship
  newGameboard.receiveAttack(1, 1);
  expect(firstShip.getSquares()).toEqual([1, 0, 1, 1, 1]);

  // Attack on vertical ship
  newGameboard.receiveAttack(4, 5);
  expect(secondShip.getSquares()).toEqual([0, 1, 1]);
});

test("Ship sinks if hit via gameboard", () => {
  const newShip = Ship(1);
  const newGameboard = Gameboard();
  newGameboard.placeShip(newShip, 8, 8);

  expect(newShip.isSunk()).toEqual(false);
  // Attack on horizontal ship
  newGameboard.receiveAttack(8, 8);
  expect(newShip.isSunk()).toEqual(true);
});
test("Gameboard keeps track of missed hits", () => {
  const newGameboard = Gameboard();
  // place a ship horizontally
  newGameboard.placeShip(Ship(5), 1, 0, "horizontal");

  // Attack im empty square
  newGameboard.receiveAttack(8, 8);
  const currentBoard = newGameboard.getCurrentBoard();
  // square turns into {hit : true    }
  expect(currentBoard[8][8].hit).toBe(true);

  // Surrounding squares don't contain a hit property
  expect(currentBoard[9][8].hit).toBe(undefined);
  expect(currentBoard[8][9].hit).toBe(undefined);
  expect(currentBoard[8][7].hit).toBe(undefined);
  expect(currentBoard[7][8].hit).toBe(undefined);
});


test("Gameboard reports if all ships are sunk", () => {
    const newGameboard = Gameboard();
    newGameboard.placeShip(Ship(1), 8, 8);
    newGameboard.placeShip(Ship(1), 0, 1);

    // At least one ship is still floating
    expect(newGameboard.areAllShipsSunk()).toBe(false)
    
    newGameboard.receiveAttack(8, 8)

    expect(newGameboard.receiveAttack(0, 1)).toBe('Ships were just sunk')

    // All ships are sunk
    expect(newGameboard.areAllShipsSunk()).toBe(true)

  });

test("Gameboard can't add more hits if all ships are sunk", () => {
  const newGameboard = Gameboard();
  newGameboard.placeShip(Ship(1), 6, 5);

  newGameboard.receiveAttack(6, 5)

  // Deep copy current board
  const currentBoard = JSON.parse(JSON.stringify(newGameboard.getCurrentBoard()))

  expect(newGameboard.receiveAttack(3, 3)).toBe("Ships already sunk");
  const newBoard = JSON.parse(JSON.stringify(newGameboard.getCurrentBoard()))
  expect(newBoard).toEqual(currentBoard)
});

test("Gameboard can't hit twice in the same spot", () => {
    const newGameboard = Gameboard();
    newGameboard.placeShip(Ship(3), 6, 5);
  
    // Hit ship square
    newGameboard.receiveAttack(6, 5);
    // Hit empty square
    newGameboard.receiveAttack(0, 1);
  
    const currentBoard = JSON.parse(JSON.stringify(newGameboard.getCurrentBoard()))

  expect(newGameboard.receiveAttack(6, 5)).toBe("Cant hit the same spot twice");
  expect(newGameboard.receiveAttack(0, 1)).toBe("Cant hit the same spot twice");
  const newBoard = JSON.parse(JSON.stringify(newGameboard.getCurrentBoard()))
  expect(newBoard).toEqual(currentBoard)

  });


test('Player.playTurn can update Gameboard', () => {
    
    const newGameboard = Gameboard();
    const newPlayer = Player(newGameboard, 1);
    newGameboard.placeShip(Ship(2), 0, 1)
    newPlayer.playTurn(8, 1);

    // Updates empty squares
    expect(newGameboard.getCurrentBoard()[8][1].hit).toBe(true)

    // Updates ship squares
    expect(newPlayer.playTurn(0, 2).shipSquare).toBe(1)
    expect(newGameboard.getCurrentBoard()[0][2].ship.getSquares()).toEqual([1, 0])
})


test('AIPlayer.playRandom can update Gameboard', () => {
    
    const newGameboard = Gameboard();
    newGameboard.placeShip(Ship(10), 0, 0)
    newGameboard.placeShip(Ship(9), 1, 1, 'vertical')
    const newAIPlayer = AIPlayer(newGameboard, 1);
    const previousBoard = JSON.parse(JSON.stringify(newGameboard.getCurrentBoard()))
    newAIPlayer.playRandom();

    const updatedBoard = JSON.parse(JSON.stringify(newGameboard.getCurrentBoard()))
    expect(updatedBoard).not.toEqual(previousBoard)
})