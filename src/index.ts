import { createServer, Server as HttpServer } from 'http'
import express from 'express'
import { Server, Socket } from 'socket.io'
import { serverConfig } from './config/server.config.js';
import { PrintMessage } from './helpers/utils.helper.js';
import { connectToDatabase } from './services/database.service.js';
import { registerUser } from './controllers/user.controller.js';

connectToDatabase().then(() => {
    const app = express()
    const httpServer: HttpServer = createServer(app);
    const io: Server = new Server(httpServer);

    io.on('connection', (socket: Socket) => {
        PrintMessage(`new socket connection : ${socket.id}`);
        socket.on('user:register', (payload) => registerUser(io, socket, payload))
    })


    httpServer.listen(serverConfig.port, () => {
        PrintMessage(`Server is running on port : ${serverConfig.port}`);
    });
}).catch((e: Error) => {
    PrintMessage(e.message);
})