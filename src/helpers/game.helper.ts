import { vertical__tiles, horizontal__tiles, GameBoard} from '../config/game.config.js'

export const validatePosition = (position: string) => {
    try {
        const firstLetter : string = position[0];
        const secondLetter : string = position[1];

        if(!horizontal__tiles.includes(firstLetter) || !vertical__tiles.includes(secondLetter)) {
            return false;
        }
        return true;
    } catch(e) {
        return false;
    }
}

export const findCross = ({
        position, 
        streightOrForward = false, 
        leftOrRight = false, 
        steps = 1
    } : {
        position: string,
        streightOrForward?: boolean,
        leftOrRight?: boolean,
        steps?: number
    }) : string | null => {
    if (!validatePosition(position)) throw new Error(`position is not valid : ${position}`);
    const firstLetter : string = position[0];
    const secondLetter : string = position[1];

    const asciiValueOfFirst = firstLetter.charCodeAt(0);
    const numberValueOfSecond = parseInt(secondLetter);

    if(leftOrRight) {
        if (!streightOrForward) {
            if(!vertical__tiles.includes((numberValueOfSecond + steps).toString()) || !horizontal__tiles.includes(String.fromCharCode(asciiValueOfFirst - steps))) {
                return null
            } else {
                return String.fromCharCode(asciiValueOfFirst - steps) + (numberValueOfSecond + steps).toString()
            }
        }
        else {
            if(!vertical__tiles.includes((numberValueOfSecond - steps).toString()) || !horizontal__tiles.includes(String.fromCharCode(asciiValueOfFirst - steps))) {
                return null
            } else {
                return String.fromCharCode(asciiValueOfFirst - steps) + (numberValueOfSecond - steps).toString()
            }
        }
    } else {
        if (!streightOrForward) {
            if(!vertical__tiles.includes((numberValueOfSecond + steps).toString()) || !horizontal__tiles.includes(String.fromCharCode(asciiValueOfFirst + steps))) {
                return null
            } else {
                return String.fromCharCode(asciiValueOfFirst + steps) + (numberValueOfSecond + steps).toString()
            }
        }
        else {
            if(!vertical__tiles.includes((numberValueOfSecond - steps).toString()) || !horizontal__tiles.includes(String.fromCharCode(asciiValueOfFirst + steps))) {
                return null
            } else {
                return String.fromCharCode(asciiValueOfFirst + steps) + (numberValueOfSecond - steps).toString()
            }
        }
    }
}

export const createGameBoard = () : GameBoard => {
    var board = {};
    var player1 = {};
    var player2 = {};

    vertical__tiles.forEach((v, v_index) => {
        let black = v_index%2 == 0 ? true : false;
        horizontal__tiles.forEach((h, h_index) => {
            board[h + v] = black ? "#FF6E31" : "#F0997D";

            if( v_index >= vertical__tiles.length - 3 ) {
                if(!black) { player1[h + v] = "normal"; }
            } else if( v_index <= 2 ) {
                if(!black) { player2[h + v] = "normal"; }
            }

            black = !black;
        })
    })

    return {
        board,
        player1,
        player2
    }
}

export const addMinutes = (date: Date, minutes: number) : Date => {
    return new Date(date.getTime() + minutes*60000);
}