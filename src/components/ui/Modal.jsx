import { useEffect } from 'react';

export default function Modal({
  onClose,
  children,
  className = 'bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl',
  closeOnOverlay = true,
  zIndex = 'z-50',
}) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center ${zIndex} p-4`}
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div className={className} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
