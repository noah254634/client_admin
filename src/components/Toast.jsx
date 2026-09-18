import React, { useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(onClose, 3500);
    return () => clearTimeout(timerRef.current);
  }, [onClose]);

  return (
    <div className="toast flex items-start gap-3">
      {type === 'success'
        ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        : <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
      }
      <p className="text-sm text-[var(--text-primary)] flex-1">{message}</p>
      <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
