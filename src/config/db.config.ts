import mongoose from 'mongoose'
import colors from 'colors'
import { generate } from '../utils/random.util'

import redis from '../middleware/redis.mw'

mongoose.Promise = global.Promise;

const options: object = {

    useNewUrlParser: true,
    autoIndex: true,
    keepAlive: true,
    maxPoolSize: 1000,
    wtimeoutMS:60000,
    connectTimeoutMS: 60000,
    socketTimeoutMS: 60000,
    serverSelectionTimeoutMS: 60000,
    family: 4,
    useUnifiedTopology: true

}

const connectRedis = async (): Promise<void> => {

    const PORT = process.env.REDIS_PORT || '6379';
    const HOST = process.env.REDIS_HOST || '127.0.0.1';
    const PASS = process.env.REDIS_PASSWORD || '';

    await redis.connect({ user: process.env.REDIS_USER || '', password: PASS, host: HOST, port: parseInt(PORT) });

} 

const connectDB = async (): Promise<void> => {

    // connect to redis
    await connectRedis();

    //connect to mongoose
    const dbConn = await mongoose.connect(process.env.MONGODB_URI || '', options);
    console.log(colors.cyan.bold.underline(`Database connected: ${dbConn.connection.host}`));

}

export default connectDB;

