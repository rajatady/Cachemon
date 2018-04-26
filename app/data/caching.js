import CacheMonClient, {resource} from "../../src";
import request from 'request';

let i = 0;

const updaterFunction = () => {
    i++;
    console.log('Updater running', i);
    request({
        url: 'https://api.github.com/users/Crizstian/repos?per_page=' + (i * 10),
        headers: {
            'User-Agent': 'request'
        }
    }, (err, response, body) => {
        if (err) {
            done();
        } else {
            cnrCache.updateResourcePool(body)
                .then(res => {
                    return cnrCache.saveMeta('i', i);
                })
                .then(res => {
                    console.log('Done');
                })
                .catch(err => {
                    console.log(err);
                })
        }
    });
};

const executorFunction = (done) => {
    i++;
    console.log('Running');
    request({
        url: 'https://api.github.com/users/Crizstian/repos?per_page=' + (i * 10),
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
};

const preSendCallback = (req, res, next, data) => {
    res.send({data: JSON.parse(data)});
};

const cnrCache = new CacheMonClient({
    name: 'DATA',
    executeCronJob: false,
    cronPeriod: '0 * * * * *',
    cronExecutorFn: executorFunction,
    shouldRunUpdater: false,
    updaterFn: updaterFunction,
    preSendCallback: preSendCallback,
    requestMethod: 'GET',
    urlDomain: '/data'
});


cnrCache.on('updated', (data) => {
    console.log('Updated');
});


export default resource(cnrCache);
