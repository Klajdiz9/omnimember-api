import { Router, Request, Response } from 'express';

const router = Router();

// Login page
router.get('/login', (req: Request, res: Response) => {
  res.render('login');
});

// Live Monitor Dashboard
router.get('/monitor', (req: Request, res: Response) => {
  res.render('dashboard');
});

// Redirect /dashboard to /dashboard/monitor or /dashboard/login
router.get('/', (req: Request, res: Response) => {
  res.redirect('/dashboard/login');
});

export default router;
