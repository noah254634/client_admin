import React, { useEffect, useState, useCallback } from 'react';
import { getMessages, deleteMessage } from '../api';
import PageHeader from '../components/PageHeader';
import Toast from '../components/Toast';
import { Trash2, Mail, ChevronDown, ChevronUp } from 'lucide-react';

function MessageRow({ msg, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr className="cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <td>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[var(--badge-bg)] border border-[var(--border-color)] flex items-center justify-center shrink-0">
              <Mail className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{msg.name}</p>
              <p className="font-mono-code text-[10px] text-[var(--text-muted)]">{msg.email}</p>
            </div>
          </div>
        </td>
        <td className="text-sm text-[var(--text-secondary)]">{msg.subject}</td>
        <td className="font-mono-code text-[10px] text-[var(--text-muted)] whitespace-nowrap">
          {new Date(msg.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
        </td>
        <td>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
              className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--badge-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(msg._id, msg.name); }}
              className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={4} className="px-6 pb-5 pt-1">
            <div className="p-4 rounded-xl bg-[var(--badge-bg)] border border-[var(--border-color)]">
              <p className="font-mono-code text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Message Body</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{msg.body}</p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getMessages().catch(() => []);
    setMessages(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete message from "${name}"?`)) return;
    try {
      await deleteMessage(id);
      setMessages(prev => prev.filter(m => m._id !== id));
      setToast({ message: 'Message deleted', type: 'success' });
    } catch {
      setToast({ message: 'Failed to delete', type: 'error' });
    }
  };

  return (
    <>
      <PageHeader
        badge="// 02 INBOX"
        title="Messages"
        subtitle={`${messages.length} contact form submission${messages.length !== 1 ? 's' : ''}`}
      />

      <div className="space-y-6">
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-12 text-[var(--text-muted)] font-mono-code text-xs">Loading…</td></tr>
                ) : messages.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-12 text-[var(--text-muted)] font-mono-code text-xs">No messages yet.</td></tr>
                ) : messages.map((m) => (
                  <MessageRow key={m._id} msg={m} onDelete={handleDelete} />
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
