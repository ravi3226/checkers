import { createClient } from 'redis';
import { redisConfig } from '../config/redis.config.js';
export var redisClient = null;
export const connectToRedis = () => {
    return new Promise(async (resolve, reject) => {
        const client = createClient({
            url: `${redisConfig.protocol}://${redisConfig.host}:${redisConfig.port}`
        });
        client.on('error', (err) => {
            console.log('Redis Client Error', err.message);
            process.exit(0);
            reject(err);
        });
        await client.connect();
        redisClient = client;
        console.log('Redis connection established successfully ✔');
        resolve(true);
    });
};
export const redisSetKeyValue = async (key, value) => {
    return new Promise((resolve, reject) => {
        redisClient.set(key, value).then((result) => {
            if (result === 'OK') {
                resolve({
                    success: true,
                    value: value
                });
            }
        }).catch((e) => {
            reject({
                success: false,
                message: e.message
            });
        });
    });
};
export const redisGetKeyValue = async (key, isJson = false) => {
    return new Promise((resolve, reject) => {
        redisClient.get(key).then(result => {
            if (isJson)
                result = JSON.parse(result);
            resolve({
                success: true,
                value: result
            });
        }).catch((e) => {
            reject({
                success: false,
                message: e.message
            });
        });
    });
};
//# sourceMappingURL=redis.service.js.map