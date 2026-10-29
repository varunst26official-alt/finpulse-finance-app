import { useEffect, useCallback } from 'react';

/**
 * Universal modal dismissal hook:
 * 1. Closes modal on Escape key press
 * 2. Closes modal on backdrop overlay click
 * 3. Prevents accidental closure when clicking inside the modal card
 */
export function useModalDismiss(isOpen: boolean, onClose: () => void) {
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
    onClick: onClose,
  };

  const contentProps = {
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
  };

  return { overlayProps, contentProps };
}
