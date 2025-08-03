import { Router } from 'express';

const router = Router();

// Stripe billing routes will be implemented here
router.get('/plans', (req, res) => {
  res.json({ message: 'Billing routes - Coming soon' });
});

export { router as billingRoutes };
