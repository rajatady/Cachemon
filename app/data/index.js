import {Router} from 'express'
import CNRCacheModel from './caching';
import {cacheMiddleware} from '../../src';
import request from "request";

const router = new Router();


const handler = (req, res) => {
    let gData;
    console.log('as')
    CNRCacheModel.getResourcePool()
        .then(data => {
            if (data) {
                console.log('Cache Hit');
                return data;
            } else {
                return extData();
            }
        })
        .then(data => {
            if (data.res) {
                return CNRCacheModel.setResourcePool(data.res)
            } else {
                return data;
            }
        })
        .then(data => {
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            if (req.query.name) {
                data = data.filter(o => o.name === req.query.name)
            }
            gData = data;
            return CNRCacheModel.setData(req, JSON.stringify(data))
        })
        .then(() => {
            res.json(gData);
        })
        .catch(err => {
            res.json({error: err.stack})
        })
};

const extData = () => {
    return new Promise((resolve, reject) => {
        console.log('Requesting external data');
        request({
            url: 'https://api.github.com/users/Crizstian/repos?per_page=10',
            headers: {
                'User-Agent': 'request'
            }
        }, (err, response, body) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve({res: body});
            }
        })
    })
};

router.get('/',
    cacheMiddleware(CNRCacheModel),
    handler);


export default router
