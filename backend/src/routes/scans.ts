import { Router } from 'express';

const router = Router();

// Scan API routes will be implemented here
router.post('/submit', (req, res) => {
  res.json({ message: 'Scan routes - Coming soon' });
});

export { router as scanRoutes };
