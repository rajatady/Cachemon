import CacheMonClient, {resource} from "../../src";

const cnrCache = new CacheMonClient({
    name: 'CNR',
    executeCronJob: false,
    cronExecutor: () => {

    },
    requestMethod: 'GET',
    urlDomain: '/test'
});

export default resource(cnrCache);
