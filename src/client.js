import * as redis from 'redis';
import bluebird from 'bluebird';

let cacheMonClient;

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);


class cachemonClient {
    instance;


    constructor(instance) {
        this.instance = instance;
    }

    /**
     * @memberOf client#
     */
    test() {
        this.instance.setAsync('my test key', 'my test value1')
            .then(res => console.log(res));


        this.instance.getAsync('my test key')
            .then(result => {
                console.log('GET result -> ' + result);
            })
            .catch(error => {
                console.log(error);
                throw error;
            });

        this.instance.hset(["hash key", "hashtest", "some other value"]);
    };
}

export const initClient = (options) => {
    return new Promise((resolve, reject) => {
        let _client = cacheMonClient = redis.createClient(options);
        let client = new cachemonClient(_client);
        _client.on('connect', () => {
            console.log('Redis client connected');
            resolve(client);
        });

        _client.on('error', (err) => {
            reject(err);
        });
    });
};


export default cacheMonClient;


