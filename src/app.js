import * as redis from 'redis';
import bluebird from 'bluebird';

let cacheMonClient;
import _ from 'lodash';
import CacheMonClient from "./client";

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


const _connectInstances = () => {
    console.log('Connecting instances');
    config.forEach(o => {
        o.cachemonClient.client = cacheMonClient;
        o.cachemonClient.prefix = o.name;
    });
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

/**
 *
 * @param resourceName
 * @returns {*}
 */
export const getResource = (resourceName) => {
    return _.find(config, o => o.name === resourceName);
};

export default CacheMonClient;
