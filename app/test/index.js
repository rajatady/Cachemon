import {Router} from 'express'
import request from "request";
import CNRCacheModel from './caching';
import {cacheMiddleware} from '../../src';

const router = new Router();

router.get('/',
    cacheMiddleware(CNRCacheModel),
    (req, res) => {

        request({
            url: 'https://api.github.com/users/rajatady/repos?per_page=10',
            headers: {
                'User-Agent': 'request'
            }
        }, (err, response, body) => {
            if (err) {
                console.log(err);
                res.json(err.message);
            } else {
                CNRCacheModel.cachemonClient.setResourcePool(body)
                    .then(result => {
                        console.log('Saved Data');
                        res.json(JSON.parse(body));
                    })
                    .catch(err => {
                        console.log(err);
                        res.json(err.message);
                    });
            }
        })
    });

export default router
