import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth,
  size = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Light subtle backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/35 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Pristine Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidthClasses[maxWidth || size || 'md']} bg-white border border-[#eae7df] rounded-[4px] shadow-[0_10px_35px_-5px_rgba(24,24,27,0.15)] p-6 text-stone-900 z-10 overflow-hidden`}
      >
        <div className="flex items-start justify-between pb-3.5 border-b border-[#eae7df]">
          <div>
            {title && (
              <h3 className="text-base md:text-lg font-serif font-medium tracking-normal text-stone-900">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-stone-500 font-sans mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};
