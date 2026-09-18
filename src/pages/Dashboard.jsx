import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, getMessages, getArticles } from '../api';
import PageHeader from '../components/PageHeader';
import { FolderKanban, MessageSquare, FileText, ArrowUpRight, Activity } from 'lucide-react';

function StatCard({ icon: Icon, label, value, to, accent }) {
  return (
    <Link to={to} className="stat-card group block hover:border-[var(--accent-gold)] transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--badge-bg)] group-hover:border-[var(--accent-gold)] transition-colors">
          <Icon className="w-5 h-5 text-[var(--accent-gold)]" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-gold)] transition-colors" />
      </div>
      <p className="font-sans-title text-4xl font-extrabold text-[var(--text-primary)] mb-1">{value ?? '—'}</p>
      <p className="font-mono-code text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{label}</p>
    </Link>
  );
}

export default function Dashboard() {
  const [projects,  setProjects]  = useState([]);
  const [messages,  setMessages]  = useState([]);
  const [articles,  setArticles]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getProjects(), getMessages(), getArticles()])
      .then(([p, m, a]) => { setProjects(p); setMessages(m); setArticles(a); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        badge="// OVERVIEW"
        title="Dashboard"
        subtitle="Portfolio CMS · all content managed here"
      />

      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard icon={FolderKanban} label="Total Projects" value={loading ? null : projects.length}  to="/projects" />
          <StatCard icon={MessageSquare} label="Inbox Messages" value={loading ? null : messages.length} to="/messages" />
          <StatCard icon={FileText} label="Articles" value={loading ? null : articles.length}             to="/articles" />
        </div>

        {/* Recent projects */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <span className="font-mono-code text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Recent Projects</span>
            <Link to="/projects" className="font-mono-code text-xs text-[var(--accent-gold)] hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Featured</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-8 text-[var(--text-muted)] font-mono-code text-xs">Loading…</td></tr>
                ) : projects.slice(0, 5).map((p) => (
                  <tr key={p._id}>
                    <td>
                      <Link to={`/projects/${p.slug}/edit`} className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors">
                        {p.title}
                      </Link>
                    </td>
                    <td>
                      <span className="badge-glass text-[10px]">{p.category}</span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 font-mono-code text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border
                        ${p.status === 'LIVE'     ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : p.status === 'BUILDING' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                        :                          'border-[var(--border-color)] text-[var(--text-muted)]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'LIVE' ? 'bg-emerald-400 animate-pulse' : p.status === 'BUILDING' ? 'bg-amber-400' : 'bg-[var(--text-muted)]'}`} />
                        {p.status}
                      </span>
                    </td>
                    <td className="font-mono-code text-xs text-[var(--text-muted)]">
                      {p.featured ? '★ Featured' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent messages */}
        {messages.length > 0 && (
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
              <span className="font-mono-code text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Recent Messages</span>
              <Link to="/messages" className="font-mono-code text-xs text-[var(--accent-gold)] hover:underline flex items-center gap-1">
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-[var(--border-color)]">
              {messages.slice(0, 3).map((m) => (
                <div key={m._id} className="px-6 py-4 hover:bg-[var(--bg-card-hover)] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{m.name}</p>
                      <p className="font-mono-code text-[10px] text-[var(--text-muted)]">{m.email}</p>
                      <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-1">{m.subject}</p>
                    </div>
                    <p className="font-mono-code text-[10px] text-[var(--text-muted)] shrink-0 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
