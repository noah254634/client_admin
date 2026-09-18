import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth';
import AdminNavbar from './AdminNavbar';

export default function AdminLayout() {
  const { isAuth } = useAuth();
  if (!isAuth) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Outlet />
      </main>
    </div>
  );
}
