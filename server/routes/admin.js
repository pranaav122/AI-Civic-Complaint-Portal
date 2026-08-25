import { Router } from 'express';
import db from '../db/connection.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all routes in this router
router.use(authenticateToken);

router.get('/users', requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    let query = 'SELECT id, email, full_name, phone, role, preferred_language, created_at FROM users WHERE 1=1';
    const params = [];
    
    if (search) {
      query += ' AND (email LIKE ? OR full_name LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const users = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    
    res.json({ users, total });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id/role', requireRole('super_admin'), (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['citizen', 'admin', 'super_admin', 'department_head'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    db.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(role, req.params.id);
    res.json({ message: 'User role updated' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/complaints/:id/note', requireRole('admin', 'super_admin', 'department_head'), (req, res) => {
  try {
    const { comment } = req.body;
    
    db.prepare('INSERT INTO complaint_updates (complaint_id, status, comment, updated_by, is_internal) VALUES (?, ?, ?, ?, 1)')
      .run(req.params.id, 'internal_note', comment, req.user.id);
      
    res.status(201).json({ message: 'Internal note added' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/complaints/:id/assign', requireRole('admin', 'super_admin', 'department_head'), (req, res) => {
  try {
    const { department_id } = req.body;
    
    db.prepare('UPDATE complaints SET department_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(department_id, req.params.id);
    
    const dept = db.prepare('SELECT name FROM departments WHERE id = ?').get(department_id);
    
    db.prepare('INSERT INTO complaint_updates (complaint_id, status, comment, updated_by) VALUES (?, ?, ?, ?)')
      .run(req.params.id, 'assigned', `Reassigned to ${dept ? dept.name : 'Unknown Department'}`, req.user.id);
      
    res.json({ message: 'Complaint reassigned' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/notifications', (req, res) => {
  try {
    const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/notifications/:id/read', (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
