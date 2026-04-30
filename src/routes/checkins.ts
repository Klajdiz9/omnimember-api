import { Router, Request, Response } from 'express';
import { CheckinService } from '../services/checkin.service';
import { authMiddleware } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.post('/', async (req: Request, res: Response) => {
  try {
    const { memberId, _mockExpired } = req.body;
    if (!memberId) return res.status(400).json({ error: 'memberId is required' });

    const result = await CheckinService.createCheckin(req.brandId!, memberId, _mockExpired);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/checkout', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.body;
    if (!memberId) return res.status(400).json({ error: 'memberId is required' });

    const result = await CheckinService.checkout(req.brandId!, memberId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/presence', async (req: Request, res: Response) => {
  try {
    const list = await CheckinService.getDetailedPresenceList(req.brandId!);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/presence/count', async (req: Request, res: Response) => {
  try {
    const count = await CheckinService.getPresenceCount(req.brandId!);
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const date = req.query.date as string;
    const checkins = await CheckinService.getCheckins(req.brandId!, date);
    res.json(checkins);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
