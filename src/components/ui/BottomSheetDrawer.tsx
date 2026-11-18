import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface BottomSheetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string; // e.g. 'max-w-lg', 'max-w-2xl', 'max-w-3xl'
  zIndex?: string; // default 'z-[9999]'
  className?: string;
  bodyClassName?: string;
  headerRight?: React.ReactNode;
  dataTestId?: string;
  hideCloseButton?: boolean;
}

export const BottomSheetDrawer: React.FC<BottomSheetDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  badge,
  children,
  footer,
  maxWidth = 'max-w-xl',
  zIndex = 'z-[9999]',
  className = '',
  bodyClassName = 'p-5 sm:p-6 space-y-4',
  headerRight,
  dataTestId,
  hideCloseButton = false,
}) => {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          data-testid={dataTestId}
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className={`fixed inset-0 ${zIndex} flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/50 backdrop-blur-xs cursor-pointer overflow-y-auto overscroll-contain animate-fadeIn`}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className={`w-full ${maxWidth} max-h-[min(90vh,calc(100dvh-1rem))] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#e8e0d1] bg-white shadow-2xl overflow-hidden cursor-default ${className}`}
          >
            {/* Top Drag Bar Handle (Mobile Drawer Touch Indicator) */}
            <div className="shrink-0 pt-3 pb-1 bg-white sm:hidden flex justify-center">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            {/* Header Zone */}
            {(title || icon || !hideCloseButton) && (
              <div className="shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 border-b border-[#e8e0d1] flex items-center justify-between gap-3 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  {icon && (
                    <div className="shrink-0 p-2.5 rounded-2xl bg-[#9e783e]/15 text-[#9e783e]">
                      {icon}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {typeof title === 'string' ? (
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                          {title}
                        </h3>
                      ) : (
                        title
                      )}
                      {badge}
                    </div>
                    {subtitle && (
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {headerRight}
                  {!hideCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close Drawer"
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Scrollable Drawer Body */}
            <div className={`flex-1 overflow-y-auto overscroll-contain ${bodyClassName}`}>
              {children}
            </div>

            {/* Sticky Bottom Footer Zone with Safe Area Padding */}
            {footer && (
              <div className="shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 border-t border-[#e8e0d1] bg-[#faf8f5]/90 backdrop-blur-xs pb-safe-bottom">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
