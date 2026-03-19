import { Router } from 'express';
import { 
  getNodes, getUserInstances, startInstance, stopInstance, 
  createInstance, getInstanceStatus, getInstanceConsole, 
  deleteInstance, destroyInstance 
} from '../controllers/vps.controller';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/nodes', getNodes);
router.get('/instances', getUserInstances);
router.get('/:id/status', getInstanceStatus);
router.get('/:id/console', getInstanceConsole);
router.delete('/:id', deleteInstance);
router.post('/:id/destroy', destroyInstance);
router.post('/create', createInstance);
router.post('/:id/start', startInstance);
router.post('/:id/stop', stopInstance);

export default router;
