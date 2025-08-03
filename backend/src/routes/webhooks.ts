import { Router } from 'express';

const router = Router();

// Webhook routes for Stripe and other services
router.post('/stripe', (req, res) => {
  res.json({ message: 'Webhook routes - Coming soon' });
});

export { router as webhookRoutes };
