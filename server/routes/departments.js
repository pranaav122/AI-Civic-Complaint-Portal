import { Router } from 'express';
import db from '../db/connection.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const departments = db.prepare('SELECT * FROM departments WHERE is_active = 1').all();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const { name, name_ta, code, description, contact_email, contact_phone, head_name } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    const insert = db.prepare('INSERT INTO departments (name, name_ta, code, description, contact_email, contact_phone, head_name) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const result = insert.run(name, name_ta, code, description, contact_email, contact_phone, head_name);
    
    res.status(201).json({ id: result.lastInsertRowid, message: 'Department created' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const { name, name_ta, code, description, contact_email, contact_phone, head_name } = req.body;
    
    db.prepare(`
      UPDATE departments 
      SET name = ?, name_ta = ?, code = ?, description = ?, contact_email = ?, contact_phone = ?, head_name = ?
      WHERE id = ?
    `).run(name, name_ta, code, description, contact_email, contact_phone, head_name, req.params.id);
    
    res.json({ message: 'Department updated' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    db.prepare('UPDATE departments SET is_active = 0 WHERE id = ?').run(req.params.id);
    res.json({ message: 'Department deactivated' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
