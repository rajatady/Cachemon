import CacheMonClient, {resource} from "../../src";

const cnrCache = new CacheMonClient({
    executeCronJob: true,
    cronExecutor: () => {

    },
    requestMethod: 'GET',
    urlDomain: '/test',
    allowFiltering: true
});

export default resource(cnrCache, 'CNR');
