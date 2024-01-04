import mongoose from 'mongoose';
import { config } from '@root/config';
import Logger from 'bunyan';
import { redisConnection } from '@service/redis/redisConnection';

const log: Logger = config.createLogger('db');

export default () => {
    const connect = () => {
        mongoose
            .connect(`${config.DATABASE_URL}`)
            .then(() => {
                log.info('Sucessfully connected to db.');
                redisConnection.connect();
            })
            .catch((error) => {
                log.error('Error connecting to db', error);
                return process.exit(1);
            });
    };
    connect();

    mongoose.connection.on('disconnected', connect);
};
