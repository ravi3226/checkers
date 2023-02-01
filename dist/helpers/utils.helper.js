import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import jsonwebtoken from 'jsonwebtoken';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const privKey = fs.readFileSync(path.join(__dirname, '..', '..', 'id_rsa_priv.pem'), 'utf-8');
const pubKey = fs.readFileSync(path.join(__dirname, '..', '..', 'id_rsa_pub.pem'), 'utf-8');
export const validateEmail = (email) => {
    return email
        .toLowerCase()
        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) ? true : false;
};
export const validatePhone = (phone) => {
    return phone
        .match(/^\+?([0-9]{2})\)?[-. ]?([0-9]{5})[-. ]?([0-9]{5})$/) ? true : false;
};
export const genPassword = (password) => {
    const salt = crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return {
        hash,
        salt
    };
};
export const comparePassword = (password, hash, salt) => {
    const newHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return newHash === hash;
};
export const issueJWT = (id) => {
    const expiresIn = '1d';
    const payload = {
        sub: id,
        iat: Date.now(),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    };
    const jwt = jsonwebtoken.sign(payload, privKey, { algorithm: 'RS256' });
    return {
        token: 'Bearer ' + jwt,
        expires: expiresIn
    };
};
export const verifyJwt = (token) => {
    try {
        const tokenStatus = jsonwebtoken.verify(token.split(" ")[1], pubKey, { algorithms: 'RS256' });
        if (tokenStatus && (tokenStatus.iat + tokenStatus.exp) < Date.now()) {
            return {
                validate: false,
                message: 'token has been expired.'
            };
        }
        else if (tokenStatus) {
            return {
                validate: true,
                message: 'token has been validated successfully.',
                id: tokenStatus.sub
            };
        }
        else {
            return {
                validate: false,
                message: 'invalid token'
            };
        }
    }
    catch (e) {
        return {
            validate: false,
            message: 'invalid token'
        };
    }
};
export const PrintMessage = (message) => {
    console.log(`${message} \t \t | time : ${new Date().toISOString()}`);
};
export const addMinutes = (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000);
};
//# sourceMappingURL=utils.helper.js.map