import React from 'react';
import { ArrowDown, Sparkles, Shield, Truck } from 'lucide-react';
import { HERO_IMAGE } from '../data/products';

interface HeroProps {
  onExplore: () => void;
  onFilterCategory: (cat: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore, onFilterCategory }) => {
  return (
    <section className="relative overflow-hidden border-b border-zinc-800 bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Brand Statement & Route into Collection */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-zinc-400 uppercase">
              <span>Collection 01</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span>Monochrome Stealth</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span>Available Now</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-100 tracking-tight leading-[1.08] text-balance font-display">
              Singular form.<br />
              Stealth precision.
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 font-normal leading-relaxed max-w-xl">
              Engineered objects, heavy architectural textiles, and modular carry gear.
              Crafted in deep black and graphite grey for uncompromised everyday utility.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExplore}
                className="px-6 py-3 text-sm font-semibold text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-sm"
              >
                Explore Objects
              </button>
              <button
                onClick={() => onFilterCategory('Carry')}
                className="px-5 py-3 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all cursor-pointer whitespace-nowrap"
              >
                Carry & Modular Packs
              </button>
            </div>

            {/* Proof & Specifications Strip (Adjacency & Quantitative Rigor) */}
            <div className="pt-6 border-t border-zinc-800/80 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Textiles</p>
                <p className="text-sm font-semibold text-zinc-200 mt-0.5">500 GSM Cotton</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Precision</p>
                <p className="text-sm font-semibold text-zinc-200 mt-0.5">Grade 5 Titanium</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Transit</p>
                <p className="text-sm font-semibold text-zinc-200 mt-0.5">Express Dispatch</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-6">
            <div className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/40 shadow-2xl">
              <img
                src={HERO_IMAGE}
                alt="SOLO Monochrome Stealth Collection Showcase"
                className="w-full h-[380px] sm:h-[460px] lg:h-[500px] object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              
              {/* Caption Overlay */}
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <div>
                  <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Showcase 01</p>
                  <p className="text-base font-semibold text-white mt-0.5">The Technical Parka & Modular Pack</p>
                </div>
                <button
                  onClick={onExplore}
                  className="px-3.5 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/60 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
