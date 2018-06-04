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
 * @alias module:Cachemon
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
 * @alias module:Cachemon
 * @param clientConfig
 * @returns {CacheMonClient}
 * @example
 * const cnrCache = new CacheMonClient({
        name: 'DATA',
        executeCronJob: false,
        cronPeriod: '0 * * * * *',
        cronExecutorFn: (done) => {
            i++;
            console.log('Running');
            request({
                url: 'https://api.github.com/users/rajatady/repos?per_page=10',
                headers: {
                    'User-Agent': 'request'
                }
            }, (err, response, body) => {
                if (err) {
                    done();
                } else {
                    cnrCache.updateResourcePool(body)
                        .then(res => {
                            console.log('Done');
                        })
                        .catch(err => {
                            console.log(err);
                        })
                }
            });
        },
        requestMethod: 'GET',
        urlDomain: '/data'
    });


 cnrCache.on('updated', (data) => {
        console.log('Updated');
    });

 export default resource(cnrCache);
 */
export const resource = (clientConfig) => {
    if (cacheMonClient) {
        clientConfig.client = cacheMonClient;
        clientConfig.emit('connect');
    } else {
        config.push(clientConfig);
    }
    return clientConfig;
};


/**
 * @alias module:Cachemon
 * @private
 */
const _connectInstances = () => {
    console.log('Connecting instances');
    config.forEach(o => {
        o.client = cacheMonClient;
        o.emit('connect');
    });
};

/**
 * @alias module:Cachemon
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
 * @alias module:Cachemon
 * @param {CacheMonClient} cacheModel
 * @returns {Function}
 */
export const cacheMiddleware = (cacheModel) => (req, res, next) => {
    let promise;
    if (cacheModel.maintainUrls) {
        promise = cacheModel.getData(generateHash(req.url))
    } else {
        promise = cacheModel.getResourcePool();
    }
    promise
        .then((data) => {
            if (data) {
                if (cacheModel.shouldRunUpdater) {
                    cacheModel.updaterFn();
                }
                if (cacheModel.preSendCallback) {
                    cacheModel.preSendCallback(req, res, next, data)
                } else {
                    console.log('Serving from cache');
                    res.json(JSON.parse(data))
                }

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
 * @alias module:Cachemon
 * @param resourceName
 * @returns {*}
 */
export const getResource = (resourceName) => {
    return _.find(config, o => o.name === resourceName);
};

/**
 * @alias module:Cachemon
 * @param str
 * @returns {*|PromiseLike<ArrayBuffer>}
 */
const generateHash = (str) => {
    return crypto.createHash('md5').update(str).digest('hex')
};

/**
 * @module Cachemon
 */
export default CacheMonClient;
