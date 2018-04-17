import * as redis from 'redis';
import bluebird from 'bluebird';

let cacheMonClient;
import _ from 'lodash';
import CacheMonClient from "./client";
import crypto from 'crypto';
import _ from 'lodash';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const config = [];

/**
 *
 * @param config
 * @returns {Promise<any>}
 */

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
 * @param resourceName
 * @returns {*}
 */
export const resource = (clientConfig, resourceName) => {
    config.push({
        name: resourceName,
        cachemonClient: clientConfig
    });
    return getResource(resourceName);
};
export const set = (req, value) => {
    let hashedKey = generateHash(req.url);
    console.log('Setting VALUE', hashedKey);
    return cacheMonClient.setAsync(hashedKey, value)
};


const _connectInstances = () => {
    console.log('Connecting instances');
    config.forEach(o => {
        o.cachemonClient.client = cacheMonClient;
        o.cachemonClient.prefix = o.name;
    });
};
export const get = (req) => {
    let hashedKey = generateHash(req.url);
    return cacheMonClient.getAsync(hashedKey)
};

/**
 *
 * @param {CacheMonClient} cacheModel
 * @returns {Function}
 */
export const cacheMiddleware = (cacheModel) => (req, res, next) => {
    if (cacheModel.allowFiltering) {

    }
    next();
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

/**
 *
 * @param resourceName
 * @returns {*}
 */
export const getResource = (resourceName) => {
    return _.find(config, o => o.name === resourceName);

const generateHash = (str) => {
    return crypto.createHash('md5').update(str).digest('hex')
};

export default CacheMonClient;
