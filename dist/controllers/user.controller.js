import { validateNewUser } from "../middlewares/user.middleware.js";
export const registerUser = (io, socket, payload) => {
    const isValid = validateNewUser(payload);
    console.log(typeof isValid);
    console.log(isValid);
};
//# sourceMappingURL=user.controller.js.map