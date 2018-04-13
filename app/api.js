import {Router} from 'express'
import routes from './routes';
const router = new Router();

router.use('/', routes);

export default router

