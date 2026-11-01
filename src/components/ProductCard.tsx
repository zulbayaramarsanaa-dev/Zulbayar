import React from 'react';
import { Plus, Eye, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product, e: React.MouseEvent) => void;
  isAddedJustNow?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickAdd,
  isAddedJustNow,
}) => {
  return (
    <article
      onClick={() => onSelect(product)}
      className="group relative flex flex-col bg-[#121214] border border-zinc-800/80 rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
    >
      {/* 65-75% Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950">
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />
        
        {/* Sale badge or new drop */}
        {product.isOnSale && product.saleDiscountPercent ? (
          <div className="absolute top-3 left-3 text-[11px] font-mono tracking-wider uppercase text-emerald-400 bg-zinc-950/90 backdrop-blur-sm px-2 py-0.5 rounded border border-emerald-900/60 font-semibold">
            {product.saleDiscountPercent}% OFF SALE
          </div>
        ) : product.isNew ? (
          <div className="absolute top-3 left-3 text-[11px] font-mono tracking-wider uppercase text-zinc-300 bg-zinc-950/80 backdrop-blur-sm px-2 py-0.5 rounded border border-zinc-800">
            Sale Drop
          </div>
        ) : null}

        {/* Quick View overlay button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 rounded-lg backdrop-blur-md transition-transform transform translate-y-2 group-hover:translate-y-0 flex items-center gap-1.5 shadow-lg"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Unboxed Metadata with · separator */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono tracking-wider uppercase mb-1">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>{product.inStock ? 'In Stock' : 'Sold Out'}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-medium">Sale</span>
              </>
            )}
          </div>

          <h3 className="text-base font-semibold text-zinc-100 group-hover:text-white transition-colors line-clamp-1 font-display">
            {product.name}
          </h3>

          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
            {product.subtitle}
          </p>
        </div>

        {/* Price & Quick Add Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-white font-mono tabular-nums">
              ${product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-zinc-500 line-through font-mono tabular-nums">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <button
            onClick={(e) => onQuickAdd(product, e)}
            disabled={!product.inStock}
            aria-label={`Add ${product.name} to bag`}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              isAddedJustNow
                ? 'bg-zinc-200 text-zinc-950 scale-95'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700/80'
            }`}
          >
            {isAddedJustNow ? (
              <>
                <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
