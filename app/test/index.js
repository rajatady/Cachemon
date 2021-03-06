import {Router} from 'express'
import CNRCacheModel from './caching';
import {cacheMiddleware} from '../../src';
import request from "request";

const router = new Router();


const handler = (req, res) => {
    let gData;
    CNRCacheModel.getResourcePool()
        .then(data => {
            if (data) {
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
            gData = data;
            return CNRCacheModel.setData(req, data)
        })
        .then(() => {
            res.json(JSON.parse(gData));
        })
        .catch(err => {
            res.json({error: err.message})
        })
};

const extData = () => {
    return new Promise((resolve, reject) => {
        request({
            url: 'https://api.github.com/users/rajatady/repos?per_page=10',
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
