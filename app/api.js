import {Router} from 'express'
import test from './test';
import data from './data';

const router = new Router();

router.use('/test', test);
router.use('/data', data);

export default router

