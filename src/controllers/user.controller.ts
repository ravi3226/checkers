import { NewUserError } from "../config/user.config.js"
import { validateNewUser } from "../middlewares/user.middleware.js"
import { Server, Socket } from 'socket.io'


export const registerUser = (io: Server, socket: Socket, payload: any) : void => {
    /**
     * @params payload: { email, password, confirmPassword }
     * @returns not validated { errors -> object }
     * @returns validated { true -> boolean
     * validate user
     */
    const errors : NewUserError | boolean = validateNewUser(payload);

    if ( typeof errors !== "boolean" ) {
        socket.emit('user:register:fail', errors);
    } else {
        socket.emit('user:register:success', payload);
    }
}