import dotenv from 'dotenv';
dotenv.config();
export const redisConfig = {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    protocol: process.env.REDIS_PROTOCOL
};
export const BotGameTurn = 'BotGameTurn';
//# sourceMappingURL=redis.config.js.map