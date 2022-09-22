import PubSub from "pubsub-js";

const player1DivBoard = document.querySelector("#player1-board");
const player2DivBoard = document.querySelector("#player2-board");
const infoDisplay = document.querySelector('header > div');

function createNewBoardElement(board, enemy =false) {
    const fakeBoard = Array(10)
    .fill()
    .map(() => [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);
  // RenderSquares
  fakeBoard.forEach((row, i) => {
    // create row
    const newRow = document.createElement("div");
    newRow.classList.add("row");
    newRow.setAttribute("data", i);
    board.append(newRow);
    row.forEach((square, j) => {
      // create squares
      const newSquare = document.createElement("div");
      newSquare.classList.add("square");
      if(enemy){
        newSquare.classList.add("enemy")
      }
      newSquare.setAttribute("data", j);
      newRow.append(newSquare);
    });
  });
}

async function renderShips(board){
    const currentBoard = board.getCurrentBoard();
    const div = board.getDiv();
    currentBoard.forEach((row, i) => {
        row.forEach((square, j) => {
            // if theres a ship in square, add class to it
            if(square.ship !== undefined){
                // Access corresponding square in DivBoard and change its color
                const shipSquare = div.children[i].children[j];
                shipSquare.classList.add('ship-square')
            } 
        });
      });
}

function removePreviousHit(){
    const previousHit = document.querySelector('.hit.just-hit');
    if(previousHit !== null){
    previousHit.classList.remove('just-hit')
    }
}

function updateBoardAt(board, rowCoord, columnCoord){
    const currentBoard = board.getCurrentBoard();
    const div = board.getDiv();
                // Access corresponding square in DivBoard and change its color
                const shipSquare = div.children[rowCoord].children[columnCoord];
                shipSquare.classList.add('hit')
                // remove just-hit from previous div. This allows the page to
                // highligh only the latest hit
                removePreviousHit();
                shipSquare.classList.add('just-hit');
}

function updateDisplay(string){
    infoDisplay.innerText = string;
}


async function renderRandomShips(player1Board, player2Board){
  await renderShips(player1Board);
  await renderShips(player2Board);
  PubSub.publish('enemy-loaded');
}

function startBoards(player1Board, player2Board) {
  createNewBoardElement(player1DivBoard);
  // Adds a special class for enemies, so that you can point and shoot.
  createNewBoardElement(player2DivBoard, true);
  renderRandomShips(player1Board, player2Board)
}


const view = { startBoards, renderShips, updateBoardAt, updateDisplay};

export default view
