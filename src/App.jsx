import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth';
import AdminLayout from './components/AdminLayout';
import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import Projects   from './pages/Projects';
import ProjectForm from './pages/ProjectForm';
import Decisions  from './pages/Decisions';
import ProjectPhotos from './pages/ProjectPhotos';
import HeroSettings from './pages/HeroSettings';
import Messages   from './pages/Messages';
import Articles   from './pages/Articles';
import Testimonials from './pages/Testimonials';

export default function App() {
  const { isAuth } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuth ? <Navigate to="/" replace /> : <Login />} />

      <Route element={<AdminLayout />}>
        <Route index           element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/new"        element={<ProjectForm />} />
        <Route path="projects/:slug/edit" element={<ProjectForm />} />
        <Route path="projects/:slug/decisions" element={<Decisions />} />
        <Route path="projects/:slug/photos"    element={<ProjectPhotos />} />
        <Route path="hero"     element={<HeroSettings />} />
        <Route path="messages" element={<Messages />} />
        <Route path="articles" element={<Articles />} />
        <Route path="testimonials" element={<Testimonials />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
