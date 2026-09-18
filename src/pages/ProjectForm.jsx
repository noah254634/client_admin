import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProject, createProject, updateProject, getTechnologies } from '../api';
import PageHeader from '../components/PageHeader';
import Toast from '../components/Toast';
import { Save, ArrowLeft, Plus, X, Image as ImageIcon } from 'lucide-react';

const CATEGORIES = ['infra', 'data', 'payments', 'ml', 'other'];
const STATUSES   = ['LIVE', 'BUILDING', 'TESTING', 'PROTOTYPE', 'ARCHIVED'];

export default function ProjectForm() {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const isEdit    = Boolean(slug);

  const [form, setForm] = useState({
    title: '', slug: '', description: '', category: 'other',
    status: 'BUILDING', featured: false, githubUrl: '', liveUrl: '',
    stack: [], metrics: [],
  });
  const [technologies, setTechnologies] = useState([]);
  const [metricInput,  setMetricInput]  = useState({ label: '', value: '' });
  const [loading,  setLoading]  = useState(isEdit);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState(null);

  // Load tech catalog
  useEffect(() => {
    getTechnologies().then(setTechnologies).catch(() => {});
  }, []);

  // Load project if editing
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getProject(slug)
      .then((p) => setForm({
        title:       p.title       ?? '',
        slug:        p.slug        ?? '',
        description: p.description ?? '',
        category:    p.category    ?? 'other',
        status:      p.status      ?? 'BUILDING',
        featured:    p.featured    ?? false,
        githubUrl:   p.githubUrl   ?? '',
        liveUrl:     p.liveUrl     ?? '',
        stack:       (p.stack ?? []).map(t => typeof t === 'object' ? t._id : t),
        metrics:     p.metrics ?? [],
      }))
      .catch(() => setToast({ message: 'Failed to load project', type: 'error' }))
      .finally(() => setLoading(false));
  }, [slug, isEdit]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await updateProject(slug, form);
        setToast({ message: 'Project updated', type: 'success' });
      } else {
        const created = await createProject(form);
        setToast({ message: 'Project created', type: 'success' });
        setTimeout(() => navigate(`/projects/${created.slug}/edit`), 1200);
      }
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Save failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const addMetric = () => {
    if (!metricInput.label || !metricInput.value) return;
    set('metrics', [...form.metrics, { ...metricInput }]);
    setMetricInput({ label: '', value: '' });
  };

  const removeMetric = (idx) => set('metrics', form.metrics.filter((_, i) => i !== idx));

  const toggleTech = (id) => {
    set('stack', form.stack.includes(id) ? form.stack.filter(t => t !== id) : [...form.stack, id]);
  };

  if (loading) return (
    <div className="px-8 py-16 text-center text-[var(--text-muted)] font-mono-code text-xs">
      Loading project…
    </div>
  );

  return (
    <>
      <PageHeader
        badge={isEdit ? '// EDIT PROJECT' : '// NEW PROJECT'}
        title={isEdit ? 'Edit Project' : 'New Project'}
        actions={
          <Link to="/projects" className="btn-secondary flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        }
      />

      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">

          {/* ── Core info ── */}
          <div className="glass-card p-6 space-y-5">
            <h2 className="font-mono-code text-xs font-bold uppercase tracking-widest text-[var(--accent-gold)]">// Core Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="form-label">Title *</label>
                <input className="form-input" required value={form.title}
                  onChange={e => set('title', e.target.value)} placeholder="VeraPay Gateway" />
              </div>
              <div>
                <label className="form-label">Slug *</label>
                <input className="form-input font-mono-code" required value={form.slug}
                  onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="verapay-gateway" />
              </div>
            </div>

            <div>
              <label className="form-label">Short Description * (max 500 chars)</label>
              <textarea className="form-textarea" required maxLength={500} rows={3} value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Idempotent multi-rail payment router with double-entry accounting ledger…" />
              <p className="font-mono-code text-[10px] text-[var(--text-muted)] mt-1">{form.description.length} / 500</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div>
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">GitHub URL</label>
                <input className="form-input" type="url" value={form.githubUrl}
                  onChange={e => set('githubUrl', e.target.value)} placeholder="https://github.com/…" />
              </div>
              <div>
                <label className="form-label">Live URL</label>
                <input className="form-input" type="url" value={form.liveUrl}
                  onChange={e => set('liveUrl', e.target.value)} placeholder="https://…" />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)}
                className="w-4 h-4 accent-[var(--accent-gold)] cursor-pointer" />
              <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                Mark as Featured Project
              </span>
            </label>
          </div>

          {/* ── Tech stack ── */}
          {technologies.length > 0 && (
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-mono-code text-xs font-bold uppercase tracking-widest text-[var(--accent-gold)]">// Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {technologies.map(t => {
                  const selected = form.stack.includes(t._id);
                  return (
                    <button key={t._id} type="button" onClick={() => toggleTech(t._id)}
                      className={`px-3 py-1.5 rounded-lg border font-mono-code text-xs font-bold transition-all duration-150
                        ${selected
                          ? 'border-[var(--accent-gold)] bg-[var(--glow-color)] text-[var(--accent-gold)]'
                          : 'border-[var(--border-color)] bg-[var(--badge-bg)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                        }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Metrics ── */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-mono-code text-xs font-bold uppercase tracking-widest text-[var(--accent-gold)]">// Performance Metrics</h2>
            <div className="flex gap-3">
              <input className="form-input" value={metricInput.label}
                onChange={e => setMetricInput(p => ({ ...p, label: e.target.value }))}
                placeholder="Label (e.g. P99 Latency)" />
              <input className="form-input" value={metricInput.value}
                onChange={e => setMetricInput(p => ({ ...p, value: e.target.value }))}
                placeholder="Value (e.g. 142ms)" />
              <button type="button" onClick={addMetric} className="btn-secondary shrink-0 flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {form.metrics.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {form.metrics.map((m, i) => (
                  <div key={i} className="relative p-4 rounded-xl border border-[var(--border-color)] bg-[var(--badge-bg)] group">
                    <button type="button" onClick={() => removeMetric(i)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 transition-opacity">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <p className="font-sans-title text-xl font-extrabold text-[var(--text-primary)]">{m.value}</p>
                    <p className="font-mono-code text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Submit & Actions ── */}
          <div className="flex flex-wrap items-center gap-4 pb-8">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <span className="spinner" /> : <Save className="w-4 h-4" />}
              {isEdit ? 'Save Changes' : 'Create Project'}
            </button>
            {isEdit && (
              <>
                <Link to={`/projects/${slug}/photos`} className="btn-secondary flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[var(--accent-gold)]" /> Photo Catalogue
                </Link>
                <Link to={`/projects/${slug}/decisions`} className="btn-secondary flex items-center gap-2">
                  Manage Decisions
                </Link>
              </>
            )}
          </div>

        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
