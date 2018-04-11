import * as redis from 'redis';
import bluebird from 'bluebird';

let client = '';
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

export const initClient = (options) => {
    return new Promise((resolve, reject) => {
        client = redis.createClient(options);
        client.on('connect', () => {
            console.log('Redis client connected')
            resolve(client);
        });

        client.on('error', (err) => {
            reject(err);
        });
    });
};

export default client;
