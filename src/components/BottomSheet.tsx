import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { triggerHaptic } from '../lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      triggerHaptic('medium');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] z-[70] shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Handle */}
            <div className="w-full flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>
            
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50">
              <h3 className="text-xl font-black text-gray-900 font-display">
                {title}
              </h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
