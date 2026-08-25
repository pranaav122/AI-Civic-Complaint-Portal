import { Router } from 'express';
import db from '../db/connection.js';

const router = Router();

router.get('/overview', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM complaints').get().count;
    const pending = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status IN ('submitted', 'ai_classified', 'assigned')").get().count;
    const inProgress = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'in_progress'").get().count;
    const resolved = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status IN ('resolved', 'verified')").get().count;
    const verified = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'verified'").get().count;
    const newComplaints = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE created_at >= datetime('now', '-1 day')").get().count;
    
    const avgResTimeRow = db.prepare("SELECT AVG(julianday(resolved_at) - julianday(created_at)) * 24 as avg_hours FROM complaints WHERE resolved_at IS NOT NULL").get();
    
    res.json({
      total, pending, inProgress, resolved, verified, newComplaints,
      resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
      avgResolutionHours: avgResTimeRow.avg_hours || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/by-category', (req, res) => {
  try {
    const data = db.prepare('SELECT category, COUNT(*) as count FROM complaints GROUP BY category').all();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/by-area', (req, res) => {
  try {
    const data = db.prepare('SELECT ward, COUNT(*) as count FROM complaints WHERE ward IS NOT NULL GROUP BY ward').all();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/by-department', (req, res) => {
  try {
    const data = db.prepare(`
      SELECT d.name as department, COUNT(c.id) as count 
      FROM complaints c 
      JOIN departments d ON c.department_id = d.id 
      GROUP BY d.id
    `).all();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/trends', (req, res) => {
  try {
    const data = db.prepare(`
      SELECT date(created_at) as date, COUNT(*) as count 
      FROM complaints 
      WHERE created_at >= date('now', '-30 days') 
      GROUP BY date(created_at) 
      ORDER BY date(created_at) ASC
    `).all();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/heatmap', (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT latitude, longitude, severity, category FROM complaints WHERE latitude IS NOT NULL AND longitude IS NOT NULL';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    const data = db.prepare(query).all(...params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/public', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM complaints').get().count;
    const resolved = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status IN ('resolved', 'verified')").get().count;
    const verified = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE status = 'verified'").get().count;
    
    res.json({
      total,
      resolved,
      verified,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/priority-distribution', (req, res) => {
  try {
    const data = db.prepare('SELECT priority, COUNT(*) as count FROM complaints GROUP BY priority').all();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/department-performance', (req, res) => {
  try {
    const data = db.prepare(`
      SELECT d.name as department, 
             COUNT(c.id) as total,
             SUM(CASE WHEN c.status IN ('resolved', 'verified') THEN 1 ELSE 0 END) as resolved,
             AVG(CASE WHEN c.resolved_at IS NOT NULL THEN (julianday(c.resolved_at) - julianday(c.created_at)) * 24 ELSE NULL END) as avg_resolution_hours
      FROM departments d
      LEFT JOIN complaints c ON d.id = c.department_id
      GROUP BY d.id
    `).all();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
