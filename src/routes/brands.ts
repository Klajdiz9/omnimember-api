import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { authMiddleware } from '../middleware/auth';
import { AuthService } from '../services/auth.service';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(brands);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/switch', async (req: Request, res: Response) => {
  try {
    const { brandId } = req.body;
    if (!brandId) return res.status(400).json({ error: 'brandId is required' });

    // Ensure user is admin (simplified for PoC)
    const result = await AuthService.switchBrand(req.user!.userId, brandId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
