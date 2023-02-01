import mongoose from "mongoose";
import { BotGameTurn } from "../config/redis.config.js";
import { addMinutes, createGameBoard } from "../helpers/game.helper.js";
import { validateAuthToken } from "../middlewares/user.middleware.js";
import { Game } from "../models/game.model.js";
import { Player } from "../models/player.model.js";
import { redisGetKeyValue, redisSetKeyValue } from "../services/redis.service.js";
export const createGameWithBot = async (io, socket, payload) => {
    /**
     * validate is this new game creation happening by authorized user or not.
     */
    try {
        const isValidToken = await validateAuthToken(payload.token);
        if (!isValidToken.validate) {
            socket.emit('token:refresh:fail', {
                token: [isValidToken.message]
            });
            socket.emit('game:create-bot:fail', {
                token: [isValidToken.message]
            });
        }
        else {
            /**
             * get user's last game if there is any played
             */
            try {
                const lastGame = await findUserGame(new mongoose.Types.ObjectId(isValidToken.id));
                const isValidGame = lastGame.found ? new Date(lastGame.game[0]?.game[0]?.expiresAt) > new Date() ? true : false : false;
                if (isValidGame) {
                    try {
                        const existingGame = await redisGetKeyValue(lastGame.game['_id'].toString(), true);
                        if (existingGame.success) {
                            socket.emit('game:create-bot:success', {
                                game: existingGame.value
                            });
                        }
                        else {
                            socket.emit('game:create:fail', {
                                general: [`failed getting existing game`]
                            });
                        }
                    }
                    catch (e) {
                        socket.emit('game:create-bot:fail', {
                            general: [`failed getting existing game: ${e.message}`]
                        });
                    }
                }
                else {
                    try {
                        /**
                         * create real player and bot player
                         */
                        const playersPair = await makePlayerPairWithBot(new mongoose.Types.ObjectId(isValidToken.id));
                        if (playersPair.success) {
                            /**
                             * register new game within real player and bot player reference
                             */
                            try {
                                const newGame = await registerGameWithBot(new mongoose.Types.ObjectId(playersPair.realPlayer['_id']), new mongoose.Types.ObjectId(playersPair.botPlayer['_id']));
                                if (newGame.success) {
                                    /**
                                     * store game on redis server to make updation faster
                                     */
                                    try {
                                        const gameOnRedis = await redisSetKeyValue(newGame.game['id'], JSON.stringify({
                                            realPlayer: playersPair.newGameBoard['realPlayer'],
                                            botPlayer: playersPair.newGameBoard['botPlayer'],
                                            board: playersPair.newGameBoard['board']
                                        }));
                                        if (gameOnRedis.success) {
                                            socket.emit('game:create-bot:success', {
                                                realPlayer: playersPair.newGameBoard['player1'],
                                                botPlayer: playersPair.newGameBoard['player2'],
                                                board: playersPair.newGameBoard['board']
                                            });
                                            const playerTurn = await redisSetKeyValue(`${BotGameTurn}-${newGame.game['id']}`, 1);
                                            try {
                                                if (playerTurn.success) {
                                                    socket.emit('player:turn', {
                                                        realPlayer: playersPair.newGameBoard['player1'],
                                                        botPlayer: playersPair.newGameBoard['player2'],
                                                        board: playersPair.newGameBoard['board']
                                                    });
                                                }
                                                else {
                                                    socket.emit('game:create-bot:fail', {
                                                        general: [`failed storing game on redis server : ${playerTurn.message}`]
                                                    });
                                                }
                                            }
                                            catch (e) {
                                                socket.emit('game:create-bot:fail', {
                                                    general: [`failed storing game on redis server : ${e.message}`]
                                                });
                                            }
                                        }
                                        else {
                                            socket.emit('game:create-bot:fail', {
                                                general: [`failed storing newly created game on redis server : ${gameOnRedis.message}`]
                                            });
                                        }
                                    }
                                    catch (e) {
                                        socket.emit('game:create-bot:fail', {
                                            general: [`failed updating data on redis : ${e.message}`]
                                        });
                                    }
                                }
                                else {
                                    socket.emit('game:create-bot:fail', {
                                        general: [newGame.message]
                                    });
                                }
                            }
                            catch (e) {
                                socket.emit('game:create-bot:fail', {
                                    general: [e.message]
                                });
                            }
                        }
                        else {
                            socket.emit('game:create-bot:fail', {
                                general: [playersPair.message]
                            });
                        }
                    }
                    catch (e) {
                        socket.emit('game:create-bot:fail', {
                            general: [`failed creating pair of bot and new player : ${e.message}`]
                        });
                    }
                }
            }
            catch (e) {
                socket.emit('game:create-bot:fail', {
                    general: [`failed getting user last game: ${e.message}`]
                });
            }
        }
    }
    catch (e) {
        socket.emit('game:create:fail', {
            general: [`failed validating token : ${e.message}`]
        });
    }
};
export const findUserGame = async (userId, numberOfGame = 1, decOrAsc = false) => {
    return new Promise((resolve, reject) => {
        Player.aggregate([
            {
                $match: { userId: userId }
            },
            {
                $lookup: {
                    from: 'games',
                    localField: '_id',
                    foreignField: 'player1',
                    as: 'game'
                }
            }
        ]).sort({ createdAt: decOrAsc ? 1 : -1 }).limit(numberOfGame).then(game => {
            if (game.length > 0) {
                resolve({
                    found: true,
                    game: game
                });
            }
            else {
                resolve({
                    found: false
                });
            }
        }).catch(e => {
            reject({
                found: false
            });
        });
    });
};
export const makePlayerPairWithBot = async (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newGameBoard = createGameBoard();
            const botPlayer = await Player.create({
                userId: userId,
                normal_positions: Object.keys(newGameBoard.player2),
                kings_positions: [],
                killed: [],
                lose: [],
                realOrNot: false
            });
            if (botPlayer) {
                const realPlayer = await Player.create({
                    userId: userId,
                    normal_positions: Object.keys(newGameBoard.player1),
                    king_positions: [],
                    killed: [],
                    lose: [],
                    realOrNot: true
                });
                if (realPlayer) {
                    resolve({
                        success: true,
                        realPlayer: realPlayer,
                        botPlayer: botPlayer,
                        newGameBoard: newGameBoard
                    });
                }
                else {
                    reject({
                        success: false,
                        message: `failed creating real player :: makePlayerPairWithBot()`
                    });
                }
            }
            else {
                reject({
                    success: false,
                    message: `failed creating bot player :: makePlayerPairWithBot()`
                });
            }
        }
        catch (e) {
            reject({
                success: false,
                message: e.message
            });
        }
    });
};
export const registerGameWithBot = async (realPlayerId, botPlayerId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newGame = await Game.create({
                player1: realPlayerId,
                player2: botPlayerId,
                expiresAt: addMinutes(new Date(), 10)
            });
            if (newGame) {
                resolve({
                    success: true,
                    game: newGame
                });
            }
            else {
                reject({
                    success: false,
                    message: `failed registering new game :: registerGameWithBot()`
                });
            }
        }
        catch (e) {
            reject({
                success: false,
                message: `failed registering new game :: ${e.message}`
            });
        }
    });
};
//# sourceMappingURL=game.controller.js.map