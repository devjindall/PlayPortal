import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-emerald-400 animate-spin`} />
      {text && <p className="text-xs font-medium text-slate-400 tracking-wide">{text}</p>}
    </div>
  );
}
