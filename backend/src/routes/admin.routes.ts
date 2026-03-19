import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// Semua rute admin butuh JWT dan role ADMIN
router.use(authenticateJWT);
router.use(adminController.isAdmin);

router.get('/users', adminController.getAllUsers);
router.get('/instances', adminController.getAllInstances);
router.post('/credits/update', adminController.updateUserCredits);
router.delete('/users/:id', adminController.deleteUser);

export default router;
