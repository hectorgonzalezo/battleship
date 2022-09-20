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


export { Ship };