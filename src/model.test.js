import { Ship } from './model'

test('Ship object returns false to sunk when created', () => {
    const newShip = Ship(3);
    expect(newShip.isSunk()).toBe(false)
})


test('Ship object outputs correct length', () => {
    const newShip = Ship(5);
    expect(newShip.getLength()).toBe(5)
})


test('Ship object capable of getting hit', () => {
    const newShip = Ship(5);
    
    // Can't hit out of bounds
    expect(newShip.getHit(-1)).toEqual([1, 1, 1, 1, 1])

    expect(newShip.getHit(1)).toEqual([1, 0, 1, 1, 1])
    expect(newShip.getHit(0)).toEqual([0, 0, 1, 1, 1])

    // Can't hit twice
    expect(newShip.getHit(0)).toEqual([0, 0, 1, 1, 1])
    
})


test('Ship object capable of being sunk', () => {
    const newShip = Ship(1);
    expect(newShip.isSunk()).toEqual(false)
    newShip.getHit(0);
    expect(newShip.isSunk()).toEqual(true)
    
})

