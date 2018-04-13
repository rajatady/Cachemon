import http from 'http'
import {env, ip, port} from './config'
import express from 'express'
import api from './api'
import {initialize} from "../src";


const app = express();
const server = http.createServer(app);


app.use(api);


initialize()
    .then(() => console.log('Connected'))
    .catch(err => console.log('Error connecting to redis', err));


setImmediate(() => {
    server.listen(port, ip, () => {
        console.log('Express server listening on http://%s:%d, in %s mode', ip, port, env)
    })
});


app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next()
});

export default app
