/**
 * @jest-environment jsdom
 */
/* eslint no-undef: 0 */

import Gameboard from './gameBoard';
import { Player, AIPlayer } from './players';
import Ship from './ship';


describe("Gameboard funcionality", () => {
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

    const initialBoard = JSON.parse(
      JSON.stringify(newGameboard.getCurrentBoard())
    );

    // Don't update if ship is to big for available space horizontally
    newGameboard.placeShip(Ship(4), 2, 1, "horizontal");
    let newBoard = JSON.parse(JSON.stringify(newGameboard.getCurrentBoard()));
    expect(newBoard).toEqual(initialBoard);

    newGameboard.placeShip(Ship(3), 5, 6, "horizontal");
    const previousBoard = JSON.parse(
      JSON.stringify(newGameboard.getCurrentBoard())
    );
    // Don't update if ship is to big for available space vertically
    newGameboard.placeShip(Ship(5), 4, 7, "vertical");
    newBoard = JSON.parse(JSON.stringify(newGameboard.getCurrentBoard()));

    expect(newBoard).toEqual(previousBoard);

    // Don't update if ship is to big for board bounds
    newGameboard.placeShip(Ship(3), 9, 2, "vertical");
    newBoard = JSON.parse(JSON.stringify(newGameboard.getCurrentBoard()));
    expect(newBoard).toEqual(previousBoard);
  });

  test("Gameboard not updated when ship is placed right beside another", () => {
    const newGameboard = Gameboard();
    newGameboard.placeShip(Ship(1), 0, 0, "horizontal");
    newGameboard.placeShip(Ship(1), 2, 0, "vertical");

    const initialBoard = JSON.parse(
      JSON.stringify(newGameboard.getCurrentBoard())
    );

    newGameboard.placeShip(Ship(3), 3, 1, "vertical");

    const newBoard = JSON.parse(JSON.stringify(newGameboard.getCurrentBoard()));
    expect(newBoard).toEqual(initialBoard);
  });

  test("Gameboard not updated when ship is placed right on top of another", () => {
    const newGameboard = Gameboard();
    newGameboard.placeShip(Ship(3), 7, 0, "vertical");
    const previousBoard = JSON.parse(
      JSON.stringify(newGameboard.getCurrentBoard())
    );

    newGameboard.placeShip(Ship(2), 9, 0, "horizontal");
    const laterBoard = JSON.parse(
      JSON.stringify(newGameboard.getCurrentBoard())
    );
    expect(laterBoard).toEqual(previousBoard);
  });

  test("Gameboard not updated when ship is with a typo on direction", () => {
    const newGameboard = Gameboard();

    const initialBoard = JSON.parse(
      JSON.stringify(newGameboard.getCurrentBoard())
    );

    // Don't update if ship is to big for available space horizontally
    newGameboard.placeShip(Ship(3), 2, 2, "horizon");
    const newBoard = JSON.parse(JSON.stringify(newGameboard.getCurrentBoard()));

    expect(newBoard).toEqual(initialBoard);
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
    expect(newGameboard.areAllShipsSunk()).toBe(false);

    newGameboard.receiveAttack(8, 8);

    expect(newGameboard.receiveAttack(0, 1)).toBe("Ships were just sunk");

    // All ships are sunk
    expect(newGameboard.areAllShipsSunk()).toBe(true);
  });

  test("Gameboard can't add more hits if all ships are sunk", () => {
    const newGameboard = Gameboard();
    newGameboard.placeShip(Ship(1), 6, 5);

    newGameboard.receiveAttack(6, 5);

    // Deep copy current board
    const currentBoard = JSON.parse(
      JSON.stringify(newGameboard.getCurrentBoard())
    );

    expect(newGameboard.receiveAttack(3, 3)).toBe("Ships already sunk");
    const newBoard = JSON.parse(JSON.stringify(newGameboard.getCurrentBoard()));
    expect(newBoard).toEqual(currentBoard);
  });

  test("Gameboard can't hit twice in the same spot", () => {
    const newGameboard = Gameboard();
    newGameboard.placeShip(Ship(3), 6, 5);

    // Hit ship square
    newGameboard.receiveAttack(6, 5);
    // Hit empty square
    newGameboard.receiveAttack(0, 1);

    const currentBoard = JSON.parse(
      JSON.stringify(newGameboard.getCurrentBoard())
    );

    expect(newGameboard.receiveAttack(6, 5)).toBe(
      "Cant hit the same spot twice"
    );
    expect(newGameboard.receiveAttack(0, 1)).toBe(
      "Cant hit the same spot twice"
    );
    const newBoard = JSON.parse(JSON.stringify(newGameboard.getCurrentBoard()));
    expect(newBoard).toEqual(currentBoard);
  });

  test("Gameboard hits surrounding squares if horizontal ship is sunk", () => {
    const newGameboard = Gameboard();
    const newShip = Ship(1);
    newGameboard.placeShip(newShip, 5, 5);
    Player(newGameboard, 1).playTurn(5, 5);

    const updatedBoard = newGameboard.getCurrentBoard();

    expect(updatedBoard[5][5].ship.isSunk()).toBe(true);

    // Surrounding squares should be hit after ship is sunk
    expect(updatedBoard[4][5].hit).toBe(true);
    expect(updatedBoard[6][5].hit).toBe(true);
    expect(updatedBoard[5][4].hit).toBe(true);
    expect(updatedBoard[5][6].hit).toBe(true);
    expect(updatedBoard[4][4].hit).toBe(true);
    expect(updatedBoard[6][6].hit).toBe(true);
    expect(updatedBoard[6][4].hit).toBe(true);
    expect(updatedBoard[4][6].hit).toBe(true);
    // out of bounds should be undefined
    expect(updatedBoard[4][7].hit).toBe(undefined);
  });

  test("Gameboard hits surrounding squares if vertical ship is sunk", () => {
    const newGameboard = Gameboard();
    const newShip = Ship(3);
    newGameboard.placeShip(newShip, 5, 5, "vertical");
    Player(newGameboard, 1).playTurn(5, 5);
    Player(newGameboard, 1).playTurn(6, 5);
    Player(newGameboard, 1).playTurn(7, 5);

    const updatedBoard = newGameboard.getCurrentBoard();

    expect(updatedBoard[5][5].ship.isSunk()).toBe(true);

    // Surrounding squares should be hit after ship is sunk
    expect(updatedBoard[4][4].hit).toBe(true);
    expect(updatedBoard[4][5].hit).toBe(true);
    expect(updatedBoard[4][6].hit).toBe(true);
    expect(updatedBoard[5][4].hit).toBe(true);
    expect(updatedBoard[5][6].hit).toBe(true);
    expect(updatedBoard[6][6].hit).toBe(true);
    expect(updatedBoard[6][4].hit).toBe(true);
    expect(updatedBoard[7][4].hit).toBe(true);
    expect(updatedBoard[7][6].hit).toBe(true);
    expect(updatedBoard[8][4].hit).toBe(true);
    expect(updatedBoard[8][5].hit).toBe(true);
    expect(updatedBoard[8][6].hit).toBe(true);

    // surrounding squares should be undefinded
    expect(updatedBoard[4][3].hit).toBe(undefined);
    expect(updatedBoard[4][7].hit).toBe(undefined);
    expect(updatedBoard[5][3].hit).toBe(undefined);
    expect(updatedBoard[3][3].hit).toBe(undefined);
    expect(updatedBoard[3][4].hit).toBe(undefined);
    expect(updatedBoard[8][8].hit).toBe(undefined);
  });

  test("Gameboard successfully populated with random ships", async () => {
    const newGameboard = Gameboard();
    const currentBoard = JSON.parse(
      JSON.stringify(newGameboard.getCurrentBoard())
    );

    newGameboard
      .placeRandomShips(6)
      .then((ships) => expect(ships.length).toBe(6));

    const newBoard = JSON.parse(JSON.stringify(newGameboard.getCurrentBoard()));
    expect(newBoard).not.toEqual(currentBoard);
  });
});

