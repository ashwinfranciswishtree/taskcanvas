import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Feedback from './pages/Feedback';
import Creatives from './pages/Creatives';
import Approval from './pages/Approval';
import Completed from './pages/Completed';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import Rejected from './pages/Rejected';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <Toaster position="top-right" toastOptions={{ className: 'font-medium' }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          
          <Route path="/feedback" element={
            <ProtectedRoute roles={['Admin', 'Designer', 'Manager']}>
              <Layout><Feedback /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/creatives" element={
            <ProtectedRoute roles={['Admin', 'Designer', 'Manager']}>
              <Layout><Creatives /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/approval" element={
            <ProtectedRoute roles={['Admin', 'Manager', 'Digital Marketing']}>
              <Layout><Approval /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/completed" element={
            <ProtectedRoute roles={['Admin', 'Designer', 'Manager', 'Digital Marketing']}>
              <Layout><Completed /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/rejected" element={
            <ProtectedRoute roles={['Admin', 'Designer', 'Manager', 'Digital Marketing']}>
              <Layout><Rejected /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/users" element={
            <ProtectedRoute roles={['Admin']}>
              <Layout><UserManagement /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute roles={['Admin']}>
              <Layout><Settings /></Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
