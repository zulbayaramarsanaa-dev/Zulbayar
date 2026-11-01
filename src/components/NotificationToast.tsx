import React from 'react';
import { Bell, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { Order } from '../types';

interface NotificationToastProps {
  order: Order | null;
  onClose: () => void;
  onOpenOwnerHQ: () => void;
  ownerEmail: string;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  order,
  onClose,
  onOpenOwnerHQ,
  ownerEmail,
}) => {
  if (!order) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="p-4 bg-[#141417] border border-zinc-700/90 rounded-2xl shadow-2xl shadow-black/80 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-100 border border-zinc-700 shrink-0">
              <Bell className="w-4 h-4 text-emerald-400 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Incoming Order Transmitted
              </p>
              <h4 className="text-sm font-bold text-white font-display">
                Order #{order.id} · ${order.total.toFixed(2)}
              </h4>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Dismiss toast"
            className="p-1 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-zinc-300 space-y-1 bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-850">
          <p className="truncate">
            <span className="text-zinc-500">Customer:</span> {order.customer.fullName}
          </p>
          <p className="truncate">
            <span className="text-zinc-500">Destination:</span> {order.shippingAddress.city}, {order.shippingAddress.state} ({order.shippingAddress.country})
          </p>
          <p className="text-[11px] text-zinc-400 pt-0.5 border-t border-zinc-850/80">
            Dispatched to Owner: <span className="text-zinc-200 font-mono">{ownerEmail}</span>
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={() => {
              onClose();
              onOpenOwnerHQ();
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>Open in Owner HQ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
