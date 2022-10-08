/**
 * @jest-environment jsdom
 */
/* eslint no-undef: 0 */
import { Player, AIPlayer } from "./players";
import Gameboard from "./gameboard";
import Ship from "./ship";

describe("Player functionality", () => {
  test("Player.playTurn can update Gameboard", () => {
    const newGameboard = Gameboard();
    const newPlayer = Player(newGameboard, 1);
    newGameboard.placeShip(Ship(2), 0, 1);
    newPlayer.playTurn(8, 1);

    // Updates empty squares
    expect(newGameboard.getCurrentBoard()[8][1].hit).toBe(true);

    // Updates ship squares
    expect(newPlayer.playTurn(0, 2).shipSquare).toBe(1);
    expect(newGameboard.getCurrentBoard()[0][2].ship.getSquares()).toEqual([
      1, 0,
    ]);
  });

  test("AIPlayer.playRandom can update Gameboard", () => {
    const newGameboard = Gameboard();
    newGameboard.placeShip(Ship(1), 1, 1, "vertical");
    const newAIPlayer = AIPlayer(newGameboard, 1);
    const previousBoard = JSON.parse(
      JSON.stringify(newGameboard.getCurrentBoard())
    );
    newAIPlayer.playRandom();

    const updatedBoard = JSON.parse(
      JSON.stringify(newGameboard.getCurrentBoard())
    );
    expect(updatedBoard).not.toEqual(previousBoard);
  });

  test("AIPlayer.playAround doesn't get stuck on corners", () =>{
    const newGameboard = Gameboard();
    const newShip = Ship(3);
    newGameboard.placeShip(newShip, 0, 7); 
    const newAIPlayer = AIPlayer(newGameboard, 1);
    newAIPlayer.playTurn(0, 7);
    newAIPlayer.playTurn(0, 8);

    expect(newShip.isSunk()).toBe(false);
  })
});
