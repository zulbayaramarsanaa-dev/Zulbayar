import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Lock } from 'lucide-react';

interface FooterProps {
  onOpenOwnerHQ: () => void;
  onFilterCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenOwnerHQ, onFilterCategory }) => {
  return (
    <footer className="bg-[#09090b] border-t border-zinc-800 text-zinc-400 text-xs">
      {/* Trust & Craftsmanship Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-zinc-850">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold">
              <Truck className="w-4 h-4 text-zinc-400" />
              <span>Global Monitored Dispatch</span>
            </div>
            <p className="text-zinc-500 leading-relaxed">
              Express tracked courier delivery. Orders processed within 24 hours of confirmation.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <span>Architectural Grade</span>
            </div>
            <p className="text-zinc-500 leading-relaxed">
              Grade 5 Titanium, 500 GSM loopback cotton, and 1000D Ballistic Cordura.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold">
              <RotateCcw className="w-4 h-4 text-zinc-400" />
              <span>30-Day Evaluation</span>
            </div>
            <p className="text-zinc-500 leading-relaxed">
              Hassle-free returns on unworn apparel and unaltered tactical carry objects.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold">
              <Lock className="w-4 h-4 text-zinc-400" />
              <span>Secure Transactions</span>
            </div>
            <p className="text-zinc-500 leading-relaxed">
              End-to-end encrypted order dispatch and direct store founder fulfillment alerts.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <span className="text-2xl font-black tracking-tight text-white font-display">SOLO</span>
          <p className="text-zinc-500 mt-1 max-w-sm">
            Monochrome stealth equipment engineered for modern daily transit and singular utility.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-zinc-400">
          <button onClick={() => onFilterCategory('All')} className="hover:text-white transition-colors cursor-pointer">
            Catalog
          </button>
          <button onClick={() => onFilterCategory('Apparel')} className="hover:text-white transition-colors cursor-pointer">
            Apparel
          </button>
          <button onClick={() => onFilterCategory('Carry')} className="hover:text-white transition-colors cursor-pointer">
            Modular Carry
          </button>
          <button onClick={() => onFilterCategory('Objects & Tech')} className="hover:text-white transition-colors cursor-pointer">
            Objects & Tech
          </button>
          <button onClick={onOpenOwnerHQ} className="text-zinc-300 hover:text-white font-medium transition-colors cursor-pointer flex items-center gap-1.5">
            <span>Owner Portal</span>
          </button>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-600 text-[11px] font-mono">
        <p>© {new Date().getFullYear()} SOLO MONOCHROME. All rights reserved.</p>
        <p>Founder notification recipient: zulbayaramarsanaa@gmail.com</p>
      </div>
    </footer>
  );
};
