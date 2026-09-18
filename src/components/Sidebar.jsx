import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import {
  LayoutDashboard, FolderKanban, MessageSquare,
  FileText, LogOut,
} from 'lucide-react';

const NAV_LINKS = [
  { to: '/',         label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Projects',  Icon: FolderKanban,   end: false },
  { to: '/messages', label: 'Messages',  Icon: MessageSquare,  end: false },
  { to: '/articles', label: 'Articles',  Icon: FileText,        end: false },
];

export default function Sidebar() {
  const { admin, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">

      {/* ── Brand ── */}
      <div className="px-5 py-5 border-b border-[var(--border-color)]">
        <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-[var(--accent-dark)] text-[var(--bg-primary)] font-mono-code font-bold text-xs flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            NK
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">Noah Khaemba</span>
            <span className="font-mono-code text-[9px] uppercase tracking-widest text-[var(--text-muted)]">Admin Panel</span>
          </div>
        </a>
      </div>

      {/* ── Nav links ── */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_LINKS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
               ${isActive
                 ? 'bg-[var(--glow-color)] text-[var(--accent-gold)] border border-[var(--accent-gold)]/20'
                 : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
               }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="px-3 py-4 border-t border-[var(--border-color)]">
        {admin && (
          <p className="font-mono-code text-[9px] uppercase tracking-widest text-[var(--text-muted)] px-1 mb-3">
            Signed in as <span className="text-[var(--text-secondary)]">{admin.username}</span>
          </p>
        )}
        <button
          onClick={() => { signOut(); navigate('/login'); }}
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-400
                     hover:bg-red-400/10 transition-colors duration-150"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>

    </aside>
  );
}
