import { Router, Request, Response } from 'express';
import { SubscriptionService } from '../services/subscription.service';
import { authMiddleware } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/', async (req: Request, res: Response) => {
  try {
    const subs = await SubscriptionService.getSubscriptions(req.brandId!);
    res.json(subs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/member/:memberId', async (req: Request, res: Response) => {
  try {
    const subs = await SubscriptionService.getMemberSubscriptions(req.params.memberId, req.brandId!);
    res.json(subs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { memberId, type, startDate, endDate } = req.body;
    const sub = await SubscriptionService.createSubscription(req.brandId!, {
      memberId,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
    res.status(201).json(sub);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/suspend', async (req: Request, res: Response) => {
  try {
    const sub = await SubscriptionService.suspendSubscription(req.params.id, req.brandId!);
    res.json(sub);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
