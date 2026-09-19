import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Spinner } from './Loading';

interface Props {
  isOpen: boolean; onClose: () => void; onConfirm: () => void;
  title: string; description: string; confirmLabel?: string; isLoading?: boolean;
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, description, confirmLabel = 'Confirm', isLoading = false }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="flex flex-col items-center text-center gap-4 pb-2">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-100 mb-1">{title}</h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
        <div className="flex gap-3 w-full pt-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center" disabled={isLoading}>Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="btn-danger flex-1 justify-center">
            {isLoading ? <Spinner size="sm" /> : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
