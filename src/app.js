import * as redis from 'redis';
import bluebird from 'bluebird';
import _ from 'lodash';
import CacheMonClient from "./client";
import crypto from 'crypto';

let cacheMonClient;

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const config = [];

/**
 *
 * @param config
 * @returns {Promise<any>}
 */
export const initialize = (config) => {
    return new Promise((resolve, reject) => {

        let _client = cacheMonClient = redis.createClient(config);
        if (config && (config.password || config.pass)) {
            _client.auth(config.password || config.pass, function (err) {
                if (err) {
                    console.log('Error in redis auth');
                } else {
                    console.log('Auth for redis complete');
                    _connectInstances();
                }
            })
        } else {
            _client.on('connect', () => {
                _connectInstances();
                console.log('Redis client connected');
                resolve(_client);
            });
        }
        _client.on('error', (err) => {
            reject(err);
        });
    });
};


/**
 *
 * @param clientConfig
 * @returns {CacheMonClient}
 */
export const resource = (clientConfig) => {
    config.push(clientConfig);
    return clientConfig;
};


/**
 *
 * @private
 */
const _connectInstances = () => {
    console.log('Connecting instances');
    config.forEach(o => {
        o.client = cacheMonClient;
    });
};

/**
 *
 * @param url
 * @param {CacheMonClient} cacheModel
 * @returns Promise
 */
export const hasKey = (url, cacheModel) => {
    return new Promise((resolve, reject) => {
        cacheModel._instance.keysAsync('*')
            .then(keys => {
                console.log(keys);
                let hashedKey = cacheModel.name + '_' + generateHash(url);
                console.log('Hashed Key : ', hashedKey);
                resolve(_.findIndex(keys, o => o === hashedKey) !== -1);
            })
            .catch(err => {
                console.warn('Error while finding keys:', err);
                reject()
            })
    })
};

/**
 *
 * @param {CacheMonClient} cacheModel
 * @returns {Function}
 */
export const cacheMiddleware = (cacheModel) => (req, res, next) => {
    cacheModel.getData(generateHash(req.url))
        .then((data) => {
            if (data) {
                console.log('Serving from cache');
                res.json(JSON.parse(data))
            } else {
                next();
            }
        })
        .catch(err => {
            console.warn(err);
            next();
        })
};

/**
 *
 * @param resourceName
 * @returns {*}
 */
export const getResource = (resourceName) => {
    return _.find(config, o => o.name === resourceName);
};

/**
 *
 * @param str
 * @returns {*|PromiseLike<ArrayBuffer>}
 */
const generateHash = (str) => {
    return crypto.createHash('md5').update(str).digest('hex')
};

export default CacheMonClient;
