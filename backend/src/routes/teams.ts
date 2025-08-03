import { Router } from 'express';

const router = Router();

// Team management routes will be implemented here
router.get('/', (req, res) => {
  res.json({ message: 'Team routes - Coming soon' });
});

export { router as teamRoutes };
