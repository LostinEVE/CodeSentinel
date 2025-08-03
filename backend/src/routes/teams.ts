import { Router, Request, Response } from 'express';

const router = Router();

// Team management routes will be implemented here
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Team routes - Coming soon' });
});

export { router as teamRoutes };
