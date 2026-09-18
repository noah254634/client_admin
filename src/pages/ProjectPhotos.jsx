import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectImages, uploadProjectImage, updateProjectImage, deleteProjectImage } from '../api';
import PageHeader from '../components/PageHeader';
import Toast from '../components/Toast';
import {
  Upload, Trash2, ArrowLeft, Image as ImageIcon,
  Edit2, Check, X, Eye, CloudUpload, Tag
} from 'lucide-react';

export default function ProjectPhotos() {
  const { slug } = useParams();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Upload form state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('screenshot');
  const fileInputRef = useRef(null);

  // Lightbox preview state
  const [activeLightbox, setActiveLightbox] = useState(null);

  // Edit description inline state
  const [editingId, setEditingId] = useState(null);
  const [editDesc, setEditDesc] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProjectImages(slug);
      setImages(data || []);
    } catch {
      setToast({ message: 'Failed to load photo catalogue', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please select an image file (PNG, JPG, WEBP, GIF, SVG)', type: 'error' });
      return;
    }

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setToast({ message: 'Please select a photo file', type: 'error' });
      return;
    }
    if (!description.trim()) {
      setToast({ message: 'Please provide an image description', type: 'error' });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('description', description.trim());
      formData.append('role', role);

      const uploaded = await uploadProjectImage(slug, formData);
      setImages(prev => [uploaded, ...prev]);
      
      // Reset upload form
      setSelectedFile(null);
      setFilePreview('');
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      setToast({ message: 'Photo uploaded to Cloudflare R2', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Upload failed', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId, photoDesc) => {
    if (!window.confirm(`Delete this photo from Cloudflare R2?`)) return;
    try {
      await deleteProjectImage(slug, imageId);
      setImages(prev => prev.filter(img => img._id !== imageId));
      setToast({ message: 'Photo deleted from Cloudflare R2', type: 'success' });
    } catch {
      setToast({ message: 'Failed to delete photo', type: 'error' });
    }
  };

  const handleSaveDescription = async (imageId) => {
    if (!editDesc.trim()) return;
    try {
      const updated = await updateProjectImage(slug, imageId, { description: editDesc.trim() });
      setImages(prev => prev.map(img => img._id === imageId ? { ...img, description: updated.description } : img));
      setEditingId(null);
      setToast({ message: 'Description updated', type: 'success' });
    } catch {
      setToast({ message: 'Failed to update description', type: 'error' });
    }
  };

  return (
    <>
      <PageHeader
        badge="// PHOTO CATALOGUE"
        title={`Photo Catalogue · ${slug}`}
        subtitle="Manage high-resolution screenshots & architecture diagrams stored in Cloudflare R2"
        actions={
          <Link to="/projects" className="btn-secondary flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
        }
      />

      <div className="space-y-8">
        {/* Upload Form Box */}
        <div className="glass-card p-6 border-[var(--accent-gold)]/30 space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
            <div className="flex items-center gap-2 text-[var(--accent-gold)] font-mono-code text-xs font-bold uppercase tracking-widest">
              <CloudUpload className="w-4 h-4" />
              <span>// Upload Photo to Cloudflare R2</span>
            </div>
            <span className="text-[10px] font-mono-code text-[var(--text-muted)]">Max size: 10MB</span>
          </div>

          <form onSubmit={handleUpload} className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* File Upload Drop Area */}
              <div className="lg:col-span-1">
                <label className="form-label">Photo File *</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent-gold)] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[var(--badge-bg)] flex flex-col items-center justify-center min-h-[180px]"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {filePreview ? (
                    <div className="relative group w-full h-36">
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-xl border border-[var(--border-color)]"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-xs text-white font-mono-code">
                        Click to change photo
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-[var(--badge-bg)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-gold)] mb-3">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-[var(--text-primary)]">
                        Click to select photo
                      </p>
                      <p className="text-[10px] font-mono-code text-[var(--text-muted)] mt-1">
                        PNG, JPG, WEBP, SVG
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Description & Role Fields */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="form-label">Photo Description *</label>
                  <textarea
                    className="form-textarea"
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this screenshot or architecture diagram shows (e.g., Idempotent payment routing pipeline architecture with real-time throughput metrics)..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Photo Role / Category</label>
                    <select
                      className="form-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="screenshot">Screenshot</option>
                      <option value="diagram">Architecture Diagram</option>
                      <option value="hero">Cover / Hero Image</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={uploading || !selectedFile}
                      className="btn-primary w-full flex items-center justify-center gap-2 h-11"
                    >
                      {uploading ? (
                        <>
                          <span className="spinner" />
                          <span>Uploading to R2…</span>
                        </>
                      ) : (
                        <>
                          <CloudUpload className="w-4 h-4" />
                          <span>Upload to Cloudflare R2</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Photos Catalogue Gallery Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-mono-code text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
              // Photo Catalogue ({images.length})
            </h2>
          </div>

          {loading ? (
            <p className="text-center py-12 text-[var(--text-muted)] font-mono-code text-xs">
              Loading photo catalogue…
            </p>
          ) : images.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <ImageIcon className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="font-mono-code text-sm text-[var(--text-secondary)] font-bold">
                No photos uploaded yet for this project.
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Upload screenshots and architecture diagrams above to populate the Cloudflare R2 catalogue.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((img) => (
                <div key={img._id} className="glass-card overflow-hidden group flex flex-col justify-between">
                  {/* Image Thumbnail Container */}
                  <div className="relative aspect-video bg-black/40 overflow-hidden border-b border-[var(--border-color)]">
                    <img
                      src={img.url}
                      alt={img.description || 'Project screenshot'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Role Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="badge-glass text-[10px] bg-black/60 backdrop-blur-md">
                        <Tag className="w-2.5 h-2.5 inline mr-1" />
                        {img.role}
                      </span>
                    </div>

                    {/* Quick Action Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => setActiveLightbox(img)}
                        className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-colors"
                        title="View Fullsize Photo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(img._id, img.description)}
                        className="w-9 h-9 rounded-full bg-red-500/30 backdrop-blur-md text-red-300 flex items-center justify-center hover:bg-red-500/60 transition-colors"
                        title="Delete Photo from R2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Photo Description & Details */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono-code text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                          Description
                        </span>
                        {editingId !== img._id && (
                          <button
                            onClick={() => { setEditingId(img._id); setEditDesc(img.description); }}
                            className="text-xs font-mono-code text-[var(--accent-gold)] hover:underline flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                        )}
                      </div>

                      {editingId === img._id ? (
                        <div className="space-y-2">
                          <textarea
                            className="form-textarea text-xs"
                            rows={3}
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2.5 py-1 text-[10px] font-mono-code rounded-lg border border-[var(--border-color)]"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveDescription(img._id)}
                              className="px-2.5 py-1 text-[10px] font-mono-code rounded-lg bg-[var(--accent-dark)] text-[var(--bg-primary)] font-bold flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                          {img.description}
                        </p>
                      )}
                    </div>

                    {/* R2 Public Domain Link */}
                    <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between font-mono-code text-[10px] text-[var(--text-muted)]">
                      <span className="truncate max-w-[200px]" title={img.url}>
                        {img.url.replace(/^https?:\/\//, '')}
                      </span>
                      <span>{new Date(img.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeLightbox && (
        <div 
          className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveLightbox(null)}
        >
          <div 
            className="max-w-5xl w-full glass-card overflow-hidden border border-white/20 animate-modal-scale"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-black/40 border-b border-[var(--border-color)] flex items-center justify-between">
              <span className="font-mono-code text-xs font-bold text-[var(--accent-gold)]">
                // {activeLightbox.role.toUpperCase()}
              </span>
              <button 
                onClick={() => setActiveLightbox(null)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 bg-black flex items-center justify-center max-h-[70vh]">
              <img
                src={activeLightbox.url}
                alt={activeLightbox.description}
                className="max-h-[68vh] object-contain rounded-lg"
              />
            </div>
            <div className="p-6 bg-[var(--bg-card)] border-t border-[var(--border-color)] space-y-2">
              <span className="font-mono-code text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                Description
              </span>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                {activeLightbox.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
