import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import {
  LayoutDashboard, FolderKanban, MessageSquare,
  FileText, MessageCircle, LogOut, Sun, Moon, ExternalLink, Menu, X, Shield, User
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',         label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Projects',  icon: FolderKanban,   end: false },
  { to: '/hero',     label: 'Hero & CV', icon: User,           end: false },
  { to: '/messages', label: 'Messages',  icon: MessageSquare,  end: false },
  { to: '/articles', label: 'Articles',  icon: FileText,        end: false },
  { to: '/testimonials', label: 'Testimonials', icon: MessageCircle, end: false },
];

export default function AdminNavbar() {
  const { admin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('admin_theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin_theme', 'light');
    }
  }, [isDark]);

  return (
    <header className="fixed top-4 inset-x-0 z-50 pointer-events-none px-4 sm:px-6 lg:px-8">
      {/* Floating Pill Nav Bar Container */}
      <div className="pointer-events-auto max-w-7xl mx-auto bg-[var(--bg-card)]/90 backdrop-blur-xl rounded-full border border-[var(--border-color)] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] h-14 px-5 sm:px-6 flex items-center justify-between transition-colors duration-300">

        {/* Left: Brand Monogram & Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-dark)] text-[var(--bg-primary)] font-mono-code font-bold text-xs flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              NK
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-tight text-[var(--text-primary)]">
                Noah Khaemba
              </span>
              <span className="text-[9px] font-mono-code uppercase tracking-widest text-[var(--accent-gold)] flex items-center gap-1 font-bold">
                <Shield className="w-2.5 h-2.5 inline" /> CMS ADMIN
              </span>
            </div>
          </NavLink>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-xs font-bold font-mono-code uppercase tracking-wider transition-all duration-200 flex items-center gap-2
                 ${isActive
                   ? 'bg-[var(--accent-dark)] text-[var(--bg-primary)] shadow-sm'
                   : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--badge-bg)]'
                 }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Actions, Theme Toggle, Profile & Logout */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Status Badge */}
          <span className="hidden lg:flex text-[10px] font-mono-code uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE SYSTEM
          </span>

          {/* Public Site Link */}
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full border border-[var(--border-color)] bg-[var(--badge-bg)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-gold)] transition-colors"
            title="View Public Site"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-8 h-8 rounded-full border border-[var(--border-color)] bg-[var(--badge-bg)] flex items-center justify-center text-[var(--text-primary)] hover:border-[var(--accent-gold)] transition-colors"
            title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            )}
          </button>

          {/* Sign Out Button */}
          <button
            onClick={() => { signOut(); navigate('/login'); }}
            className="hidden sm:flex items-center gap-1.5 text-xs font-mono-code font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all"
            title={admin?.email ? `Sign out (${admin.email})` : 'Sign out'}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden w-8 h-8 rounded-full border border-[var(--border-color)] bg-[var(--badge-bg)] flex items-center justify-center text-[var(--text-primary)] hover:border-[var(--accent-gold)] transition-colors"
            aria-label="Toggle Mobile Navigation"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="pointer-events-auto md:hidden max-w-7xl mx-auto mt-2 bg-[var(--bg-card)]/95 backdrop-blur-xl rounded-2xl border border-[var(--border-color)] shadow-xl overflow-hidden animate-fade-in">
          <nav className="flex flex-col py-2">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-5 py-3 text-xs font-mono-code font-bold uppercase tracking-wider flex items-center gap-3 border-b border-[var(--border-color)] last:border-0 transition-colors
                   ${isActive
                     ? 'bg-[var(--accent-dark)] text-[var(--bg-primary)]'
                     : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                   }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}

            <div className="px-5 py-3 flex items-center justify-between bg-[var(--badge-bg)] mt-1">
              {admin && (
                <span className="font-mono-code text-[10px] text-[var(--text-muted)] truncate max-w-[200px]">
                  {admin.email}
                </span>
              )}
              <button
                onClick={() => { setMobileOpen(false); signOut(); navigate('/login'); }}
                className="text-xs font-mono-code font-bold text-red-500 hover:underline flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
