import { NewUserSchema, NewUserError } from "../config/user.config.js";
import { validateEmail } from "../helpers/utils.helper.js";

export const validateNewUser = (user: NewUserSchema) : NewUserError | boolean => {
    const email = user.email ? user.email.trim() : user.email;
    const password = user.password ? user.password.trim() : user.password;
    const confirmPassword = user.confirmPassword ? user.confirmPassword.trim() : user.confirmPassword;

    const errors: NewUserError = {
        email: [],
        password: [],
        confirmPassword: []
    }

    if ( !email || email === "" ) errors.email.push("Email is required")
    if ( !password || password === "" ) errors.password.push("Password is required")


    if ( password && password.length < 6 ) errors.password.push("Password need minimum 6 character")
    if ( password && password.length > 14 ) errors.password.push("Password can't be more than 14 character")


    if ( !confirmPassword || confirmPassword === "" ) errors.confirmPassword.push("Confirm password is required")
    if ( confirmPassword && confirmPassword !== password ) errors.confirmPassword.push("Confirm password doesn't match with password");


    if ( !validateEmail(email) ) errors.password.push("Invalid email address")

    if (
        errors.email.length > 0 ||
        errors.password.length > 0 ||
        errors.confirmPassword.length > 0
    ) {
        Object.keys(errors).map((errorKey) => {
            if ( errors[errorKey].length < 1 ) delete errors[errorKey]
        })
        return errors;
    } else {
        return true;
    }
}