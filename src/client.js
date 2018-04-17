import * as redis from 'redis';
import bluebird from 'bluebird';
import cron from 'node-cron';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

export default class CacheMonClient {
    _instance;
    _prefix;
    urlDomain;
    allowFiltering;
    requestMethod;
    _hasCronJob;
    cronPeriod;
    cronExecutorFn;

    constructor(config) {
        if (config.urlDomain) {
            this.urlDomain = config.urlDomain;
        }

        if (config.allowFiltering) {
            this.allowFiltering = config.allowFiltering;
        }

        this.requestMethod = config.requestMethod || 'GET';

        if (options.baseRoute) {
            this.baseRoute = options.baseRoute;
        } else {
            throw new Error('A base route is required to configure Cachemon policy')
        }

        if (options.requestType &&
            (options.requestType === 'GET' ||
                options.requestType === 'POST' )) {
            this.requestType = options.requestType;
        } else {
            this.requestType = 'GET';
        }

        if (options.cronPeriod) {
            this.cronPeriod = options.cronPeriod;
            this.shouldRunCronJob = true;
        }

        if (!cron.validate(this.cronPeriod)) {
            throw new Error('The cron period format is not correct. Please refer to\n https://www.npmjs.com/package/node-cron for more info about the valid formats')
        }

        if (options.cronPeriod && options.cronExecutorFn) {
            this.cronExecutorFn = options.cronExecutorFn;
        } else {
            throw new Error('A valid function to be executed set a `cronExecutorFn` in the options object is required')
        }

        this.instance = instance;

    }

    get client() {
        return this._instance;
    }

    set client(value) {
        this._instance = value;
    }

    get prefix() {
        return this._prefix;
    }

    set prefix(value) {
        this._prefix = value;
    }

    routeMiddleware(req, res, next) {
        this.getData(this._prefix)
            .then(data => {
                res.json(data);
            })
            .catch(err => {
                next();
            });
    }

    /**
     *
     * @param key
     * @param value
     * @returns {*}
     */
    setData(key, value) {
        return this._instance.setAsync(this._prefix + '_' + key, value);
    }

    /**
     *
     * @param key
     */
    getData(key) {
        return this._instance.getAsync(this._prefix + '_' + key);
    }

    /**
     *
     * @param resourcePoolData
     * @returns {*}
     */
    setResourcePool(resourcePoolData) {
        return this._instance.setAsync(this._prefix, resourcePoolData);
    }
    runCronJob() {
        cron.schedule(this.cronPeriod, this.cronExecutorFn).start();
    }
}

    invalidateResourcePool() {
        // client.keys("*", function (err, keys) {
        //     keys.forEach(function (key, pos) {
        //         console.log(key);
        //     });
        // });
        //
        // client.del(keys, function (err, o) {
        //
        // });
    }

    // /**
    //  * @memberOf client#
    //  */
    // test() {
    //     this._instance.setAsync('my test key', 'my test value1')
    //         .then(res => console.log(res));
    //
    //
    //     this._instance.getAsync('my test key')
    //         .then(result => {
    //             console.log('GET result -> ' + result);
    //         })
    //         .catch(error => {
    //             console.log(error);
    //             throw error;
    //         });
    //
    //     this._instance.hset(["hash key", "hashtest", "some other value"]);
    // };
}

