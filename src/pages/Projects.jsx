import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProjects, deleteProject } from '../api';
import PageHeader from '../components/PageHeader';
import Toast from '../components/Toast';
import { Plus, Pencil, Trash2, BookOpen, ArrowUpRight, Image as ImageIcon } from 'lucide-react';

const STATUS_STYLES = {
  LIVE:      'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  BUILDING:  'border-amber-500/30  bg-amber-500/10  text-amber-400',
  TESTING:   'border-sky-500/30    bg-sky-500/10    text-sky-400',
  PROTOTYPE: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  ARCHIVED:  'border-[var(--border-color)] text-[var(--text-muted)]',
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getProjects();
    setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (slug, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteProject(slug);
      setToast({ message: `"${title}" deleted`, type: 'success' });
      setProjects(prev => prev.filter(p => p.slug !== slug));
    } catch {
      setToast({ message: 'Failed to delete project', type: 'error' });
    }
  };

  return (
    <>
      <PageHeader
        badge="// 01 PROJECTS"
        title="Projects"
        subtitle="Create, edit, and manage all portfolio projects and photo catalogues"
        actions={
          <Link to="/projects/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        }
      />

      <div className="space-y-6">
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-[var(--text-muted)] font-mono-code text-xs">Loading projects…</td></tr>
                ) : projects.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-[var(--text-muted)] font-mono-code text-xs">No projects yet. Create one.</td></tr>
                ) : projects.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <p className="font-semibold text-[var(--text-primary)]">{p.title}</p>
                      <p className="text-[var(--text-muted)] text-xs mt-0.5 line-clamp-1 max-w-xs">{p.description}</p>
                    </td>
                    <td>
                      <span className="font-mono-code text-xs text-[var(--text-muted)]">{p.slug}</span>
                    </td>
                    <td>
                      <span className="badge-glass">{p.category}</span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 font-mono-code text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[p.status] || STATUS_STYLES.ARCHIVED}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          p.status === 'LIVE'
                            ? 'bg-emerald-400 animate-pulse'
                            : p.status === 'BUILDING'
                            ? 'bg-amber-400 animate-pulse'
                            : p.status === 'TESTING'
                            ? 'bg-sky-400 animate-pulse'
                            : p.status === 'PROTOTYPE'
                            ? 'bg-purple-400'
                            : 'bg-[var(--text-muted)]'
                        }`} />
                        {p.status}
                      </span>
                    </td>
                    <td className="font-mono-code text-xs text-[var(--text-muted)]">
                      {p.featured ? '★' : '—'}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/projects/${p.slug}/edit`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--badge-bg)]
                                     text-xs font-mono-code text-[var(--text-secondary)] hover:border-[var(--accent-gold)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </Link>
                        <Link
                          to={`/projects/${p.slug}/photos`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--badge-bg)]
                                     text-xs font-mono-code text-[var(--text-secondary)] hover:border-[var(--accent-gold)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          <ImageIcon className="w-3 h-3 text-[var(--accent-gold)]" /> Photos
                        </Link>
                        <Link
                          to={`/projects/${p.slug}/decisions`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--badge-bg)]
                                     text-xs font-mono-code text-[var(--text-secondary)] hover:border-[var(--accent-gold)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          <BookOpen className="w-3 h-3" /> Decisions
                        </Link>
                        <button
                          onClick={() => handleDelete(p.slug, p.title)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5
                                     text-xs font-mono-code text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
