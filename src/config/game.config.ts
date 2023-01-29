export const horizontal__tiles = ["A", "B", "C", "D", "E", "F", "G", "H"]
export const vertical__tiles = ["8", "7", "6", "5", "4", "3", "2", "1"]

export interface PlayerPositionError {
    from: string[],
    to: string[]
}

export interface GameBoard {
    board: object,
    player1: object,
    player2: object
}