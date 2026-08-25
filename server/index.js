import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import complaintRoutes from './routes/complaints.js';
import departmentRoutes from './routes/departments.js';
import schemeRoutes from './routes/schemes.js';
import analyticsRoutes from './routes/analytics.js';
import adminRoutes from './routes/admin.js';

import db from './db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Config endpoint
app.get('/api/config', (req, res) => {
  res.json({
    constituencyName: process.env.CONSTITUENCY_NAME || 'Model Constituency',
    constituencyNameTamil: process.env.CONSTITUENCY_NAME_TAMIL || 'மாதிரி தொகுதி',
    constituencyState: process.env.CONSTITUENCY_STATE || 'Tamil Nadu',
    centerLat: parseFloat(process.env.CONSTITUENCY_CENTER_LAT || '13.0827'),
    centerLng: parseFloat(process.env.CONSTITUENCY_CENTER_LNG || '80.2707'),
    zoom: parseInt(process.env.CONSTITUENCY_ZOOM || '13', 10),
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Wait for DB to initialize, then start server
async function start() {
  try {
    await db.ready();
    console.log('Database initialized successfully.');
    
    // Create uploads directory if needed
    const uploadsDir = path.resolve(__dirname, 'uploads');
    const fs = await import('fs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://127.0.0.1:${PORT}`);
      console.log(`Constituency: ${process.env.CONSTITUENCY_NAME || 'Model Constituency'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
