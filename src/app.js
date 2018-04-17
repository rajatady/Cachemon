import * as redis from 'redis';
import bluebird from 'bluebird';
import Client from "./client";
let cacheMonClient;
import crypto from 'crypto';
import _ from 'lodash';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);


export const getClient = (options) => {
    return new Client(options, cacheMonClient);
};

export const hasKey = (key) => {
    return new Promise((resolve, reject) => {
        cacheMonClient.keysAsync('*')
            .then(keys => {
                let hashedKey = generateHash(key);
                resolve(_.findIndex(keys, o => o === hashedKey) !== -1);
            })
            .catch(err => {
                console.warn('Error while finding keys:', err);
                reject()
            })
    })
};

export const initialize = (config) => {
    return new Promise((resolve, reject) => {

        let _client = cacheMonClient = redis.createClient(config);
        _client.on('connect', () => {
            console.log('Redis client connected');
        });

        _client.on('error', (err) => {
            reject(err);
        });
    });
};

export const set = (req, value) => {
    let hashedKey = generateHash(req.url);
    console.log('Setting VALUE', hashedKey);
    return cacheMonClient.setAsync(hashedKey, value)
};


export const get = (req) => {
    let hashedKey = generateHash(req.url);
    return cacheMonClient.getAsync(hashedKey)
};


export const cachedRouteMiddleware = (req, res, next) => {
    hasKey(req.url)
        .then((isPresent) => {
            if (isPresent) {
                get(req)
                    .then(result => {
                        console.log('Serving from cache');
                        res.json(JSON.parse(result))
                    })
                    .catch(err => {
                        console.log('Error from cache : ', req.url);
                        next(err)
                    })
            } else {
                next();
            }
        })
        .catch(err => next())
};


const generateHash = (str) => {
    return crypto.createHash('md5').update(str).digest('hex')
};


export default cacheMonClient;
