import * as redis from 'redis';
import bluebird from 'bluebird';
import cron from 'node-cron';
import crypto from "crypto";
import EventEmitter from 'events';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

/**
 * @class CacheMonClient
 * @extends EventEmitter
 *
 */
export default class CacheMonClient extends EventEmitter {
    _instance;
    name;
    urlDomain;
    allowFiltering;
    requestMethod;
    _hasCronJob;
    cronPeriod;
    cronExecutorFn;

    /**
     *
     * @param {Object} options  The options for the Cachemon Client
     * @param {String}  options.name The name of the client for which resources have to be scoped
     * @param {String} [options.allowFiltering]
     * @param {String} options.urlDomain
     * @param {String} [options.requestMethod=GET]
     * @param {String} [options.cronPeriod]
     * @param {Boolean} [options.executeCronJob]
     * @param {Function} [options.cronExecutorFn]
     */
    constructor(options) {
        super();

        if (options.name) {
            this.name = options.name;
        } else {
            throw new Error('A valid name is required to configure Cachemon policy')
        }

        if (options.allowFiltering) {
            this.allowFiltering = options.allowFiltering;
        }

        if (options.urlDomain) {
            this.urlDomain = options.urlDomain;
        } else {
            throw new Error('A urlDomain is required to configure Cachemon policy')
        }

        if (options.requestMethod &&
            (options.requestMethod === 'GET' ||
                options.requestMethod === 'POST')) {
            this.requestMethod = options.requestMethod;
        } else {
            this.requestMethod = 'GET';
        }

        if (options.cronPeriod) {
            this.cronPeriod = options.cronPeriod;
            this._hasCronJob = true;
        }

        if (typeof options.executeCronJob !== 'undefined') {
            this._hasCronJob = options.executeCronJob;
        }


        if (this._hasCronJob && !cron.validate(this.cronPeriod)) {
            throw new Error('The cron period format is not correct. \n' +
                'Please refer to https://www.npmjs.com/package/node-cron for more info about the valid formats')
        }

        if (this._hasCronJob && options.cronPeriod && !options.cronExecutorFn) {
            throw new Error('A valid function to be executed set a `cronExecutorFn` in the options object is required')
        } else if (this._hasCronJob && options.cronPeriod && options.cronExecutorFn) {
            this.cronExecutorFn = options.cronExecutorFn;
        }


        if (this._hasCronJob) {
            this.runCronJob();
        }
    }

    get client() {
        return this._instance;
    }

    set client(value) {
        this._instance = value;
    }


    /**
     *
     * @param key
     * @param value
     * @returns {*}
     */
    setData(key, value) {
        if (key.url) {
            key = this.generateHash(key.url);
            console.log(key);
        }
        return this._instance.setAsync(this.name + '_' + key, value);
    }

    /**
     *
     * @param key
     */
    getData(key) {
        return this._instance.getAsync(this.name + '_' + key);
    }

    /**
     *
     * @param resourcePoolData
     * @returns {*}
     */
    setResourcePool(resourcePoolData) {
        return new Promise((resolve, reject) => {
            this._instance.setAsync(this.name, resourcePoolData)
                .then(result => resolve(resourcePoolData))
                .catch(err => reject(err))
        })
    }

    /**
     *
     * @returns {*}
     */
    getResourcePool() {
        return this._instance.getAsync(this.name);
    }

    /**
     *
     * @param appendData
     * @returns {Promise<any>}
     */
    appendToResourcePool(appendData) {
        return new Promise((resolve, reject) => {
            this.getResourcePool()
                .then(result => {
                    if (result) {
                        result = JSON.parse(result);
                        result = result.concat(appendData);
                        return this.setResourcePool(result);
                    } else {
                        return appendData;
                    }
                })
                .then(res => {
                    this.emit('appended', res);
                    resolve(res);
                })
                .catch(err => reject(err))
        })
    }


    /**
     *
     * @param updateData
     * @returns {Promise<any>}
     */
    updateResourcePool(updateData) {
        return new Promise((resolve, reject) => {
            this.invalidateResourcePool()
                .then(res => this.setResourcePool(updateData))
                .then(res => {
                    this.emit('updated', res);
                    resolve(res)
                })
                .catch(err => reject(err));
        })
    }

    /**
     *
     * @param str
     * @returns {*|PromiseLike<ArrayBuffer>}
     */
    generateHash(str) {
        return crypto.createHash('md5').update(str).digest('hex')
    };


    /**
     *
     */
    runCronJob() {
        console.log('Scheduling cron job for : ' + this.name);
        cron.schedule(this.cronPeriod, this.cronExecutorFn, true);
    }


    /**
     *
     * @returns {Promise<any>}
     */
    invalidateResourcePool() {
        return new Promise((resolve, reject) => {
            this._instance.keysAsync('*')
                .then(res => {
                    const _delKeys = [this.name];
                    res.forEach(o => {
                        if (o.indexOf(this.name + '_') !== -1) {
                            _delKeys.push(o);
                        }
                    });
                    return this._instance.delAsync(_delKeys);
                })
                .then(res => {
                    console.log(`Invalidated all data for ${this.name}`);
                    resolve(res);
                })
                .catch(err => reject(err));
        })
    }
}

