'use client';

import React, { useEffect, useRef } from 'react';
import { BRAND_COLORS } from '@/config/brand';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: BRAND_COLORS.secondary }}
        >
          <h2 
            id="modal-title" 
            className="text-lg font-semibold"
            style={{ color: BRAND_COLORS.dark }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
