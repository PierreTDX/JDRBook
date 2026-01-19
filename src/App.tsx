// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ApiService } from './services/api.mock'; // Import du service
import Login from './pages/Login';
import AssociationList from './pages/AssociationList';
import RoomList from './pages/RoomList';
import RoomDetails from './pages/RoomDetails';
import PlayerDashboard from './pages/PlayerDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Layout avec vérification dynamique des droits
const Layout = ({ children }: { children: React.ReactNode }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem('token');

  // État pour savoir si l'utilisateur est admin quelque part
  const [isAssociationAdmin, setIsAssociationAdmin] = useState(false);

  useEffect(() => {
    // Si l'utilisateur est connecté, on vérifie ses rôles
    if (token && user) {
      ApiService.getAssociations()
        .then(associations => {
          // Vérifie si au moins une association a le rôle ADMIN
          const hasAdminRights = associations.some(assoc => assoc.userRole === 'ADMIN');
          setIsAssociationAdmin(hasAdminRights);
        })
        .catch(err => console.error("Erreur vérification droits", err));
    }
  }, [token, user]); // Se re-déclenche si le user change

  return (
    <>
      <nav style={{
        borderBottom: '1px solid var(--border)',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--bg-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>🎲 RPG Booking</span>

          <div style={{ display: 'flex', gap: '15px', marginLeft: '20px' }}>
            <Link to="/associations" style={{ fontSize: '0.9rem' }}>Associations</Link>
            <Link to="/dashboard" style={{ fontSize: '0.9rem' }}>Mes Parties</Link>

            {/* Affichage conditionnel basé sur le RÔLE réel */}
            {isAssociationAdmin && (
              <Link to="/admin" style={{ fontSize: '0.9rem', color: '#f59e0b' }}>Admin</Link>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user && <span style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>👤 {user.username}</span>}

          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              // Force un rechargement complet pour nettoyer les états
              window.location.href = '/login';
            }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Déconnexion
          </button>
        </div>
      </nav>
      <main style={{ paddingBottom: '50px' }}>{children}</main>
    </>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/associations" element={
          <ProtectedRoute>
            <AssociationList />
          </ProtectedRoute>
        } />

        <Route path="/associations/:id/rooms" element={
          <ProtectedRoute>
            <RoomList />
          </ProtectedRoute>
        } />

        <Route path="/rooms/:id" element={
          <ProtectedRoute>
            <RoomDetails />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <PlayerDashboard />
          </ProtectedRoute>}
        />

        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;