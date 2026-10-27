import { useEffect, useRef, type ReactNode } from 'react';

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
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="open:animate-dialog-in backdrop:animate-fade-in m-auto w-[min(92vw,28rem)] rounded-2xl p-0 shadow-xl backdrop:bg-black/40"
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Tanca"
            className="text-2xl leading-none text-stone-500 transition hover:rotate-90 hover:text-stone-900"
          >
            ×
          </button>
        </div>
        <div className="space-y-3 text-sm text-stone-700">{children}</div>
      </div>
    </dialog>
  );
}
