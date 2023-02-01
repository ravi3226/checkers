import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { serverConfig } from './config/server.config.js';
import { PrintMessage } from './helpers/utils.helper.js';
import { connectToDatabase } from './services/database.service.js';
import { loginUser, refreshToken, registerUser } from './controllers/user.controller.js';
import { createGameWithBot } from './controllers/game.controller.js';
import { connectToRedis } from './services/redis.service.js';
connectToRedis().then(() => {
    connectToDatabase().then(() => {
        const app = express();
        const httpServer = createServer(app);
        const io = new Server(httpServer, {
            cors: {
                origin: "http://localhost:3000"
            }
        });
        io.on('connection', async (socket) => {
            PrintMessage(`new socket connection : ${socket.id}`);
            socket.on('user:register', (payload) => registerUser(io, socket, payload));
            socket.on('user:login', (payload) => loginUser(io, socket, payload));
            socket.on('token:refresh', (payload) => refreshToken(io, socket, payload));
            socket.on('game:create-bot', async (payload) => await createGameWithBot(io, socket, payload));
        });
        httpServer.listen(serverConfig.port, () => {
            PrintMessage(`Server is running on port : ${serverConfig.port}`);
        });
    }).catch((e) => {
        PrintMessage(e.message);
    });
}).catch((e) => {
    PrintMessage(e.message);
});
//# sourceMappingURL=index.js.map