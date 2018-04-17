import {Router} from 'express';
import request from "request";
import {set, cachedRouteMiddleware} from '../src';

const router = new Router();

router.get('/test',
    cachedRouteMiddleware,
    (req, res) => {
        request('https://api.freshbyt.com/api/v1/categories', (err, response, body) => {
            if (err) {
                console.log(err);
            } else {
                set(req, body);
                res.json(JSON.parse(body));
            }
        })
    });


export default router

