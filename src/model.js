const Ship = function(length){
    // Array full with ones, 
    const shipSquares = new Array(length).fill(1)
    let sunk = false;

    const isSunk = function (){
        sunk = shipSquares.every(hit => hit === 0);
        return sunk
    }

    const getLength = function(){
        return length
    }

    const getHit = function(index){
        // Only if index is not out of bounds
        if(index >= length || index < 0){
            return shipSquares
        }
        shipSquares[index] = 0;
        // if every square is hit, sunk returns true
        return shipSquares
    }

    return { isSunk, getLength, getHit}
}


const Gameboard = function(){
    // board is a 10x10 2d array of zeros
    const board = Array(10).fill().map(() => Array(10).fill(0));
    // Keeps track of which ship is where.
    const positionGraph = new Array(10).fill(new Array(10)) 

    const getCurrentBoard = function(){
        return board
    }

    const isPlaceable = function(length, rowCoord, columnCoord, direction){
        let subArray
        if(direction === 'horizontal'){
            // get row
            subArray = board[rowCoord].slice(columnCoord, columnCoord+length);
        } else {
            // get only relevant rows
            subArray = board.filter((row, i) => i >= rowCoord && i < rowCoord + length )
            // get only relevant columns
            subArray = subArray.map(row => row.filter((column, i) => i === columnCoord))
            subArray = subArray.flat()
        }
        const isAnyOccupied = subArray.some(square => square === 1);
        const isOutOfBounds = subArray.length !== length;
        return isAnyOccupied || isOutOfBounds
    }

    const placeShip = function(ship, rowCoord, columnCoord, direction){
        const length = ship.getLength()
        // Change board only if space is not occupied or it doesn't go out of bounds
        if(!isPlaceable(length, rowCoord, columnCoord, direction)){
            if(direction === 'horizontal'){
            
                for(let i=0; i < length; i++){
                    board[rowCoord][i + columnCoord] = 1
                }
            } else {// if direction is vertical
                for(let i=0; i < length; i++){
                    board[rowCoord + i][columnCoord] = 1
                } 
            }
        }
    }


    return { getCurrentBoard, placeShip}
}


export { Ship, Gameboard };