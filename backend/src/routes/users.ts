import { Router, Request, Response } from 'express';

const router = Router();

// User profile routes will be implemented here
router.get('/profile', (req: Request, res: Response) => {
  res.json({ message: 'User routes - Coming soon' });
});

export { router as userRoutes };
