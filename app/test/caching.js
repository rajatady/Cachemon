import CacheMonClient, {resource} from "../../src";

const cnrCache = new CacheMonClient({
    name: 'CNR',
    executeCronJob: false,
    cronExecutor: () => {

    },
    shouldRunPurge: false,
    purgeFn: (data) => {
        return new Promise((resolve, reject) => {
            resolve(data);
        })
    },
    purgeCronPeriod: '* * * * *',
    requestMethod: 'GET',
    urlDomain: '/test'
});

export default resource(cnrCache);
