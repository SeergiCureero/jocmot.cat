import { useEffect, useRef, type ReactNode } from 'react';
import { CloseIcon } from '@/components/icons';
import { ICON_BUTTON } from './styles';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/** Modal accessible basat en <dialog>. */
export default function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    // El focus va a la finestra (no al primer botó): així no surt marcat el botó de tancar.
    dialog.setAttribute('autofocus', '');
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="open:animate-dialog-in backdrop:animate-fade-in m-auto w-[min(92vw,28rem)] rounded-2xl p-0 shadow-xl outline-none backdrop:bg-black/40"
    >
      <div className="p-6">
        <div className="-mt-2 -mr-3 mb-3 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Tanca" className={ICON_BUTTON}>
            <CloseIcon />
          </button>
        </div>
        <div className="space-y-3 text-sm text-stone-700">{children}</div>
      </div>
    </dialog>
  );
}
