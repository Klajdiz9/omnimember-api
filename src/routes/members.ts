import { Router, Request, Response } from 'express';
import { MemberService } from '../services/member.service';
import { authMiddleware } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await MemberService.getMembers(req.brandId!, page, limit);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const member = await MemberService.getMemberById(req.params.id, req.brandId!);
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const member = await MemberService.createMember(req.brandId!, req.body);
    res.status(201).json(member);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const member = await MemberService.updateMember(req.params.id, req.brandId!, req.body);
    res.json(member);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await MemberService.deleteMember(req.params.id, req.brandId!);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
