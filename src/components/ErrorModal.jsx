import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, RefreshCw, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export default function ErrorModal({ error, onClose, onRetry }) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!error) return null;

  const title    = error.title || 'An Error Occurred';
  const message  = error.message || 'Something went wrong while processing your request.';
  const status   = error.status || error.response?.status;
  const endpoint = error.endpoint || error.config?.url;
  const details  = error.details || error.response?.data || error.stack;

  const handleCopyDetails = () => {
    const textToCopy = JSON.stringify({
      title,
      message,
      status,
      endpoint,
      details
    }, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-lg glass-card overflow-hidden border border-red-500/30 shadow-2xl shadow-red-950/40 transform transition-all animate-modal-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="bg-red-500/10 px-6 py-4 border-b border-red-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-mono-code text-[10px] font-bold uppercase tracking-widest text-red-400">
                {status ? `// ERROR ${status}` : '// SYSTEM ALERT'}
              </span>
              <h3 className="font-sans-title text-base font-bold text-[var(--text-primary)] leading-tight">
                {title}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--badge-bg)] transition-all"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {message}
          </p>

          {endpoint && (
            <div className="px-3 py-2 rounded-lg bg-[var(--badge-bg)] border border-[var(--border-color)] font-mono-code text-xs text-[var(--text-muted)] flex items-center gap-2">
              <span className="text-red-400/80 font-bold uppercase text-[10px]">Endpoint:</span>
              <span className="truncate">{endpoint}</span>
            </div>
          )}

          {/* Technical Details Drawer */}
          {details && (
            <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-black/40">
              <button 
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full px-4 py-2.5 text-xs font-mono-code text-[var(--text-muted)] hover:text-[var(--text-secondary)] flex items-center justify-between bg-[var(--bg-card)] transition-colors"
              >
                <span>// TECHNICAL DIAGNOSTICS</span>
                <div className="flex items-center gap-1">
                  {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </button>

              {showDetails && (
                <div className="p-4 border-t border-[var(--border-color)] space-y-3">
                  <div className="flex justify-end">
                    <button 
                      onClick={handleCopyDetails}
                      className="inline-flex items-center gap-1.5 font-mono-code text-[11px] text-[var(--accent-gold)] hover:underline"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied to Clipboard' : 'Copy Diagnostics'}
                    </button>
                  </div>
                  <pre className="font-mono-code text-[11px] text-red-300/90 overflow-x-auto p-3 bg-black/60 rounded-lg max-h-48 whitespace-pre-wrap break-all border border-red-900/30">
                    {typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-[var(--bg-card-hover)] border-t border-[var(--border-color)] flex items-center justify-end gap-3">
          {onRetry && (
            <button 
              onClick={() => { onClose(); onRetry(); }}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Operation
            </button>
          )}
          <button 
            onClick={onClose} 
            className="btn-primary"
          >
            Dismiss Alert
          </button>
        </div>
      </div>
    </div>
  );
}
