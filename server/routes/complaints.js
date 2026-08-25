import { Router } from 'express';
import db from '../db/connection.js';
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { classifyComplaint } from '../services/ai.js';

const router = Router();

const generateComplaintId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `CSP-${year}-${randomNum}`;
};

router.post('/', optionalAuth, upload.array('media', 5), async (req, res) => {
  try {
    const { description, latitude, longitude, address, ward } = req.body;
    const userId = req.user ? req.user.id : null;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const complaintId = generateComplaintId();
    let imagePath = null;
    
    if (req.files && req.files.length > 0) {
      imagePath = req.files[0].path;
    }

    const aiResult = await classifyComplaint(description, imagePath);
    
    let departmentId = null;
    if (aiResult.department_code) {
      const dept = db.prepare('SELECT id FROM departments WHERE code = ?').get(aiResult.department_code);
      if (dept) departmentId = dept.id;
    }

    const insertComplaint = db.prepare(`
      INSERT INTO complaints (
        complaint_id, user_id, description, category, subcategory, 
        severity, priority, department_id, latitude, longitude, address, ward,
        ai_analysis, ai_priority_explanation, description_language
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertComplaint.run(
      complaintId, userId, description, aiResult.category, aiResult.subcategory,
      aiResult.severity, aiResult.priority, departmentId, latitude, longitude, address, ward,
      JSON.stringify(aiResult), aiResult.explanation, aiResult.language_detected
    );

    const dbId = result.lastInsertRowid;

    if (req.files && req.files.length > 0) {
      const insertMedia = db.prepare('INSERT INTO complaint_media (complaint_id, file_path, file_type, original_name) VALUES (?, ?, ?, ?)');
      for (const file of req.files) {
        insertMedia.run(dbId, file.filename, file.mimetype, file.originalname);
      }
    }

    const insertUpdate = db.prepare('INSERT INTO complaint_updates (complaint_id, status, comment, updated_by) VALUES (?, ?, ?, ?)');
    insertUpdate.run(dbId, 'submitted', 'Complaint submitted successfully.', userId);
    
    if (aiResult.category) {
      insertUpdate.run(dbId, 'ai_classified', 'AI classification applied.', null);
    }

    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(dbId);
    res.status(201).json({ ...complaint, ai_analysis_details: aiResult });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', optionalAuth, (req, res) => {
  try {
    const { status, category, priority, department_id, search, page = 1, limit = 10, sort = 'desc' } = req.query;
    
    let query = `
      SELECT c.*, d.name as department_name, d.name_ta as department_name_ta 
      FROM complaints c
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user?.role === 'citizen') {
      query += ' AND c.user_id = ?';
      params.push(req.user.id);
    } else if (!req.user || req.user.role === 'citizen') {
      // If not logged in, optionally restrict or show only public info
      // Assuming public demo mode shows all unless restricted
    }

    if (status) { query += ' AND c.status = ?'; params.push(status); }
    if (category) { query += ' AND c.category = ?'; params.push(category); }
    if (priority) { query += ' AND c.priority = ?'; params.push(priority); }
    if (department_id) { query += ' AND c.department_id = ?'; params.push(department_id); }
    
    if (search) {
      query += ' AND (c.complaint_id LIKE ? OR c.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += sort === 'asc' ? ' ORDER BY c.created_at ASC' : ' ORDER BY c.created_at DESC';
    
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const complaints = db.prepare(query).all(...params);
    
    const mediaStmt = db.prepare('SELECT * FROM complaint_media WHERE complaint_id = ?');
    for (const c of complaints) {
      c.media = mediaStmt.all(c.id);
    }

    res.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', optionalAuth, (req, res) => {
  try {
    const isNumeric = /^\d+$/.test(req.params.id);
    const query = isNumeric ? 'SELECT c.*, d.name as department_name, d.name_ta as department_name_ta FROM complaints c LEFT JOIN departments d ON c.department_id = d.id WHERE c.id = ?' 
                           : 'SELECT c.*, d.name as department_name, d.name_ta as department_name_ta FROM complaints c LEFT JOIN departments d ON c.department_id = d.id WHERE c.complaint_id = ?';
                           
    const complaint = db.prepare(query).get(req.params.id);
    
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    
    complaint.media = db.prepare('SELECT * FROM complaint_media WHERE complaint_id = ?').all(complaint.id);
    complaint.updates = db.prepare('SELECT * FROM complaint_updates WHERE complaint_id = ? ORDER BY created_at ASC').all(complaint.id);
    
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, requireRole('admin', 'super_admin', 'department_head'), (req, res) => {
  try {
    const { status, priority, department_id, expected_resolution_days, comment } = req.body;
    const complaintId = req.params.id;
    
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(complaintId);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    let updateQuery = 'UPDATE complaints SET updated_at = CURRENT_TIMESTAMP';
    const params = [];
    
    if (status) { updateQuery += ', status = ?'; params.push(status); }
    if (priority) { updateQuery += ', priority = ?'; params.push(priority); }
    if (department_id) { updateQuery += ', department_id = ?'; params.push(department_id); }
    if (expected_resolution_days) { updateQuery += ', expected_resolution_days = ?'; params.push(expected_resolution_days); }
    
    if (status === 'resolved') {
      updateQuery += ', resolved_at = CURRENT_TIMESTAMP';
    }

    updateQuery += ' WHERE id = ?';
    params.push(complaintId);
    
    db.prepare(updateQuery).run(...params);
    
    if (status || comment) {
      db.prepare('INSERT INTO complaint_updates (complaint_id, status, comment, updated_by) VALUES (?, ?, ?, ?)')
        .run(complaintId, status || complaint.status, comment || `Status updated to ${status}`, req.user.id);
    }
    
    if (complaint.user_id) {
      db.prepare('INSERT INTO notifications (user_id, title, message, complaint_id) VALUES (?, ?, ?, ?)')
        .run(complaint.user_id, 'Complaint Updated', `Your complaint ${complaint.complaint_id} has been updated.`, complaintId);
    }
    
    res.json({ message: 'Complaint updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/verify', authenticateToken, (req, res) => {
  try {
    const complaintId = req.params.id;
    const { feedback } = req.body;
    
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(complaintId);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    
    if (complaint.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the creator can verify' });
    }
    
    db.prepare('UPDATE complaints SET citizen_verified = 1, citizen_feedback = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(feedback, 'verified', complaintId);
      
    db.prepare('INSERT INTO complaint_updates (complaint_id, status, comment, updated_by) VALUES (?, ?, ?, ?)')
      .run(complaintId, 'verified', 'Citizen verified resolution.', req.user.id);
      
    res.json({ message: 'Complaint verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/similar', optionalAuth, (req, res) => {
  try {
    const complaintId = req.params.id;
    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(complaintId);
    
    if (!complaint || !complaint.latitude || !complaint.longitude) {
      return res.json([]);
    }
    
    const latDiff = 0.01;
    const lngDiff = 0.01;
    
    const similar = db.prepare(`
      SELECT * FROM complaints 
      WHERE id != ? 
      AND category = ? 
      AND latitude BETWEEN ? AND ? 
      AND longitude BETWEEN ? AND ?
      LIMIT 10
    `).all(
      complaintId, complaint.category, 
      complaint.latitude - latDiff, complaint.latitude + latDiff,
      complaint.longitude - lngDiff, complaint.longitude + lngDiff
    );
    
    res.json(similar);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
