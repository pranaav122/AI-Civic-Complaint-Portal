import { Router } from 'express';
import db from '../db/connection.js';
import { hashPassword, verifyPassword, generateToken, authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, preferred_language } = req.body;
    
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashed = await hashPassword(password);
    
    const insert = db.prepare('INSERT INTO users (email, password_hash, full_name, phone, preferred_language) VALUES (?, ?, ?, ?, ?)');
    const result = insert.run(email, hashed, full_name, phone, preferred_language || 'en');
    
    const user = { id: result.lastInsertRowid, email, full_name, role: 'citizen' };
    const token = generateToken(user);

    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    
    const { password_hash, ...userProfile } = user;
    res.json({ token, user: userProfile });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, full_name, phone, role, preferred_language, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { full_name, phone, preferred_language } = req.body;
    
    db.prepare('UPDATE users SET full_name = ?, phone = ?, preferred_language = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(full_name, phone, preferred_language, req.user.id);
      
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
