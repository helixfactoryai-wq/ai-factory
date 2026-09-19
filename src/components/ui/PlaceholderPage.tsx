import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props { title: string; description: string; phase?: string; }

export function PlaceholderPage({ title, description, phase = 'Phase 2' }: Props) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center px-4 animate-in">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-[#111827] border border-slate-700/60 flex items-center justify-center">
          <Construction className="w-7 h-7 text-indigo-400" />
        </div>
        <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
          {phase}
        </span>
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-100 mb-2">{title}</h2>
        <p className="text-sm text-slate-500 leading-relaxed max-w-xs">{description}</p>
      </div>
      <button onClick={() => navigate('/')} className="btn-secondary">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>
    </div>
  );
}
