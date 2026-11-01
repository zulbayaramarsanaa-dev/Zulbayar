import React from 'react';
import { ShoppingBag, Search, ShieldCheck, Bell } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenOwnerHQ: () => void;
  onSelectCategory: (cat: string) => void;
  selectedCategory: string;
  unreadOrdersCount: number;
  onSearchClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenOwnerHQ,
  onSelectCategory,
  selectedCategory,
  unreadOrdersCount,
  onSearchClick,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Clean single element display face) */}
        <div className="flex items-center gap-4 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectCategory('All');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-2xl font-black tracking-tight text-zinc-100 hover:text-white transition-colors uppercase whitespace-nowrap font-display"
          >
            SOLO
          </a>
          <span className="hidden sm:inline-block text-xs font-mono tracking-widest text-zinc-500 uppercase">
            Monochrome Equipment
          </span>
        </div>

        {/* Zone 2: Navigation Links (4 single-line clean text links with active underlines) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
          {[
            { label: 'All Objects', key: 'All' },
            { label: 'Apparel', key: 'Apparel' },
            { label: 'Carry', key: 'Carry' },
            { label: 'Objects & Tech', key: 'Objects & Tech' },
            { label: 'Accessories', key: 'Accessories' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => onSelectCategory(item.key)}
              className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 ${
                selectedCategory === item.key
                  ? 'text-white border-zinc-200'
                  : 'border-transparent hover:text-zinc-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions (Search, Cart, Owner Portal Switch) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onSearchClick}
            aria-label="Search items"
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Owner HQ Button */}
          <button
            onClick={onOpenOwnerHQ}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-lg transition-all cursor-pointer whitespace-nowrap relative"
            title="Open Store Owner Portal (zulbayaramarsanaa@gmail.com)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden lg:inline">Owner HQ</span>
            {unreadOrdersCount > 0 && (
              <span className="flex items-center justify-center bg-zinc-100 text-zinc-950 text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 font-mono">
                {unreadOrdersCount}
              </span>
            )}
          </button>

          {/* Shopping Cart Trigger */}
          <button
            onClick={onOpenCart}
            aria-label="Open Shopping Bag"
            className="flex items-center gap-2.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-sm hover:shadow-zinc-700/20"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bag</span>
            <span className="font-mono tabular-nums bg-zinc-900 text-zinc-100 rounded-md px-1.5 py-0.5 text-[11px] font-medium">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
