import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', desc: 'Focus live transaction search bar' },
    { key: 'B', desc: 'Filter feed to Blocked transactions' },
    { key: 'C', desc: 'Filter feed to Challenged (3DS) transactions' },
    { key: 'L', desc: 'Filter feed to Allowed transactions' },
    { key: 'A', desc: 'Reset feed filter to All transactions' },
    { key: 'Space', desc: 'Pause or resume live transaction stream' },
    { key: 'Enter', desc: 'Open detail drawer for selected transaction' },
    { key: 'Esc', desc: 'Close any active drawer or modal' },
    { key: '1 – 8', desc: 'Quick switch between primary views & pages' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="bg-[#0D1322] border border-[#1D2940] rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-[#1D2940] pb-3">
          <div className="flex items-center space-x-2 text-sm font-bold text-[#E8EDF7]">
            <Keyboard className="w-4 h-4 text-[#4C8DFF]" />
            <span>Command Center Keyboard Shortcuts</span>
          </div>
          <button onClick={onClose} className="text-[#7F8AA0] hover:text-[#E8EDF7] p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-1.5 border-b border-[#1D2940]/40">
              <span className="text-[#A5AEC0] font-sans">{s.desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-[#11192B] border border-[#1D2940] text-[#00C2D9] font-bold text-[11px] shadow-inner">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-[#7F8AA0] font-mono text-center pt-2">
          Press <kbd className="px-1.5 py-0.5 rounded bg-[#11192B] border border-[#1D2940] text-[#E8EDF7]">Esc</kbd> to dismiss this panel
        </div>

      </div>
    </div>
  );
}
