import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import db from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedDatabase = async () => {
  await db.ready();
  const departmentCount = db.prepare('SELECT COUNT(*) as count FROM departments').get();
  
  if (departmentCount.count > 0) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding database...');

  // Departments
  const departments = [
    { name: 'Roads & Infrastructure', name_ta: 'சாலை மற்றும் உள்கட்டமைப்பு', code: 'roads' },
    { name: 'Sanitation & Waste', name_ta: 'சுகாதாரம் மற்றும் கழிவு', code: 'sanitation' },
    { name: 'Water Supply', name_ta: 'குடிநீர் வழங்கல்', code: 'water' },
    { name: 'Drainage & Sewerage', name_ta: 'வடிகால் மற்றும் கழிவுநீர்', code: 'drainage' },
    { name: 'Electrical & Streetlights', name_ta: 'மின்சாரம் மற்றும் தெரு விளக்குகள்', code: 'electrical' },
    { name: 'Public Transport', name_ta: 'பொது போக்குவரத்து', code: 'transport' },
    { name: 'General Administration', name_ta: 'பொது நிர்வாகம்', code: 'general' }
  ];

  const insertDept = db.prepare('INSERT INTO departments (name, name_ta, code) VALUES (?, ?, ?)');
  for (const dept of departments) {
    insertDept.run(dept.name, dept.name_ta, dept.code);
  }

  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@demo.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'System Admin';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  
  const insertUser = db.prepare('INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)');
  insertUser.run(adminEmail, hashedPassword, adminName, 'super_admin');

  // Demo citizens
  const citizens = [
    { email: 'citizen1@demo.com', name: 'Ravi Kumar' },
    { email: 'citizen2@demo.com', name: 'Priya Raj' },
    { email: 'citizen3@demo.com', name: 'Karthik S' }
  ];

  const citizenIds = [];
  for (const citizen of citizens) {
    const hash = await bcrypt.hash('password123', 12);
    const result = insertUser.run(citizen.email, hash, citizen.name, 'citizen');
    citizenIds.push(result.lastInsertRowid);
  }

  // Complaints
  const centerLat = parseFloat(process.env.CONSTITUENCY_CENTER_LAT || '13.0827');
  const centerLng = parseFloat(process.env.CONSTITUENCY_CENTER_LNG || '80.2707');

  const complaintsData = [
    { id: 'CSP-2026-000001', desc: 'Large pothole on main road causing accidents', lang: 'en', cat: 'Roads', sub: 'Pothole', sev: 'high', prio: 'high', status: 'assigned', dept: 1, lat: centerLat + 0.01, lng: centerLng + 0.01 },
    { id: 'CSP-2026-000002', desc: 'Garbage not collected for 3 days', lang: 'en', cat: 'Sanitation', sub: 'Garbage Collection', sev: 'medium', prio: 'medium', status: 'submitted', dept: 2, lat: centerLat - 0.01, lng: centerLng + 0.02 },
    { id: 'CSP-2026-000003', desc: 'தண்ணீர் குழாயில் கசிவு', lang: 'ta', cat: 'Water Supply', sub: 'Leakage', sev: 'medium', prio: 'high', status: 'in_progress', dept: 3, lat: centerLat + 0.005, lng: centerLng - 0.015 },
    { id: 'CSP-2026-000004', desc: 'Street light not working in 4th cross street', lang: 'en', cat: 'Electrical', sub: 'Streetlight', sev: 'low', prio: 'low', status: 'resolved', dept: 5, lat: centerLat - 0.02, lng: centerLng - 0.01 },
    { id: 'CSP-2026-000005', desc: 'வடிகால் அடைக்கப்பட்டு மழைநீர் தேங்கியுள்ளது', lang: 'ta', cat: 'Drainage', sub: 'Blockage', sev: 'high', prio: 'critical', status: 'verified', dept: 4, lat: centerLat + 0.015, lng: centerLng + 0.005 },
    { id: 'CSP-2026-000006', desc: 'Bus stop shelter roof broken', lang: 'en', cat: 'Transport', sub: 'Infrastructure', sev: 'medium', prio: 'medium', status: 'assigned', dept: 6, lat: centerLat, lng: centerLng },
    { id: 'CSP-2026-000007', desc: 'சாலை குண்டும் குழியுமாக உள்ளது', lang: 'ta', cat: 'Roads', sub: 'Damage', sev: 'medium', prio: 'medium', status: 'submitted', dept: 1, lat: centerLat + 0.02, lng: centerLng },
    { id: 'CSP-2026-000008', desc: 'Stray dogs menace in the park area', lang: 'en', cat: 'Sanitation', sub: 'Animal Control', sev: 'low', prio: 'low', status: 'assigned', dept: 2, lat: centerLat - 0.01, lng: centerLng - 0.02 },
    { id: 'CSP-2026-000009', desc: 'குடிநீர் வரவில்லை', lang: 'ta', cat: 'Water Supply', sub: 'No Supply', sev: 'high', prio: 'high', status: 'in_progress', dept: 3, lat: centerLat, lng: centerLng + 0.015 },
    { id: 'CSP-2026-000010', desc: 'Open manhole near school', lang: 'en', cat: 'Drainage', sub: 'Open Manhole', sev: 'critical', prio: 'critical', status: 'submitted', dept: 4, lat: centerLat + 0.01, lng: centerLng - 0.01 },
    { id: 'CSP-2026-000011', desc: 'தெரு விளக்கு பகலிலும் எரிகிறது', lang: 'ta', cat: 'Electrical', sub: 'Wastage', sev: 'low', prio: 'low', status: 'assigned', dept: 5, lat: centerLat - 0.015, lng: centerLng + 0.01 },
    { id: 'CSP-2026-000012', desc: 'Traffic signal not functioning at junction', lang: 'en', cat: 'Transport', sub: 'Signal', sev: 'high', prio: 'high', status: 'resolved', dept: 6, lat: centerLat + 0.02, lng: centerLng + 0.02 },
    { id: 'CSP-2026-000013', desc: 'Pavement encroached by vendors', lang: 'en', cat: 'Roads', sub: 'Encroachment', sev: 'medium', prio: 'medium', status: 'assigned', dept: 1, lat: centerLat - 0.005, lng: centerLng - 0.005 },
    { id: 'CSP-2026-000014', desc: 'Public toilet needs cleaning urgently', lang: 'en', cat: 'Sanitation', sub: 'Public Toilet', sev: 'high', prio: 'medium', status: 'in_progress', dept: 2, lat: centerLat, lng: centerLng - 0.02 },
    { id: 'CSP-2026-000015', desc: 'குடிநீரில் கழிவுநீர் கலந்து வருகிறது', lang: 'ta', cat: 'Water Supply', sub: 'Contamination', sev: 'critical', prio: 'critical', status: 'assigned', dept: 3, lat: centerLat + 0.005, lng: centerLng + 0.005 },
    { id: 'CSP-2026-000016', desc: 'Sewage overflowing onto street', lang: 'en', cat: 'Drainage', sub: 'Overflow', sev: 'high', prio: 'high', status: 'submitted', dept: 4, lat: centerLat - 0.02, lng: centerLng + 0.015 },
    { id: 'CSP-2026-000017', desc: 'மின்சாரம் அடிக்கடி துண்டிக்கப்படுகிறது', lang: 'ta', cat: 'Electrical', sub: 'Power Cut', sev: 'medium', prio: 'medium', status: 'assigned', dept: 5, lat: centerLat + 0.015, lng: centerLng - 0.005 },
    { id: 'CSP-2026-000018', desc: 'Bus route 45C not coming on time', lang: 'en', cat: 'Transport', sub: 'Bus Frequency', sev: 'low', prio: 'low', status: 'assigned', dept: 6, lat: centerLat - 0.015, lng: centerLng - 0.015 },
    { id: 'CSP-2026-000019', desc: 'Tree fallen blocking the road', lang: 'en', cat: 'Roads', sub: 'Blockage', sev: 'critical', prio: 'critical', status: 'resolved', dept: 1, lat: centerLat + 0.005, lng: centerLng + 0.02 },
    { id: 'CSP-2026-000020', desc: 'குப்பை தொட்டி நிரம்பி வழிகிறது', lang: 'ta', cat: 'Sanitation', sub: 'Overflowing Bin', sev: 'medium', prio: 'medium', status: 'verified', dept: 2, lat: centerLat - 0.005, lng: centerLng + 0.01 }
  ];

  const insertComplaint = db.prepare(`
    INSERT INTO complaints (
      complaint_id, user_id, description, description_language, category, subcategory, 
      severity, priority, status, department_id, latitude, longitude, is_demo, 
      ai_analysis, ai_priority_explanation
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `);

  const insertUpdate = db.prepare('INSERT INTO complaint_updates (complaint_id, status, comment) VALUES (?, ?, ?)');

  for (let i = 0; i < complaintsData.length; i++) {
    const data = complaintsData[i];
    const userId = citizenIds[i % citizenIds.length];
    
    const result = insertComplaint.run(
      data.id, userId, data.desc, data.lang, data.cat, data.sub,
      data.sev, data.prio, data.status, data.dept, data.lat, data.lng,
      JSON.stringify({ category: data.cat, severity: data.sev }),
      'Based on keywords in description.'
    );

    const dbId = result.lastInsertRowid;
    insertUpdate.run(dbId, 'submitted', 'Complaint submitted [DEMO]');
    
    if (data.status !== 'submitted') {
      insertUpdate.run(dbId, 'ai_classified', 'AI Classification complete [DEMO]');
      if (['assigned', 'in_progress', 'resolved', 'verified'].includes(data.status)) {
         insertUpdate.run(dbId, 'assigned', 'Assigned to department [DEMO]');
      }
      if (['in_progress', 'resolved', 'verified'].includes(data.status)) {
         insertUpdate.run(dbId, 'in_progress', 'Work started [DEMO]');
      }
      if (['resolved', 'verified'].includes(data.status)) {
         insertUpdate.run(dbId, 'resolved', 'Issue fixed [DEMO]');
      }
      if (data.status === 'verified') {
         insertUpdate.run(dbId, 'verified', 'Citizen confirmed resolution [DEMO]');
         db.prepare("UPDATE complaints SET citizen_verified = 1, citizen_feedback = 'Good work', resolved_at = CURRENT_TIMESTAMP WHERE id = ?").run(dbId);
      }
      if (data.status === 'resolved') {
         db.prepare("UPDATE complaints SET resolved_at = CURRENT_TIMESTAMP WHERE id = ?").run(dbId);
      }
    }
  }

  // Schemes
  const schemesData = [
    { name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)', name_ta: 'பிரதான் மந்திரி கிசான் சம்மான் நிதி', desc: 'Financial benefit to landholding farmer families.', desc_ta: 'நிலம் வைத்திருக்கும் விவசாய குடும்பங்களுக்கு நிதி உதவி.', dept: 'Agriculture', for_students: 0, for_disabled: 0 },
    { name: 'Ayushman Bharat - PMJAY', name_ta: 'ஆயுஷ்மான் பாரத்', desc: 'Health insurance cover of Rs. 5 lakhs per family per year.', desc_ta: 'ஆண்டுக்கு ரூ. 5 லட்சம் மருத்துவ காப்பீடு.', dept: 'Health', for_students: 0, for_disabled: 0 },
    { name: 'Post-Matric Scholarship for SC/ST Students', name_ta: 'பிற்படுத்தப்பட்டோர் கல்வி உதவித்தொகை', desc: 'Financial assistance to SC/ST students studying at post-matriculation.', desc_ta: 'பள்ளிக்கு பிந்தைய கல்வி பயிலும் மாணவர்களுக்கு உதவித்தொகை.', dept: 'Education', for_students: 1, for_disabled: 0 },
    { name: 'Pradhan Mantri Awas Yojana (PMAY)', name_ta: 'பிரதான் மந்திரி ஆவாஸ் யோஜனா', desc: 'Affordable housing for the urban poor.', desc_ta: 'நகர்ப்புற ஏழைகளுக்கு கட்டுப்படியாகக்கூடிய வீடு.', dept: 'Housing', for_students: 0, for_disabled: 0 },
    { name: 'Mahatma Gandhi NREGA', name_ta: 'மகாத்மா காந்தி வேலைவாய்ப்பு உறுதி திட்டம்', desc: '100 days of wage employment in a financial year.', desc_ta: 'ஒரு நிதியாண்டில் 100 நாட்கள் வேலைவாய்ப்பு.', dept: 'Rural Development', for_students: 0, for_disabled: 0 },
    { name: 'PM Vishwakarma Yojana', name_ta: 'பிஎம் விஸ்வகர்மா யோஜனா', desc: 'Support to traditional artisans and craftspeople.', desc_ta: 'பாரம்பரிய கைவினைஞர்களுக்கு ஆதரவு.', dept: 'MSME', for_students: 0, for_disabled: 0 },
    { name: 'National Apprenticeship Training Scheme', name_ta: 'தேசிய பயிற்சி திட்டம்', desc: 'Skill training for youth.', desc_ta: 'இளைஞர்களுக்கான திறன் மேம்பாட்டு பயிற்சி.', dept: 'Skill Development', for_students: 1, for_disabled: 0 },
    { name: 'Pradhan Mantri Mudra Yojana', name_ta: 'பிரதான் மந்திரி முத்ரா யோஜனா', desc: 'Loans up to 10 lakhs to non-corporate, non-farm small/micro enterprises.', desc_ta: 'சிறு தொழில்களுக்கு ரூ.10 லட்சம் வரை கடன்.', dept: 'Finance', for_students: 0, for_disabled: 0 },
    { name: 'Tamil Nadu Chief Minister\'s Health Insurance', name_ta: 'முதலமைச்சரின் விரிவான மருத்துவ காப்பீட்டுத் திட்டம்', desc: 'Health insurance scheme for poor families in Tamil Nadu.', desc_ta: 'தமிழ்நாட்டில் உள்ள ஏழை குடும்பங்களுக்கான மருத்துவ காப்பீட்டுத் திட்டம்.', dept: 'Health', for_students: 0, for_disabled: 0 },
    { name: 'Tamil Nadu Free Laptop Scheme for Students', name_ta: 'இலவச மடிக்கணினி திட்டம்', desc: 'Free laptops for students passing 12th standard.', desc_ta: '12-ஆம் வகுப்பு தேர்ச்சி பெற்ற மாணவர்களுக்கு இலவச மடிக்கணினி.', dept: 'Education', for_students: 1, for_disabled: 0 }
  ];

  const insertScheme = db.prepare('INSERT INTO schemes (name, name_ta, description, description_ta, department, for_students, for_disabled, is_demo) VALUES (?, ?, ?, ?, ?, ?, ?, 1)');
  
  for (const scheme of schemesData) {
    insertScheme.run(scheme.name, scheme.name_ta, scheme.desc, scheme.desc_ta, scheme.dept, scheme.for_students, scheme.for_disabled);
  }

  console.log('Seeding completed successfully!');
  console.log(`Summary:`);
  console.log(`- Admin User: ${adminEmail}`);
  console.log(`- Citizens: ${citizens.length}`);
  console.log(`- Departments: ${departments.length}`);
  console.log(`- Complaints: ${complaintsData.length}`);
  console.log(`- Schemes: ${schemesData.length}`);
};

seedDatabase().then(() => {
  db.close();
  process.exit(0);
}).catch((err) => {
  console.error(err);
  db.close();
  process.exit(1);
});
