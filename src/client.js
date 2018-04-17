import * as redis from 'redis';
import bluebird from 'bluebird';
import cron from 'node-cron';

let cacheMonClient;

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);


class cacheMon {
    baseRoute;
    requestType;
    cronPeriod;
    shouldRunCronJob;
    instance;
    cronExecutorFn;

    constructor(options, instance) {
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


    runCronJob() {
        cron.schedule(this.cronPeriod, this.cronExecutorFn).start();
    }
}

export default cacheMonClient;


