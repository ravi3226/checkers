import mongoose from "mongoose";
import { Server, Socket } from "socket.io";
import { TokenStatus } from "../config/user.config.js";
import { addMinutes, createGameBoard } from "../helpers/game.helper.js";
import { validateAuthToken } from "../middlewares/user.middleware.js";
import { Game } from "../models/game.model.js";
import { Player } from "../models/player.model.js";
import { redisClient } from "../services/redis.service.js";

export const createGameWithBot = (io: Server, socket: Socket, payload: any) : void => {

    /**
     * validate is this new game creation happening by authorized user or not.
     */
    validateAuthToken(payload.token).then((tokenValidate: TokenStatus) : void => {
        if ( !tokenValidate.validate ) {
            socket.emit('token:refresh:fail', {
                token: [tokenValidate.message]
            })
            socket.emit('game:create-bot:fail', {
                token: [tokenValidate.message]
            })
        } else {
            // FIXME: aggregration
            Player.aggregate([
                {
                    $match: { userId: new mongoose.Types.ObjectId(tokenValidate.id) }
                },
                {
                    $lookup: {
                        from: 'games',
                        localField: '_id',
                        foreignField: 'player1',
                        as: 'game'
                    }
                }
            ]).then(game => {
                console.log(game)
            }).catch(e => {
                console.log(e.message);
            })
            // /**
            //  * create board with new positions
            //  */
            // const newGameBoard = createGameBoard();

            // /**
            //  * create real player 
            //  */
            // Player.create({
            //     userId: tokenValidate.id,
            //     normal_positions: Object.keys(newGameBoard.player1),
            //     king_positions: [],
            //     killed: [],
            //     lose: [],
            //     realOrNot: true
            // }).then(player => {

            //     /**
            //      * create bot player
            //      * there will be no 'userId', because its a bot
            //      * no need specify 'realOrNot', because it will be false by default, meaning its a bot
            //      */
            //     Player.create({
            //         normal_positions: Object.keys(newGameBoard.player2),
            //         king_positions: [],
            //         killed: [],
            //         lose: [],
            //         oponent: player.id
            //     }).then((botPlayer) => {

            //         /**
            //          * set the real player 'openent' to bot player id
            //          */
            //         Player.findByIdAndUpdate(player.id, { oponent: botPlayer.id }, { new: true }).then((player) => {

            //             /**
            //              * register new game with both player
            //              * it'll expired in 10 minutes
            //              */
            //             const ten_minutes : Date = addMinutes(new Date, 10);

            //             Game.create({
            //                 player1: player.id,
            //                 player2: botPlayer.id,
            //                 expiresAt: ten_minutes
            //             }).then((newGame) => {

            //                 redisClient.set(newGame.id, JSON.stringify({
            //                     board: newGameBoard.board,
            //                     realPlayer: newGameBoard.player1,
            //                     botPlayer: newGameBoard.player2
            //                 })).then(() => {
            //                     socket.emit('game:create-bot:success', {
            //                         board: newGameBoard.board,
            //                         realPlayer: newGameBoard.player1,
            //                         botPlayer: newGameBoard.player2
            //                     })
            //                 }).catch((e: Error) => {
            //                     socket.emit('game:create-bot:fail', {
            //                         general: [`failed creation game on redis server ${e.message}`]
            //                     })
            //                 })

            //             }).catch((e: Error) => {
            //                 socket.emit('game:create-bot:fail', {
            //                     general: [`failed game creation ${e.message}`]
            //                 })
            //             })

            //         }).catch((e: Error) => {
            //             socket.emit('game:create-bot:fail', {
            //                 general: [` failed updation real player oponent ${e.message}`]
            //             })
            //         })

            //     }).catch((e: Error) => {
            //         socket.emit('game:create-bot:fail', {
            //             general: [`failed bot create ${e.message}`]
            //         })
            //     })

            // }).catch((e: Error) => {
            //     socket.emit('game:create-bot:fail', {
            //         general: [`failed real player create ${e.message}`]
            //     })
            // })

        }

    }).catch((e: Error) => {
        socket.emit('game:create-bot:fail', {
            general: [`failed token validation ${e.message}`]
        })
    })
}