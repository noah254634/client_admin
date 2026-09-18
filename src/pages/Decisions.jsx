import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDecisions, createDecision, deleteDecision } from '../api';
import PageHeader from '../components/PageHeader';
import Toast from '../components/Toast';
import { Plus, Trash2, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';

function DecisionCard({ decision, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-mono-code text-[10px] font-bold uppercase tracking-widest text-[var(--accent-gold)] mb-1">
            Question
          </p>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{decision.question}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setExpanded(e => !e)}
            className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--badge-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => onDelete(decision._id)}
            className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8">
        <p className="font-mono-code text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Decision</p>
        <p className="text-sm text-[var(--text-primary)] font-semibold">{decision.decision}</p>
      </div>

      {expanded && (
        <div className="space-y-3 pt-1">
          <div>
            <p className="font-mono-code text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Reasoning</p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{decision.reasoning}</p>
          </div>
          {decision.tradeoffs?.length > 0 && (
            <div>
              <p className="font-mono-code text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-2">Tradeoffs</p>
              <ul className="space-y-1">
                {decision.tradeoffs.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-mono-code text-[var(--text-secondary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] mt-1.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Decisions() {
  const { slug } = useParams();
  const [decisions, setDecisions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);
  const [showForm,  setShowForm]  = useState(false);
  const [form, setForm] = useState({ question: '', decision: '', reasoning: '', tradeoffs: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getDecisions(slug).catch(() => []);
    setDecisions(data);
    setLoading(false);
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        tradeoffs: form.tradeoffs.split('\n').map(t => t.trim()).filter(Boolean),
      };
      const created = await createDecision(slug, payload);
      setDecisions(prev => [...prev, created]);
      setForm({ question: '', decision: '', reasoning: '', tradeoffs: '' });
      setShowForm(false);
      setToast({ message: 'Decision added', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to create', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this decision?')) return;
    try {
      await deleteDecision(slug, id);
      setDecisions(prev => prev.filter(d => d._id !== id));
      setToast({ message: 'Decision deleted', type: 'success' });
    } catch {
      setToast({ message: 'Failed to delete', type: 'error' });
    }
  };

  return (
    <>
      <PageHeader
        badge="// DECISIONS"
        title={`Decisions · ${slug}`}
        subtitle="Engineering decision records for this project"
        actions={
          <div className="flex items-center gap-3">
            <Link to="/projects" className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Projects
            </Link>
            <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Decision
            </button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Add form */}
        {showForm && (
          <div className="glass-card p-6 space-y-4 border-[var(--accent-gold)]/30">
            <h2 className="font-mono-code text-xs font-bold uppercase tracking-widest text-[var(--accent-gold)]">// New Decision</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="form-label">Question *</label>
                <input className="form-input" required value={form.question}
                  onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
                  placeholder="Why choose Kafka over RabbitMQ?" />
              </div>
              <div>
                <label className="form-label">Decision Taken *</label>
                <input className="form-input" required value={form.decision}
                  onChange={e => setForm(p => ({ ...p, decision: e.target.value }))}
                  placeholder="Apache Kafka with exactly-once delivery…" />
              </div>
              <div>
                <label className="form-label">Reasoning *</label>
                <textarea className="form-textarea" required rows={4} value={form.reasoning}
                  onChange={e => setForm(p => ({ ...p, reasoning: e.target.value }))}
                  placeholder="Kafka provides durable log storage and horizontal partition scaling…" />
              </div>
              <div>
                <label className="form-label">Tradeoffs (one per line)</label>
                <textarea className="form-textarea" rows={3} value={form.tradeoffs}
                  onChange={e => setForm(p => ({ ...p, tradeoffs: e.target.value }))}
                  placeholder={"Operational complexity\nRequires Zookeeper\nHigher memory footprint"} />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <span className="spinner" /> : <Plus className="w-4 h-4" />}
                  Save Decision
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        {loading ? (
          <p className="text-center py-12 text-[var(--text-muted)] font-mono-code text-xs">Loading…</p>
        ) : decisions.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="font-mono-code text-sm text-[var(--text-muted)]">No decisions recorded yet.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add First Decision
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {decisions.map(d => (
              <DecisionCard key={d._id} decision={d} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
