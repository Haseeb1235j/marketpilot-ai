import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './Button';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'
  className = '',
  showClose = true
}) {
  // Prevent body scroll when open
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const mainEl = document.querySelector('main');
    const originalMainOverflow = mainEl ? mainEl.style.overflow : '';

    document.body.style.overflow = 'hidden';
    if (mainEl) {
      mainEl.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      if (mainEl) {
        mainEl.style.overflow = originalMainOverflow;
      }
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
    fullscreen: "w-full h-full max-w-none rounded-none m-0"
  };

  const modalMarkup = (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${size === 'fullscreen' ? 'p-0' : 'p-4'}`}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`relative w-full ${sizes[size]} glass-panel border border-darkBorder flex flex-col shadow-2xl overflow-hidden ${
              size === 'fullscreen'
                ? 'h-screen w-screen border-none rounded-none m-0 bg-[#070b14]'
                : 'max-h-[90vh] rounded-2xl bg-[#0b0f1d]'
            } ${className}`}
          >
            {/* Header */}
            {title && size !== 'fullscreen' && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-darkBorder/40">
                <h3 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                  {title}
                </h3>
                {showClose && (
                  <Button variant="ghost" size="sm" onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            )}

            {/* Content Body */}
            <div className={`flex-1 overflow-y-auto ${size === 'fullscreen' ? 'p-0' : 'px-6 py-5'} text-sm text-slate-300`}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalMarkup, document.body);
  }
  return null;
}
