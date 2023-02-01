import dotenv from 'dotenv'

dotenv.config();
export interface Redis {
    port: string,
    host: string,
    protocol: string
}

export const redisConfig: Redis = {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    protocol: process.env.REDIS_PROTOCOL
}

export interface RedisStoredValue {
    success: boolean,
    message?: string,
    value: any
}

export interface RedisClientResult {
    success: boolean,
    message?: string,
    value: any
}

export const BotGameTurn = 'BotGameTurn'