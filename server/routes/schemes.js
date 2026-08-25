import { Router } from 'express';
import db from '../db/connection.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { findMatchingSchemes } from '../services/ai.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const schemes = db.prepare('SELECT * FROM schemes WHERE is_active = 1').all();
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/find', async (req, res) => {
  try {
    const profile = req.body;
    const schemes = db.prepare('SELECT * FROM schemes WHERE is_active = 1').all();
    
    const matches = await findMatchingSchemes(profile, schemes);
    
    // Attach full scheme details to matches
    const results = matches.map(match => {
      const scheme = schemes.find(s => s.id === match.scheme_id);
      return { ...match, scheme };
    }).filter(m => m.scheme);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const { name, name_ta, description, description_ta, department, for_students, for_disabled } = req.body;
    
    const insert = db.prepare('INSERT INTO schemes (name, name_ta, description, description_ta, department, for_students, for_disabled, is_demo) VALUES (?, ?, ?, ?, ?, ?, ?, 0)');
    const result = insert.run(name, name_ta, description, description_ta, department, for_students ? 1 : 0, for_disabled ? 1 : 0);
    
    res.status(201).json({ id: result.lastInsertRowid, message: 'Scheme created' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const { name, name_ta, description, description_ta, department, for_students, for_disabled } = req.body;
    
    db.prepare(`
      UPDATE schemes 
      SET name = ?, name_ta = ?, description = ?, description_ta = ?, department = ?, for_students = ?, for_disabled = ?
      WHERE id = ?
    `).run(name, name_ta, description, description_ta, department, for_students ? 1 : 0, for_disabled ? 1 : 0, req.params.id);
    
    res.json({ message: 'Scheme updated' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    db.prepare('UPDATE schemes SET is_active = 0 WHERE id = ?').run(req.params.id);
    res.json({ message: 'Scheme deactivated' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
