import request from "request";
import { Router } from 'express'
const router = new Router();

router.get('/', (req, res) => {
    request('https://api.freshbyt.com/api/v1/categories', (err, response, body) => {
        if (err) {
            console.log(err);
        } else {
            res.json(JSON.parse(body));
        }
    })
});


export default router
