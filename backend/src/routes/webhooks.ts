import { Router, Request, Response } from 'express';

const router = Router();

// Webhook routes for Stripe and other services
router.post('/stripe', (req: Request, res: Response) => {
  res.json({ message: 'Webhook routes - Coming soon' });
});

export { router as webhookRoutes };
