import {initClient} from './client';
import * as redis from 'redis';
import bluebird from 'bluebird';

let client;

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

export const initialize = (config) => {
    return initClient(config);
};

export const test = () => {
    client.setAsync('my test key', 'my test value1')
        .then(res => console.log(res));


    client.getAsync('my test key')
        .then(result => {
            console.log('GET result -> ' + result);
        })
        .catch(error => {
            console.log(error);
            throw error;
        });

    client.hset(["hash key", "hashtest", "some other value"]);
};

initialize()
    .then(cli => {
        client = cli;
        test();
    })
    .catch(err => {
        console.log(err);
    });
