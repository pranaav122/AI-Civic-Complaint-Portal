import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './i18n/LanguageContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Error Boundary to catch and display runtime errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('React Error Boundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ color: '#ef4444', fontSize: '24px' }}>Something went wrong</h1>
          <pre style={{ background: '#fef2f2', padding: '20px', borderRadius: '8px', overflow: 'auto', fontSize: '14px', color: '#991b1b' }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.errorInfo?.componentStack}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: '16px', padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy load citizen pages
const Home = lazy(() => import('./pages/Home'));
const ReportIssue = lazy(() => import('./pages/ReportIssue'));
const MyComplaints = lazy(() => import('./pages/MyComplaints'));
const ComplaintDetail = lazy(() => import('./pages/ComplaintDetail'));
const SchemeFinder = lazy(() => import('./pages/SchemeFinder'));
const ConstituencyDashboard = lazy(() => import('./pages/ConstituencyDashboard'));
const Login = lazy(() => import('./pages/Login'));
const Help = lazy(() => import('./pages/Help'));

// Lazy load admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminComplaints = lazy(() => import('./pages/admin/Complaints'));
const AdminComplaintManage = lazy(() => import('./pages/admin/ComplaintManage'));
const AdminMapView = lazy(() => import('./pages/admin/MapView'));
const AdminDepartments = lazy(() => import('./pages/admin/Departments'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));
const AdminSchemes = lazy(() => import('./pages/admin/Schemes'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <Layout>
            <Suspense fallback={<div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div></div>}>
              <Routes>
                {/* Citizen Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/report" element={<ReportIssue />} />
                <Route path="/my-complaints" element={<MyComplaints />} />
                <Route path="/complaints/:id" element={<ComplaintDetail />} />
                <Route path="/schemes" element={<SchemeFinder />} />
                <Route path="/dashboard" element={<ConstituencyDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Login />} />
                <Route path="/help" element={<Help />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute roles={['admin', 'super_admin', 'department_head']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/complaints" element={<ProtectedRoute roles={['admin', 'super_admin', 'department_head']}><AdminComplaints /></ProtectedRoute>} />
                <Route path="/admin/complaints/:id" element={<ProtectedRoute roles={['admin', 'super_admin', 'department_head']}><AdminComplaintManage /></ProtectedRoute>} />
                <Route path="/admin/map" element={<ProtectedRoute roles={['admin', 'super_admin', 'department_head']}><AdminMapView /></ProtectedRoute>} />
                <Route path="/admin/departments" element={<ProtectedRoute roles={['admin', 'super_admin']}><AdminDepartments /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin', 'super_admin', 'department_head']}><AdminAnalytics /></ProtectedRoute>} />
                <Route path="/admin/schemes" element={<ProtectedRoute roles={['admin', 'super_admin']}><AdminSchemes /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute roles={['super_admin']}><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute roles={['admin', 'super_admin']}><AdminSettings /></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </Layout>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
