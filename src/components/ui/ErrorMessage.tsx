import { AlertTriangle } from 'lucide-react';

interface Props { title?: string; message: string; onRetry?: () => void; }

export function ErrorMessage({ title = 'Something went wrong', message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <AlertTriangle className="w-5 h-5 text-red-400" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">{title}</h3>
        <p className="text-xs text-slate-500 max-w-xs">{message}</p>
      </div>
      {onRetry && <button onClick={onRetry} className="btn-secondary">Try again</button>}
    </div>
  );
}
