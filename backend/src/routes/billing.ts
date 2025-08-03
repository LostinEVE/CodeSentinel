import { Router, Request, Response } from 'express';

const router = Router();

// Stripe billing routes will be implemented here
router.get('/plans', (req: Request, res: Response) => {
  res.json({ message: 'Billing routes - Coming soon' });
});

export { router as billingRoutes };
