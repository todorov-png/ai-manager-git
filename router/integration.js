import { Router } from 'express';
import IntegrationController from '../controllers/integration-controller.js';
import authMiddleware from '../middlewares/auth-middleware.js';

const router = new Router();

router.post('/', authMiddleware, IntegrationController.create);
router.get('/', authMiddleware, IntegrationController.get);
router.put('/', authMiddleware, IntegrationController.update);

export default router;
