import React, { useEffect, useState, useCallback } from 'react';
import { getArticles, createArticle } from '../api';
import PageHeader from '../components/PageHeader';
import Toast from '../components/Toast';
import { Plus, FileText, X } from 'lucide-react';

export default function Articles() {
  const [articles,  setArticles]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', published: false });

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getArticles().catch(() => []);
    setArticles(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await createArticle(form);
      setArticles(prev => [created, ...prev]);
      setForm({ title: '', slug: '', excerpt: '', content: '', published: false });
      setShowForm(false);
      setToast({ message: 'Article created', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to create', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        badge="// 03 ARTICLES"
        title="Articles"
        subtitle="Blog posts and engineering write-ups"
        actions={
          <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-2">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'New Article'}
          </button>
        }
      />

      <div className="space-y-6">
        {/* Create form */}
        {showForm && (
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-mono-code text-xs font-bold uppercase tracking-widest text-[var(--accent-gold)]">// New Article</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Title *</label>
                  <input className="form-input" required value={form.title}
                    onChange={e => setForm(p => ({
                      ...p,
                      title: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                    }))} placeholder="Building Idempotent Payment Systems" />
                </div>
                <div>
                  <label className="form-label">Slug *</label>
                  <input className="form-input font-mono-code" required value={form.slug}
                    onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                    placeholder="building-idempotent-payment-systems" />
                </div>
              </div>
              <div>
                <label className="form-label">Excerpt * (max 500 chars)</label>
                <textarea className="form-textarea" required maxLength={500} rows={2} value={form.excerpt}
                  onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                  placeholder="A concise overview of the article…" />
              </div>
              <div>
                <label className="form-label">Content * (Markdown)</label>
                <textarea className="form-textarea font-mono-code text-xs" required rows={10} value={form.content}
                  onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  placeholder="## Introduction&#10;&#10;Write your article in Markdown…" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.published}
                  onChange={e => setForm(p => ({ ...p, published: e.target.checked }))}
                  className="w-4 h-4 accent-[var(--accent-gold)]" />
                <span className="text-sm font-medium text-[var(--text-secondary)]">Publish immediately</span>
              </label>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <span className="spinner" /> : <Plus className="w-4 h-4" />}
                Create Article
              </button>
            </form>
          </div>
        )}

        {/* Articles list */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Published</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-12 text-[var(--text-muted)] font-mono-code text-xs">Loading…</td></tr>
                ) : articles.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-12 text-[var(--text-muted)] font-mono-code text-xs">No articles yet.</td></tr>
                ) : articles.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">{a.title}</p>
                          <p className="text-[var(--text-muted)] text-xs mt-0.5 line-clamp-1 max-w-sm">{a.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="font-mono-code text-xs text-[var(--text-muted)]">{a.slug}</span></td>
                    <td>
                      {a.published
                        ? <span className="inline-flex items-center gap-1.5 font-mono-code text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Published
                          </span>
                        : <span className="inline-flex items-center gap-1.5 font-mono-code text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border border-[var(--border-color)] text-[var(--text-muted)]">
                            Draft
                          </span>
                      }
                    </td>
                    <td className="font-mono-code text-[10px] text-[var(--text-muted)]">
                      {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-GB') : '—'}
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
