import express from 'express';
import { register, login } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route example
router.get('/profile', auth, (req, res) => {
  res.json({ message: 'Protected route accessed successfully' });
});

export default router; 