import { useEffect, useCallback } from 'react';
import { registerModal } from '@/services/modalBackHandler';

/**
 * Universal modal dismissal hook:
 * 1. Synchronizes URL and registers onto the global Back Stack (Android Back Button & Browser Back)
 * 2. Closes modal on Escape key press
 * 3. Closes modal on backdrop overlay click
 * 4. Prevents accidental closure when clicking inside the modal card
 */
export function useModalDismiss(
  isOpen: boolean,
  onClose: () => void,
  modalId?: string,
  options?: { preventUrlPush?: boolean }
) {
  // Register with modal back system and URL hash
  useEffect(() => {
    if (!isOpen) return;
    const id = modalId || 'modal';
    const unregister = registerModal(id, onClose, options);
    return () => {
      unregister();
    };
  }, [isOpen, onClose, modalId, options?.preventUrlPush]);

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  const overlayProps = {
    onClick: (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
  };

  const contentProps = {
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
  };

  return { overlayProps, contentProps };
}
