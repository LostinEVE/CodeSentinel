import { Router } from 'express';

const router = Router();

// User profile routes will be implemented here
router.get('/profile', (req, res) => {
  res.json({ message: 'User routes - Coming soon' });
});

export { router as userRoutes };
