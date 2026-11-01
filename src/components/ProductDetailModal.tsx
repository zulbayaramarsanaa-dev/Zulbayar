import React, { useState } from 'react';
import { X, Check, ShieldCheck, Truck, ArrowRight, Minus, Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, option: string, quantity: number) => void;
  onDirectBuy: (product: Product, option: string, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onDirectBuy,
}) => {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedOption, setSelectedOption] = useState<string>(
    product.options && product.options.length > 0 ? product.options[0] : 'Standard'
  );
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, selectedOption, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    onDirectBuy(product, selectedOption, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-[#121214] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close product view"
          className="absolute top-4 right-4 z-20 p-2 text-zinc-400 hover:text-white bg-zinc-900/80 rounded-full border border-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Gallery */}
          <div className="md:col-span-6 p-6 sm:p-8 bg-zinc-950 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/60">
              <img
                src={selectedImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Thumbnails if multiple */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border shrink-0 transition-all cursor-pointer ${
                      selectedImage === img
                        ? 'border-white scale-102'
                        : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Guarantees */}
            <div className="mt-6 pt-6 border-t border-zinc-800/80 space-y-2.5 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-zinc-300" />
                <span>Complimentary tracked express shipping on orders over $100</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
                <span>Lifetime warranty against structural defects</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Availability */}
              <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-zinc-400">
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span className="text-zinc-200">
                  {product.inStock ? `In Stock (${product.stockCount} units)` : 'Out of Stock'}
                </span>
              </div>

              {/* Title & Price */}
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight font-display">
                  {product.name}
                </h2>
                <div className="flex items-baseline gap-3 mt-1.5">
                  <span className="text-2xl font-bold text-white font-mono tabular-nums">
                    ${product.price}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-base text-zinc-500 line-through font-mono tabular-nums">
                        ${product.originalPrice}
                      </span>
                      {product.saleDiscountPercent && (
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                          {product.saleDiscountPercent}% OFF
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed">
                {product.description}
              </p>

              {/* Option / Variant Selection */}
              {product.options && product.options.length > 0 && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Select {product.category === 'Apparel' ? 'Size' : 'Variant'}:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedOption(opt)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                          selectedOption === opt
                            ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Quantity:
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-mono font-medium text-white tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-2 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">
                    Total: ${(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Specifications List */}
              {product.specs && product.specs.length > 0 && (
                <div className="pt-4 border-t border-zinc-800/80">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                    Specifications
                  </h4>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    {product.specs.map((spec, i) => (
                      <div key={i} className="flex flex-col">
                        <dt className="text-zinc-500">{spec.label}</dt>
                        <dd className="text-zinc-200 font-medium">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-6 border-t border-zinc-800/80">
              <button
                onClick={handleAdd}
                disabled={!product.inStock}
                className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  addedNotice
                    ? 'bg-zinc-200 text-zinc-950'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                }`}
              >
                {addedNotice ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <span>Add to Shopping Bag</span>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="w-full py-3 px-4 rounded-lg text-sm font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Instant Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
