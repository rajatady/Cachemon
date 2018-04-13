import * as redis from 'redis';
import bluebird from 'bluebird';
// import cacheMonClient from "./client";
let cacheMonClient;

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

export const initialize = (config) => {
    return new Promise((resolve, reject) => {

        let _client = cacheMonClient = redis.createClient(config);
        _client.on('connect', () => {
            console.log('Redis client connected');
            resolve(_client);
        });

        _client.on('error', (err) => {
            reject(err);
        });
    });
};


export const test = () => {
    try {
        cacheMonClient.setAsync('my test key', 'my test value1')
            .then(res => console.log(res));


        cacheMonClient.getAsync('my test key')
            .then(result => {
                console.log('GET result -> ' + result);
            })
            .catch(error => {
                console.log(error);
                throw error;
            });

        cacheMonClient.hset(["hash key", "hashtest", "some other value"]);
    } catch (e) {
        console.log(e);
    }

};


export default cacheMonClient;
