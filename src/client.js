import * as redis from 'redis';
import bluebird from 'bluebird';
import cron from 'cron';
import crypto from "crypto";
import EventEmitter from 'events';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

/**
 * @class CacheMonClient
 * @extends EventEmitter
 * @param {Object} options  The options for the Cachemon Client
 * @param {String}  options.name The name of the client for which resources have to be scoped
 * @param {String} [options.allowFiltering] Whether the domain should allow data filtering (Planned)
 * @param {String} [options.urlDomain] The url domain registered with express. To be used for advanced caching (Planned)
 * @param {String} [options.requestMethod=GET] The HTTP request method for the url domain (Planned)
 * @param {String} [options.cronPeriod] The cron period in a standard glob format. Refer to https://www.npmjs.com/package/node-cron for more
 * @param {String} [options.purgeCronPeriod] The cron period for the purge function in a standard glob format. Refer to https://www.npmjs.com/package/node-cron for more
 * @param {Boolean} [options.executeCronJob] Should the cron function be executed
 * @param {Function} [options.cronExecutorFn] The function to be executed whenever the cron job runs
 * @param {Function} [options.updaterFn] The function to be executed whenever request is served from cache
 * @param {Function} [options.purgeFn] The function to be executed whenever cron time for purge is reached
 * @param {Boolean} [options.shouldRunUpdater=false] Should the updater function run
 * @param {Boolean} [options.shouldRunPurge=false] Should the purge function run
 * @param {Boolean} [options.maintainUrls=false] Should a new data pool be created based on request url
 * @param {Function} [options.preSendCallback] The function which gets the control once the data from cache is evaluated and is ready to be sent
 **/
export default class CacheMonClient extends EventEmitter {
    _instance;
    name;
    urlDomain;
    allowFiltering;
    requestMethod;
    _hasCronJob;
    cronPeriod;
    cronExecutorFn;
    updaterFn;
    shouldRunUpdater;
    metaKey;
    purgeCronPeriod;
    shouldRunPurge;
    purgeFn;
    preSendCallback;

    /**
     *
     * Create a Cachemon client
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


        if (this._hasCronJob && !this._validateCronPeriod(this.cronPeriod)) {
            throw new Error('The cron period format is not correct. \n' +
                'Please refer to https://www.npmjs.com/package/node-cron for more info about the valid formats')
        }

        if (this._hasCronJob && options.cronPeriod && !options.cronExecutorFn) {
            throw new Error('A valid function to be executed set a `cronExecutorFn` in the options object is required')
        } else if (this._hasCronJob && options.cronPeriod && options.cronExecutorFn) {
            this.cronExecutorFn = options.cronExecutorFn;
        }

        this.shouldRunPurge = options.shouldRunPurge;
        this.purgeCronPeriod = options.purgeCronPeriod;

        if (this.shouldRunPurge && !this._validateCronPeriod(this.purgeCronPeriod)) {
            throw new Error('The cron period format for the purge function is not correct. \n' +
                'Please refer to https://www.npmjs.com/package/node-cron for more info about the valid formats')
        } else if (this.shouldRunPurge && !options.purgeFn) {
            throw new Error('A valid purge function to be executed set a `purgeFn` in the options object is required')
        } else if (this.shouldRunPurge && options.purgeFn && this._validateCronPeriod(this.purgeCronPeriod)) {
            this.purgeFn = options.purgeFn.bind(this);
        }


        if (options.updaterFn) {
            this.updaterFn = options.updaterFn.bind(this);
        }

        this.shouldRunUpdater = options.shouldRunUpdater;

        this.metaKey = this.name + '-META';

        this.maintainUrls = options.maintainUrls;

        if (options.preSendCallback) {
            this.preSendCallback = options.preSendCallback;
        }

        if (this._hasCronJob) {
            this.runCronJob();
        }

        if (this.shouldRunPurge) {
            this.runPurgeJob();
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
     * @description Set some data in the resource. The key will be prefixed with the resource name specified earlier
     * @param key {String} The key to be put in the cache
     * @param value {String} The data to be saved
     * @returns {Promise<any>}
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
     * @description Get some data from the resource. The key will be prefixed with the resource name specified earlier
     * @param key {String} The key to fetch from the cache
     * @returns {Promise<any>}
     */
    getData(key) {
        return this._instance.getAsync(this.name + '_' + key);
    }

    /**
     * @description Sets the data in the resource pool
     * @param resourcePoolData {String} Set the data in the resource pool
     * @returns {Promise<any>}
     */
    setResourcePool(resourcePoolData) {
        return new Promise((resolve, reject) => {
            this._saveData(resourcePoolData)
                .then(result => resolve(resourcePoolData))
                .catch(err => reject(err))
        })
    }

    /**
     *
     * @private
     */
    _saveData(resourcePoolData) {
        return new Promise((resolve, reject) => {
            this._instance.setAsync(this.name, resourcePoolData)
                .then(res => {
                    //     return this.saveMeta('lastResourceUpdate', new Date())
                    // })
                    // .then(result => {
                    resolve(res);
                })
                .catch(err => reject(err));
        })
    }

    /**
     * @description Get the data from the resource pool
     * @returns {Promise<any>}
     */
    getResourcePool() {
        return new Promise((resolve, reject) => {
            this._instance.getAsync(this.name)
                .then(res => resolve(res))
                .catch(err => reject(err));

        })
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
     * @param {Boolean} preventEmit
     * @returns {Promise<any>}
     */
    updateResourcePool(updateData, preventEmit) {
        return new Promise((resolve, reject) => {
            this.invalidateResourcePool()
                .then(res => this.setResourcePool(updateData))
                .then(res => {
                    if (!preventEmit) {
                        this.emit('updated', res);
                    }
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
        new cron.CronJob({
            cronTime: this.cronPeriod,
            onTick: this.cronExecutorFn,
            start: true,
            context: this
        });
    }

    runPurgeJob() {
        console.log('Scheduling purge cron job for : ' + this.name);
        new cron.CronJob({
            cronTime: this.purgeCronPeriod,
            onTick: this._createExtendedPurgeFn,
            start: true,
            context: this
        });
    }

    /**
     *
     * @private
     */
    _createExtendedPurgeFn() {
        this._instance.getAsync(this.name)
            .then(data => this.purgeFn.call(this, data))
            .then(newData => this.updateResourcePool(newData, true))
            .catch(err => {
                console.log('Error while executing the purge function');
                console.error(err);
            })
    }

    /**
     *
     * @description Set the meta info in the cache
     * @return {Promise<any>}
     * @param key
     * @param value
     */
    saveMeta(key, value) {
        return new Promise((resolve, reject) => {
            this._instance.getAsync(this.metaKey)
                .then(data => {
                    if (!data) {
                        data = {};
                    } else {
                        data = JSON.parse(data);
                    }
                    data[key] = value;
                    this._instance.setAsync(this.metaKey, JSON.stringify(data))
                })
                .then(result => {
                    resolve(result);
                })
                .catch(err => reject(err));
        });
    }

    /**
     * @description Get the meta info saved in the cache
     * @returns {Promise<any>}
     */
    getMeta() {
        return this._instance.getAsync(this.metaKey);
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

    /**
     * @description Manually run the updater function
     */
    runUdaterFunction() {
        this.updaterFn();
    }


    /**
     *
     * @param cronPeriod
     * @private
     */
    _validateCronPeriod(cronPeriod) {
        let job;
        try {
            job = new cron.CronJob(cronPeriod, function () {
            });
            job.stop();
            return true;
        } catch (ex) {
            if (job)
                job.stop();
            return false;
        }
    }


}

