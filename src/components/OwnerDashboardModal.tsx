import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Bell,
  Volume2,
  VolumeX,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Package,
  RefreshCw,
  Send,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { generateOrderMailtoUrl, playOrderChime } from '../utils/audioAlert';

interface OwnerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  ownerEmail: string;
  onUpdateOwnerEmail: (email: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onSendTestOrder: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  sseConnected: boolean;
  products: import('../types').Product[];
  onOpenUploadModal: () => void;
  onDeleteProduct: (productId: string) => void;
  onToggleProductStock: (productId: string, inStock: boolean) => void;
  onUpdateProductStock: (productId: string, stockCount: number) => void;
}

export const OwnerDashboardModal: React.FC<OwnerDashboardModalProps> = ({
  isOpen,
  onClose,
  orders,
  ownerEmail,
  onUpdateOwnerEmail,
  onUpdateOrderStatus,
  onDeleteOrder,
  onSendTestOrder,
  soundEnabled,
  onToggleSound,
  sseConnected,
  products,
  onOpenUploadModal,
  onDeleteProduct,
  onToggleProductStock,
  onUpdateProductStock,
}) => {
  if (!isOpen) return null;

  const [mainView, setMainView] = useState<'orders' | 'inventory'>('orders');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'dispatched' | 'delivered'>('all');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [copiedManifestId, setCopiedManifestId] = useState<string | null>(null);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(ownerEmail);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Financial metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const processingCount = orders.filter((o) => o.status === 'processing').length;
  const dispatchedCount = orders.filter((o) => o.status === 'dispatched').length;

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    return o.status === activeTab;
  });

  const handleCopyManifest = (order: Order) => {
    const text = `SOLO ORDER ${order.id}
Date: ${new Date(order.createdAt).toLocaleString()}
Customer: ${order.customer.fullName} (${order.customer.email} / ${order.customer.phone})
Address: ${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}
${order.shippingAddress.deliveryNotes ? `Notes: ${order.shippingAddress.deliveryNotes}\n` : ''}
Items:
${order.items.map((i) => `- ${i.quantity}x ${i.productName} [${i.selectedOption}] ($${i.totalPrice})`).join('\n')}
Total: $${order.total.toFixed(2)} (${order.paymentMethod})`;

    navigator.clipboard.writeText(text);
    setCopiedManifestId(order.id);
    setTimeout(() => setCopiedManifestId(null), 2000);
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempEmail.trim()) {
      onUpdateOwnerEmail(tempEmail.trim());
      setIsEditingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-[#0f0f11] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 bg-[#141417] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-zinc-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                  SOLO Owner HQ
                </h2>
                <span className="flex items-center gap-1.5 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      sseConnected ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <span>{sseConnected ? 'Live Real-time Feed' : 'Connecting...'}</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Every incoming customer order transmits directly to you here.
              </p>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenUploadModal}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-md"
              title="Upload new item on sale"
            >
              <Package className="w-3.5 h-3.5" />
              <span>+ Upload Item on Sale</span>
            </button>

            <button
              onClick={() => {
                playOrderChime();
                onToggleSound();
              }}
              title={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">Audio</span>
            </button>

            <button
              onClick={onSendTestOrder}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              title="Simulate customer placing order to test notifications"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Test Order</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-850 cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher: Orders Feed vs Items on Sale */}
        <div className="px-6 py-2 bg-zinc-950 border-b border-zinc-850 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMainView('orders')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                mainView === 'orders'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Incoming Orders ({orders.length})
            </button>
            <button
              onClick={() => setMainView('inventory')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                mainView === 'inventory'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Items on Sale Catalog ({products.length})
            </button>
          </div>

          <div className="text-[11px] font-mono text-zinc-400">
            {mainView === 'orders' ? 'Live Order Pipeline' : 'Only uploaded items appear in store'}
          </div>
        </div>

        {/* Owner Email & Notification Banner */}
        <div className="px-6 py-3 bg-zinc-950/80 border-b border-zinc-850 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400">Shop Owner Recipient:</span>
            {isEditingEmail ? (
              <form onSubmit={handleSaveEmail} className="flex items-center gap-2">
                <input
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-xs text-white font-mono"
                />
                <button
                  type="submit"
                  className="px-2 py-0.5 bg-zinc-200 text-zinc-950 font-semibold rounded text-[11px] cursor-pointer"
                >
                  Save
                </button>
              </form>
            ) : (
              <span className="text-white font-mono font-medium">{ownerEmail}</span>
            )}
            {!isEditingEmail && (
              <button
                onClick={() => setIsEditingEmail(true)}
                className="text-zinc-500 hover:text-zinc-300 underline cursor-pointer ml-1 text-[11px]"
              >
                Change
              </button>
            )}
          </div>

          <div className="text-zinc-500 text-[11px] font-mono">
            Auto-dispatched upon checkout completion
          </div>
        </div>

        {/* Conditional View: Orders Feed OR Inventory Manager */}
        {mainView === 'orders' ? (
          <>
            {/* Metrics Bar */}
            <div className="p-6 border-b border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#111114]">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <p className="text-xs font-mono text-zinc-500 uppercase">Total Orders</p>
                <p className="text-2xl font-bold text-white font-mono tabular-nums mt-1">{orders.length}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <p className="text-xs font-mono text-zinc-500 uppercase">Gross Revenue</p>
                <p className="text-2xl font-bold text-white font-mono tabular-nums mt-1">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <p className="text-xs font-mono text-zinc-500 uppercase">Pending Review</p>
                <p className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-1">{pendingCount}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <p className="text-xs font-mono text-zinc-500 uppercase">Dispatched</p>
                <p className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">{dispatchedCount}</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-6 py-3 border-b border-zinc-850 flex items-center gap-2 overflow-x-auto bg-[#0d0d0f]">
              {(['all', 'pending', 'processing', 'dispatched', 'delivered'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  {tab} ({tab === 'all' ? orders.length : orders.filter((o) => o.status === tab).length})
                </button>
              ))}
            </div>

            {/* Orders Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Package className="w-10 h-10 text-zinc-600 mx-auto" />
                  <p className="text-sm text-zinc-400">No orders currently under this status filter.</p>
                  <button
                    onClick={onSendTestOrder}
                    className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  >
                    Create a Test Customer Order
                  </button>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const mailtoUrl = generateOrderMailtoUrl(order, ownerEmail);
                  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`
                  )}`;

                  return (
                    <div
                      key={order.id}
                      className="bg-[#141417] border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all p-5 space-y-4"
                    >
                      {/* Order Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-850">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-base font-bold text-white tracking-wide">
                            {order.id}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono">
                            {new Date(order.createdAt).toLocaleDateString()} at{' '}
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {order.id.includes('TEST') && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">
                              Simulation
                            </span>
                          )}
                        </div>

                        {/* Status Selector & Actions */}
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${
                              order.status === 'pending'
                                ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                                : order.status === 'processing'
                                ? 'bg-blue-950/60 border-blue-800 text-blue-300'
                                : order.status === 'dispatched'
                                ? 'bg-indigo-950/60 border-indigo-800 text-indigo-300'
                                : order.status === 'delivered'
                                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                            }`}
                          >
                            <option value="pending">Pending Review</option>
                            <option value="processing">Processing</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          <button
                            onClick={() => onDeleteOrder(order.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-850 transition-colors cursor-pointer"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Customer & Shipping 2-Column Split */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Customer Info */}
                        <div className="p-3.5 bg-zinc-950/60 rounded-lg border border-zinc-850 space-y-2">
                          <p className="font-mono uppercase text-zinc-500 text-[11px]">Customer</p>
                          <p className="text-sm font-semibold text-white">{order.customer.fullName}</p>
                          
                          <div className="space-y-1 text-zinc-300">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                              <a href={`mailto:${order.customer.email}`} className="hover:underline font-mono text-zinc-300">
                                {order.customer.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                              <a href={`tel:${order.customer.phone}`} className="hover:underline font-mono text-zinc-300">
                                {order.customer.phone}
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="p-3.5 bg-zinc-950/60 rounded-lg border border-zinc-850 space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="font-mono uppercase text-zinc-500 text-[11px]">Shipping Destination</p>
                            <a
                              href={googleMapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
                            >
                              <span>Maps</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          <div className="text-zinc-200 leading-snug">
                            <p className="font-medium">{order.shippingAddress.addressLine1}</p>
                            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                            <p>
                              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                            </p>
                            <p className="text-zinc-400">{order.shippingAddress.country}</p>
                            {order.shippingAddress.deliveryNotes && (
                              <p className="mt-1.5 text-zinc-400 italic bg-zinc-900/80 p-1.5 rounded border border-zinc-850">
                                Note: "{order.shippingAddress.deliveryNotes}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Purchased Items List */}
                      <div className="space-y-2">
                        <p className="font-mono uppercase text-zinc-500 text-[11px]">
                          Items Purchased ({order.items.reduce((s, i) => s + i.quantity, 0)} units)
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-2 rounded-lg bg-zinc-950/40 border border-zinc-850"
                            >
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-12 h-12 object-cover rounded bg-zinc-900 shrink-0"
                              />
                              <div className="min-w-0 flex-1 text-xs">
                                <p className="font-semibold text-zinc-200 truncate">{item.productName}</p>
                                <p className="text-zinc-400 font-mono text-[11px]">
                                  Variant: {item.selectedOption} · Qty: {item.quantity}
                                </p>
                                <p className="font-mono font-medium text-white tabular-nums">
                                  ${item.totalPrice.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Financials & Action Buttons */}
                      <div className="pt-3 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-xs font-mono">
                          <span className="text-zinc-400">Total:</span>
                          <span className="text-lg font-bold text-white tabular-nums">${order.total.toFixed(2)}</span>
                          <span className="text-zinc-500 font-normal">({order.paymentMethod})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* One-Click Native Email Launch to Owner */}
                          <a
                            href={mailtoUrl}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 border border-zinc-700 transition-colors"
                            title="Send formatted email dispatch to owner's inbox"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email to {ownerEmail.split('@')[0]}</span>
                          </a>

                          {/* Copy Manifest for WhatsApp / Telegram / SMS */}
                          <button
                            onClick={() => handleCopyManifest(order)}
                            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 border border-zinc-800 transition-colors cursor-pointer"
                            title="Copy text manifest for messaging or clipboard"
                          >
                            {copiedManifestId === order.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Manifest Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Manifest</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* Inventory Manager: Items on Sale Catalog */
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Current Items on Sale ({products.length})
                </h3>
                <p className="text-xs text-zinc-400">
                  Only the items you upload or approve here will be visible for shoppers to buy.
                </p>
              </div>

              <button
                onClick={onOpenUploadModal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Package className="w-3.5 h-3.5" />
                <span>+ Upload New Sale Item</span>
              </button>
            </div>

            {/* Products Table / Cards */}
            <div className="space-y-3">
              {products.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Package className="w-12 h-12 text-zinc-600 mx-auto" />
                  <p className="text-zinc-300 text-sm">No items currently on sale in your shop.</p>
                  <button
                    onClick={onOpenUploadModal}
                    className="px-4 py-2 text-xs font-bold text-zinc-950 bg-zinc-100 hover:bg-white rounded-lg"
                  >
                    Upload Your First Sale Item
                  </button>
                </div>
              ) : (
                products.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 bg-[#141417] border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-16 h-16 rounded-lg object-cover bg-zinc-950 border border-zinc-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono uppercase text-zinc-500">
                            {prod.category}
                          </span>
                          {prod.saleDiscountPercent && (
                            <span className="text-[10px] font-mono font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-900">
                              {prod.saleDiscountPercent}% OFF
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-white truncate font-display">
                          {prod.name}
                        </h4>
                        <div className="flex items-baseline gap-2 text-xs font-mono mt-0.5">
                          <span className="text-emerald-400 font-bold tabular-nums">
                            Sale: ${prod.price}
                          </span>
                          {prod.originalPrice && (
                            <span className="text-zinc-500 line-through tabular-nums">
                              Orig: ${prod.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stock Stepper & Status Controls */}
                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-850">
                      {/* Stock Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs font-mono">
                        <span className="text-zinc-400 text-[11px] px-1">Stock:</span>
                        <button
                          onClick={() => onUpdateProductStock(prod.id, Math.max(0, prod.stockCount - 1))}
                          className="w-5 h-5 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                          title="Decrease stock"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-white tabular-nums">
                          {prod.stockCount}
                        </span>
                        <button
                          onClick={() => onUpdateProductStock(prod.id, prod.stockCount + 1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
                          title="Increase stock"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => onToggleProductStock(prod.id, !prod.inStock)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          prod.inStock
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                            : 'bg-red-950/50 border-red-800 text-red-300'
                        }`}
                      >
                        {prod.inStock ? 'In Stock' : 'Sold Out'}
                      </button>

                      <button
                        onClick={() => onDeleteProduct(prod.id)}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-850 rounded-lg transition-colors cursor-pointer"
                        title="Remove from sale"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
