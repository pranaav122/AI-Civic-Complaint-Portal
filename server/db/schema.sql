-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'citizen' CHECK(role IN ('citizen', 'admin', 'super_admin', 'department_head')),
  preferred_language TEXT DEFAULT 'en' CHECK(preferred_language IN ('en', 'ta')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_ta TEXT,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  head_name TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Complaints
CREATE TABLE IF NOT EXISTS complaints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  complaint_id TEXT UNIQUE NOT NULL,
  user_id INTEGER,
  description TEXT NOT NULL,
  description_language TEXT DEFAULT 'en',
  category TEXT,
  subcategory TEXT,
  severity TEXT CHECK(severity IN ('low', 'medium', 'high', 'critical')),
  priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'submitted' CHECK(status IN ('submitted', 'ai_classified', 'assigned', 'in_progress', 'resolved', 'verified', 'rejected')),
  department_id INTEGER,
  latitude REAL,
  longitude REAL,
  address TEXT,
  ward TEXT,
  ai_analysis TEXT,
  ai_priority_explanation TEXT,
  expected_resolution_days INTEGER DEFAULT 7,
  is_demo INTEGER DEFAULT 0,
  citizen_verified INTEGER DEFAULT 0,
  citizen_feedback TEXT,
  duplicate_group_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(department_id) REFERENCES departments(id)
);

-- Complaint media
CREATE TABLE IF NOT EXISTS complaint_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  complaint_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  original_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- Complaint updates (timeline)
CREATE TABLE IF NOT EXISTS complaint_updates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  complaint_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  comment TEXT,
  updated_by INTEGER,
  is_internal INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY(updated_by) REFERENCES users(id)
);

-- Government schemes
CREATE TABLE IF NOT EXISTS schemes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_ta TEXT,
  description TEXT,
  description_ta TEXT,
  eligibility_criteria TEXT,
  required_documents TEXT,
  application_process TEXT,
  application_link TEXT,
  department TEXT,
  deadline TEXT,
  min_age INTEGER,
  max_age INTEGER,
  max_income INTEGER,
  gender TEXT,
  education_level TEXT,
  occupation TEXT,
  for_students INTEGER DEFAULT 0,
  for_disabled INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  is_demo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  complaint_id INTEGER,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_user ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_dept ON complaints(department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_coords ON complaints(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_complaints_complaint_id ON complaints(complaint_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
