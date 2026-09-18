import React, { useEffect, useState, useRef } from 'react';
import { getProfile, updateProfile, uploadAvatar, uploadCv } from '../api';
import PageHeader from '../components/PageHeader';
import Toast from '../components/Toast';
import {
  Save, Upload, FileText, User, CloudUpload,
  ExternalLink, Download, Sparkles, CheckCircle2, Shield
} from 'lucide-react';

export default function HeroSettings() {
  const [form, setForm] = useState({
    fullName: '',
    title: '',
    availability: '',
    headline: '',
    bio: '',
    avatarUrl: '',
    cvUrl: '',
    techStackTag: '',
    githubUrl: '',
    linkedinUrl: '',
    email: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [toast, setToast] = useState(null);

  // File preview states
  const [avatarPreview, setAvatarPreview] = useState('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [selectedCvFile, setSelectedCvFile] = useState(null);

  const avatarInputRef = useRef(null);
  const cvInputRef = useRef(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const data = await getProfile();
        if (data) {
          setForm({
            fullName: data.fullName || '',
            title: data.title || '',
            availability: data.availability || '',
            headline: data.headline || '',
            bio: data.bio || '',
            avatarUrl: data.avatarUrl || '',
            cvUrl: data.cvUrl || '',
            techStackTag: data.techStackTag || '',
            githubUrl: data.githubUrl || '',
            linkedinUrl: data.linkedinUrl || '',
            email: data.email || '',
          });
        }
      } catch {
        setToast({ message: 'Failed to load hero profile data', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const setField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile(form);
      setForm(prev => ({ ...prev, ...updated }));
      setToast({ message: 'Hero profile content saved', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Save failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please select an image file (PNG, JPG, WEBP, SVG)', type: 'error' });
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
      const res = await uploadAvatar(formData);
      setField('avatarUrl', res.avatarUrl);
      setSelectedAvatarFile(null);
      setAvatarPreview('');
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      setToast({ message: 'Hero portrait uploaded to Cloudflare R2', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Avatar upload failed', type: 'error' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCvFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setToast({ message: 'Please select a PDF document for your CV', type: 'error' });
      return;
    }
    setSelectedCvFile(file);
  };

  const handleCvUpload = async () => {
    if (!selectedCvFile) return;
    setUploadingCv(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedCvFile);
      const res = await uploadCv(formData);
      setField('cvUrl', res.cvUrl);
      setSelectedCvFile(null);
      if (cvInputRef.current) cvInputRef.current.value = '';
      setToast({ message: 'CV PDF uploaded to Cloudflare R2', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'CV upload failed', type: 'error' });
    } finally {
      setUploadingCv(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-[var(--text-muted)] font-mono-code text-xs">
        Loading Hero profile configuration…
      </div>
    );
  }

  return (
    <>
      <PageHeader
        badge="// HERO & PROFILE MANAGER"
        title="Hero Section & CV"
        subtitle="Upload portrait photos, CV/Resume PDF to Cloudflare R2, and update hero text"
      />

      <div className="space-y-8">
        {/* Upload Cards Grid: Avatar Photo & CV PDF */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 1: Hero Portrait Photo (Cloudflare R2) */}
          <div className="glass-card p-6 border-[var(--accent-gold)]/30 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <span className="font-mono-code text-xs font-bold uppercase tracking-widest text-[var(--accent-gold)] flex items-center gap-2">
                  <User className="w-4 h-4" /> // Hero Portrait (Cloudflare R2)
                </span>
                <span className="text-[10px] font-mono-code text-[var(--text-muted)]">PNG, JPG, WEBP</span>
              </div>

              {/* Avatar Preview Stage */}
              <div className="flex items-center gap-5">
                <div className="w-24 h-28 rounded-2xl overflow-hidden bg-black/40 border border-[var(--border-color)] shrink-0">
                  <img
                    src={avatarPreview || form.avatarUrl || '/noah_portrait.png'}
                    alt="Hero Portrait Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-xs text-[var(--text-secondary)]">
                    Upload a high-resolution portrait photo stored directly in your Cloudflare R2 storage bucket.
                  </p>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="btn-secondary py-1.5 px-3 text-[11px] inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select Photo</span>
                  </button>
                </div>
              </div>
            </div>

            {selectedAvatarFile && (
              <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                <span className="font-mono-code text-[11px] text-[var(--text-secondary)] truncate max-w-[180px]">
                  {selectedAvatarFile.name}
                </span>
                <button
                  type="button"
                  onClick={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="btn-primary py-1.5 px-3 text-[11px] flex items-center gap-1.5"
                >
                  {uploadingAvatar ? <span className="spinner" /> : <CloudUpload className="w-3.5 h-3.5" />}
                  <span>Upload to R2</span>
                </button>
              </div>
            )}
          </div>

          {/* Card 2: CV / Resume PDF (Cloudflare R2) */}
          <div className="glass-card p-6 border-[var(--accent-gold)]/30 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <span className="font-mono-code text-xs font-bold uppercase tracking-widest text-[var(--accent-gold)] flex items-center gap-2">
                  <FileText className="w-4 h-4" /> // CV / Resume PDF (Cloudflare R2)
                </span>
                <span className="text-[10px] font-mono-code text-[var(--text-muted)]">PDF Format</span>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-[var(--text-secondary)]">
                  Upload your latest CV/Resume PDF. Public visitors will download this file directly via the <code className="font-mono-code text-[var(--accent-gold)]">Download CV</code> button.
                </p>

                {form.cvUrl ? (
                  <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="font-mono-code text-xs font-bold text-[var(--text-primary)]">
                        Active R2 CV File
                      </span>
                    </div>
                    <a
                      href={form.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono-code text-xs text-[var(--accent-gold)] hover:underline flex items-center gap-1 font-bold"
                    >
                      View PDF <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--badge-bg)] text-xs text-[var(--text-muted)] font-mono-code">
                    Default local fallback CV active (/api/cv)
                  </div>
                )}

                <input
                  ref={cvInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleCvFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => cvInputRef.current?.click()}
                  className="btn-secondary py-1.5 px-3 text-[11px] inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Select CV PDF</span>
                </button>
              </div>
            </div>

            {selectedCvFile && (
              <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                <span className="font-mono-code text-[11px] text-[var(--text-secondary)] truncate max-w-[180px]">
                  {selectedCvFile.name}
                </span>
                <button
                  type="button"
                  onClick={handleCvUpload}
                  disabled={uploadingCv}
                  className="btn-primary py-1.5 px-3 text-[11px] flex items-center gap-1.5"
                >
                  {uploadingCv ? <span className="spinner" /> : <CloudUpload className="w-3.5 h-3.5" />}
                  <span>Upload to R2</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Hero Content Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
            <span className="font-mono-code text-xs font-bold uppercase tracking-widest text-[var(--accent-gold)] flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> // Hero Text & Identity Content
            </span>
            <span className="text-[10px] font-mono-code text-[var(--text-muted)]">Live update</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Full Name *</label>
              <input
                className="form-input"
                required
                value={form.fullName}
                onChange={(e) => setField('fullName', e.target.value)}
                placeholder="Noah Khaemba"
              />
            </div>

            <div>
              <label className="form-label">Title / Role *</label>
              <input
                className="form-input"
                required
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="Principal Systems & Ledger Architect"
              />
            </div>

            <div>
              <label className="form-label">Availability & Location Pill *</label>
              <input
                className="form-input"
                required
                value={form.availability}
                onChange={(e) => setField('availability', e.target.value)}
                placeholder="Available · Nairobi (UTC+3)"
              />
            </div>

            <div>
              <label className="form-label">Tech Stack Spec Tag *</label>
              <input
                className="form-input font-mono-code"
                required
                value={form.techStackTag}
                onChange={(e) => setField('techStackTag', e.target.value)}
                placeholder="Go / Kafka / C++"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Hero Headline (H1) *</label>
            <textarea
              className="form-textarea font-sans-title font-bold text-base"
              required
              rows={2}
              value={form.headline}
              onChange={(e) => setField('headline', e.target.value)}
              placeholder="Architecting resilient backends & data-driven platforms."
            />
          </div>

          <div>
            <label className="form-label">Bio / Value Proposition Subtitle *</label>
            <textarea
              className="form-textarea leading-relaxed"
              required
              rows={4}
              value={form.bio}
              onChange={(e) => setField('bio', e.target.value)}
              placeholder="Specialising in high-throughput payment rails, edge AI inference, and distributed event streaming topologies designed for fault tolerance and sub-100ms SLAs."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">GitHub URL</label>
              <input
                className="form-input"
                type="url"
                value={form.githubUrl}
                onChange={(e) => setField('githubUrl', e.target.value)}
                placeholder="https://github.com/noah254634"
              />
            </div>

            <div>
              <label className="form-label">LinkedIn URL</label>
              <input
                className="form-input"
                type="url"
                value={form.linkedinUrl}
                onChange={(e) => setField('linkedinUrl', e.target.value)}
                placeholder="https://www.linkedin.com/in/noah-khaemba/"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? <span className="spinner" /> : <Save className="w-4 h-4" />}
              <span>Save Hero Content</span>
            </button>
          </div>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
