import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CloudUpload, Edit3, MessageCircle, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { createTestimonial, deleteTestimonial, getTestimonials, updateTestimonial, uploadTestimonialAvatar } from '../api';
import PageHeader from '../components/PageHeader';
import Toast from '../components/Toast';

const EMPTY_FORM = {
  quote: '',
  name: '',
  role: '',
  company: '',
  avatarUrl: '',
  domain: '',
  rating: 5,
  order: 0,
  published: false,
};

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [toast, setToast] = useState(null);
  const avatarInputRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getTestimonials().catch(() => []);
    setTestimonials(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setAvatarPreview('');
    setSelectedAvatarFile(null);
    setShowForm(true);
  };

  const openEdit = (testimonial) => {
    setEditingId(testimonial._id);
    setForm({ ...EMPTY_FORM, ...testimonial });
    setAvatarPreview('');
    setSelectedAvatarFile(null);
    setShowForm(true);
  };

  const handleAvatarFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please select an image file', type: 'error' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setToast({ message: 'Avatar must be 10 MB or smaller', type: 'error' });
      return;
    }
    setSelectedAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatarFile) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedAvatarFile);
      const response = await uploadTestimonialAvatar(formData);
      setForm((previous) => ({ ...previous, avatarUrl: response.avatarUrl }));
      setSelectedAvatarFile(null);
      setAvatarPreview('');
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      setToast({ message: 'Avatar uploaded to Cloudflare R2', type: 'success' });
    } catch (error) {
      setToast({ message: error.response?.data?.error || 'Avatar upload failed', type: 'error' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = editingId
        ? await updateTestimonial(editingId, form)
        : await createTestimonial(form);
      setTestimonials((previous) => editingId
        ? previous.map((item) => item._id === editingId ? saved : item)
        : [saved, ...previous]);
      setToast({ message: editingId ? 'Testimonial updated' : 'Testimonial created', type: 'success' });
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setAvatarPreview('');
      setSelectedAvatarFile(null);
    } catch (error) {
      setToast({ message: error.response?.data?.errors?.join(', ') || error.response?.data?.error || 'Failed to save testimonial', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (testimonial) => {
    if (!window.confirm(`Delete the testimonial from "${testimonial.name}"?`)) return;
    try {
      await deleteTestimonial(testimonial._id);
      setTestimonials((previous) => previous.filter((item) => item._id !== testimonial._id));
      setToast({ message: 'Testimonial deleted', type: 'success' });
    } catch {
      setToast({ message: 'Failed to delete testimonial', type: 'error' });
    }
  };

  return (
    <>
      <PageHeader
        badge="// 05 ENDORSEMENTS"
        title="Testimonials"
        subtitle={`${testimonials.length} testimonial${testimonials.length !== 1 ? 's' : ''} in the content registry`}
        actions={
          <button onClick={showForm ? () => setShowForm(false) : openCreate} className="btn-primary flex items-center gap-2">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'New Testimonial'}
          </button>
        }
      />

      <div className="space-y-6">
        {showForm && (
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-mono-code text-xs font-bold uppercase tracking-widest text-[var(--accent-gold)]">
              // {editingId ? 'Edit Testimonial' : 'New Testimonial'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Quote *</label>
                <textarea className="form-textarea" name="quote" required maxLength={2000} rows={4} value={form.quote} onChange={updateField} placeholder="What did the client or peer say?" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="form-label">Name *</label><input className="form-input" name="name" required value={form.name} onChange={updateField} /></div>
                <div><label className="form-label">Role *</label><input className="form-input" name="role" required value={form.role} onChange={updateField} /></div>
                <div><label className="form-label">Company *</label><input className="form-input" name="company" required value={form.company} onChange={updateField} /></div>
                <div><label className="form-label">Domain</label><input className="form-input" name="domain" maxLength={120} value={form.domain} onChange={updateField} placeholder="FINTECH & PAYMENTS" /></div>
                <div className="md:col-span-2">
                  <label className="form-label">Avatar Photo</label>
                  <div className="flex flex-wrap items-center gap-4 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--badge-bg)]">
                    {(avatarPreview || form.avatarUrl) && (
                      <img src={avatarPreview || form.avatarUrl} alt="Testimonial avatar preview" className="w-14 h-14 rounded-full object-cover border border-[var(--accent-gold)]" />
                    )}
                    <div className="flex items-center gap-2">
                      <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
                      <button type="button" onClick={() => avatarInputRef.current?.click()} className="btn-secondary py-1.5 px-3 text-[11px] inline-flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" /> Select Image
                      </button>
                      {selectedAvatarFile && (
                        <button type="button" onClick={handleAvatarUpload} disabled={uploadingAvatar} className="btn-primary py-1.5 px-3 text-[11px] inline-flex items-center gap-1.5">
                          {uploadingAvatar ? <span className="spinner" /> : <CloudUpload className="w-3.5 h-3.5" />} Upload to R2
                        </button>
                      )}
                    </div>
                    <input className="form-input flex-1 min-w-[220px]" name="avatarUrl" type="url" value={form.avatarUrl} onChange={updateField} placeholder="Or paste an existing image URL" />
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">Images are uploaded to Cloudflare R2; the returned public URL is saved with the testimonial.</p>
                </div>
                <div><label className="form-label">Display Order</label><input className="form-input" name="order" type="number" min="0" value={form.order} onChange={updateField} /></div>
                <div><label className="form-label">Rating</label><select className="form-input" name="rating" value={form.rating} onChange={updateField}>{[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="published" checked={form.published} onChange={updateField} className="w-4 h-4 accent-[var(--accent-gold)]" /><span className="text-sm font-medium text-[var(--text-secondary)]">Publish on the public site</span></label>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">{saving ? <span className="spinner" /> : editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}{editingId ? 'Save Changes' : 'Create Testimonial'}</button>
            </form>
          </div>
        )}

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Endorser</th><th>Quote</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={5} className="text-center py-12 text-[var(--text-muted)] font-mono-code text-xs">Loading testimonials…</td></tr>
                  : testimonials.length === 0 ? <tr><td colSpan={5} className="text-center py-12 text-[var(--text-muted)] font-mono-code text-xs">No testimonials yet. Create one.</td></tr>
                  : testimonials.map((testimonial) => (
                    <tr key={testimonial._id}>
                      <td><div className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-[var(--accent-gold)] shrink-0" /><div><p className="font-semibold text-[var(--text-primary)]">{testimonial.name}</p><p className="text-[var(--text-muted)] text-xs">{testimonial.role}, {testimonial.company}</p></div></div></td>
                      <td><p className="text-sm text-[var(--text-secondary)] line-clamp-2 max-w-md">{testimonial.quote}</p></td>
                      <td className="font-mono-code text-xs text-[var(--accent-gold)]">{'★'.repeat(testimonial.rating)}</td>
                      <td><span className={`font-mono-code text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${testimonial.published ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-[var(--border-color)] text-[var(--text-muted)]'}`}>{testimonial.published ? 'Published' : 'Draft'}</span></td>
                      <td><div className="flex items-center gap-2"><button onClick={() => openEdit(testimonial)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--badge-bg)] text-xs font-mono-code text-[var(--text-secondary)] hover:border-[var(--accent-gold)] transition-colors"><Edit3 className="w-3 h-3" /> Edit</button><button onClick={() => handleDelete(testimonial)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-xs font-mono-code text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3 h-3" /> Delete</button></div></td>
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
