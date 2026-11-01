import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, e: React.MouseEvent) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  recentlyAddedId: string | null;
  onOpenUploadModal?: () => void;
}

const CATEGORIES = ['All', 'Apparel', 'Carry', 'Objects & Tech', 'Accessories'];

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
  onQuickAdd,
  searchQuery,
  onSearchChange,
  recentlyAddedId,
  onOpenUploadModal,
}) => {
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch =
          searchQuery.trim() === '' ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        return 0; // featured maintains default order
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <section id="collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Header & Interactive Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-zinc-500 uppercase">
            <span>Exclusive Owner Inventory</span>
            <span aria-hidden="true">·</span>
            <span>{filteredProducts.length} On Sale</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1 font-display">
            {selectedCategory === 'All' ? 'Items on Sale' : selectedCategory}
          </h2>
        </div>

        {/* Filter bar: Segmented category tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenUploadModal && (
            <button
              onClick={onOpenUploadModal}
              className="px-3.5 py-1.5 text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer mr-2 shadow-sm flex items-center gap-1.5"
            >
              <span>+ Upload Item to Sell</span>
            </button>
          )}

          <div className="flex items-center p-1 bg-[#121214] rounded-lg border border-zinc-800">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-[#121214] text-zinc-300 text-xs font-medium pl-3 pr-8 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-500 cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Search Badge or Filter Indicators */}
      {searchQuery && (
        <div className="flex items-center justify-between py-3 px-4 my-4 bg-zinc-900/60 rounded-lg border border-zinc-800 text-xs text-zinc-400">
          <span>
            Showing results for <span className="text-white font-medium">"{searchQuery}"</span>
          </span>
          <button
            onClick={() => onSearchChange('')}
            className="flex items-center gap-1 text-zinc-400 hover:text-white cursor-pointer"
          >
            <span>Clear search</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onQuickAdd={onQuickAdd}
              isAddedJustNow={recentlyAddedId === product.id}
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Empty Store State when owner hasn't uploaded anything yet */
        <div className="py-24 max-w-xl mx-auto text-center space-y-4 px-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-zinc-400">
            <SlidersHorizontal className="w-6 h-6 text-zinc-300" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white font-display">
              No Items Uploaded Yet
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              This store is configured to only sell what you upload and with the exact stock you designate.
            </p>
          </div>

          {onOpenUploadModal && (
            <div className="pt-2">
              <button
                onClick={onOpenUploadModal}
                className="px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-zinc-700/20 cursor-pointer"
              >
                + Upload Your First Item & Set Stock
              </button>
            </div>
          )}

          <p className="text-xs text-zinc-500 font-mono pt-4 border-t border-zinc-850">
            Orders from customers automatically decrement your stock and dispatch full order details to your inbox.
          </p>
        </div>
      ) : (
        <div className="py-20 text-center space-y-4">
          <p className="text-zinc-400 text-sm">No objects match your current filter criteria.</p>
          <button
            onClick={() => {
              onSelectCategory('All');
              onSearchChange('');
            }}
            className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
};
