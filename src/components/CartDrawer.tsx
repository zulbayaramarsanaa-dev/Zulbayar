import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, option: string, delta: number) => void;
  onRemoveItem: (productId: string, option: string) => void;
  onCheckout: () => void;
  discount: number;
  onApplyPromo: (code: string) => boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  discount,
  onApplyPromo,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const freeShippingThreshold = 100;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 15;
  const discountAmount = (subtotal * discount) / 100;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const ok = onApplyPromo(promoInput.trim());
    if (ok) {
      setPromoSuccess(true);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try "SOLO10"');
      setPromoSuccess(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <aside className="relative w-full max-w-md bg-[#121214] border-l border-zinc-800 shadow-2xl flex flex-col h-full z-10">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-zinc-300" />
            <h2 className="text-base font-bold text-white font-display">Shopping Bag</h2>
            <span className="text-xs font-mono text-zinc-500">
              ({items.reduce((acc, i) => acc + i.quantity, 0)} items)
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close bag"
            className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {subtotal > 0 && (
          <div className="px-5 py-2.5 bg-zinc-950 border-b border-zinc-850 text-xs">
            {subtotal >= freeShippingThreshold ? (
              <p className="text-zinc-300 font-medium flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> You qualified for complimentary express shipping!
              </p>
            ) : (
              <p className="text-zinc-400">
                Add <span className="text-white font-mono font-medium">${(freeShippingThreshold - subtotal).toFixed(2)}</span> more to qualify for free express shipping.
              </p>
            )}
          </div>
        )}

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-zinc-600 mx-auto stroke-[1.5]" />
              <p className="text-sm text-zinc-400">Your shopping bag is empty.</p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.product.id}-${item.selectedOption}`}
                className="flex gap-4 p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-18 h-18 object-cover rounded-lg bg-zinc-900 border border-zinc-800 shrink-0"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-semibold text-zinc-100 truncate font-display">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => onRemoveItem(item.product.id, item.selectedOption)}
                      className="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-400 font-mono">
                    {item.selectedOption}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.selectedOption, -1)}
                        className="px-2 py-0.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-mono font-medium text-white tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.selectedOption, 1)}
                        className="px-2 py-0.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-sm font-mono font-bold text-zinc-200 tabular-nums">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Calculations */}
        {items.length > 0 && (
          <div className="p-5 border-t border-zinc-800 bg-[#09090b] space-y-4">
            {/* Promo Code Input */}
            <form onSubmit={handlePromoSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Promo code (e.g. SOLO10)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors cursor-pointer"
              >
                Apply
              </button>
            </form>
            {promoSuccess && (
              <p className="text-[11px] text-emerald-400 font-mono">10% discount applied!</p>
            )}
            {promoError && (
              <p className="text-[11px] text-red-400 font-mono">{promoError}</p>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono text-zinc-200 tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-mono">
                  <span>Discount ({discount}%)</span>
                  <span className="tabular-nums">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span className="font-mono text-zinc-200 tabular-nums">
                  {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                <span>Total</span>
                <span className="font-mono tabular-nums">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={onCheckout}
              className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-zinc-950 bg-zinc-100 hover:bg-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
