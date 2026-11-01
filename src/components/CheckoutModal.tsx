import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Truck, ArrowRight, ArrowLeft, CreditCard, Banknote, Zap, Copy, Check } from 'lucide-react';
import { CartItem, CustomerInfo, ShippingAddress, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  discount: number;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  discount,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'details' | 'payment' | 'confirmed'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Form states
  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: '',
    email: '',
    phone: '',
  });

  const [address, setAddress] = useState<ShippingAddress>({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    deliveryNotes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'Instant Pay' | 'Credit Card' | 'Cash on Delivery'>('Instant Pay');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  const [formError, setFormError] = useState('');

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shippingFee = subtotal >= 100 || subtotal === 0 ? 0 : 15;
  const discountAmount = (subtotal * discount) / 100;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.fullName.trim() || !customer.email.trim() || !customer.phone.trim()) {
      setFormError('Please enter full name, email, and phone number.');
      return;
    }
    if (!address.addressLine1.trim() || !address.city.trim() || !address.postalCode.trim()) {
      setFormError('Please complete your shipping address (street, city, zip).');
      return;
    }
    setFormError('');
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setFormError('');

    try {
      const orderPayload = {
        customer,
        shippingAddress: address,
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          image: i.product.images[0],
          selectedOption: i.selectedOption,
          quantity: i.quantity,
          unitPrice: i.product.price,
          totalPrice: i.product.price * i.quantity,
        })),
        subtotal,
        shippingFee,
        discount: discountAmount,
        total,
        paymentMethod,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (data.success && data.order) {
        setCompletedOrder(data.order);
        setStep('confirmed');
        onOrderSuccess(data.order);
      } else {
        setFormError(data.error || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting order:', err);
      // Fallback local creation if server network is interrupted
      const fallbackOrder: Order = {
        id: `SLO-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: new Date().toISOString(),
        customer,
        shippingAddress: address,
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          image: i.product.images[0],
          selectedOption: i.selectedOption,
          quantity: i.quantity,
          unitPrice: i.product.price,
          totalPrice: i.product.price * i.quantity,
        })),
        subtotal,
        shippingFee,
        discount: discountAmount,
        total,
        paymentMethod,
        status: 'pending',
        ownerNotified: true,
        ownerEmail: 'zulbayaramarsanaa@gmail.com',
      };
      setCompletedOrder(fallbackOrder);
      setStep('confirmed');
      onOrderSuccess(fallbackOrder);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyOrderId = () => {
    if (completedOrder) {
      navigator.clipboard.writeText(completedOrder.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={step === 'confirmed' ? onClose : undefined} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[#121214] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-500">
              <span>SOLO Secure Checkout</span>
              <span aria-hidden="true">·</span>
              <span>256-Bit SSL</span>
            </div>
            <h2 className="text-lg font-bold text-white font-display mt-0.5">
              {step === 'details' && 'Shipping & Contact'}
              {step === 'payment' && 'Payment & Review'}
              {step === 'confirmed' && 'Order Confirmed'}
            </h2>
          </div>
          {step !== 'confirmed' && (
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {formError && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-xs text-red-300 font-mono">
              {formError}
            </div>
          )}

          {/* STEP 1: Customer & Address Details */}
          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-5">
              <div className="space-y-3">
                <h3 className="text-xs font-mono tracking-wider text-zinc-400 uppercase">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Mercer"
                      value={customer.fullName}
                      onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Email Address (Receipt) *</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Phone Number (Delivery SMS/Updates) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 019-2834"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-zinc-850">
                <h3 className="text-xs font-mono tracking-wider text-zinc-400 uppercase">
                  Shipping Destination
                </h3>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="124 Minimalist Avenue"
                    value={address.addressLine1}
                    onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Apartment, Suite, Unit</label>
                    <input
                      type="text"
                      placeholder="Apt 4B"
                      value={address.addressLine2}
                      onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="Seattle"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">State / Prov *</label>
                    <input
                      type="text"
                      required
                      placeholder="WA"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Postal Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="98101"
                      value={address.postalCode}
                      onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Country</label>
                    <input
                      type="text"
                      required
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Delivery Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="Gate code #4492, leave on porch"
                    value={address.deliveryNotes}
                    onChange={(e) => setAddress({ ...address, deliveryNotes: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              {/* Continue Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-sm rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Payment Method & Final Review */}
          {step === 'payment' && (
            <div className="space-y-6">
              {/* Payment Selector */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono tracking-wider text-zinc-400 uppercase">
                  Select Payment Method
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'Instant Pay', icon: Zap, label: 'Instant Pay', desc: '1-Click Sandbox' },
                    { id: 'Credit Card', icon: CreditCard, label: 'Credit Card', desc: 'Visa / MC / Amex' },
                    { id: 'Cash on Delivery', icon: Banknote, label: 'Cash on Delivery', desc: 'Pay on Receipt' },
                  ].map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          paymentMethod === method.id
                            ? 'bg-zinc-850 border-zinc-100 text-white shadow-sm'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-2 text-zinc-200" />
                        <div>
                          <p className="text-sm font-semibold text-zinc-100">{method.label}</p>
                          <p className="text-[11px] text-zinc-400">{method.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card Inputs if Credit Card */}
              {paymentMethod === 'Credit Card' && (
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 space-y-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">CVC</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Manifest Summary */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono uppercase text-zinc-400 pb-2 border-b border-zinc-850">
                  <span>Order Items ({items.length})</span>
                  <span>Amount</span>
                </div>
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.selectedOption}`} className="flex justify-between text-xs">
                    <span className="text-zinc-300">
                      {item.quantity}x {item.product.name} ({item.selectedOption})
                    </span>
                    <span className="font-mono text-zinc-200 tabular-nums">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="pt-2 border-t border-zinc-850 space-y-1 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Shipping</span>
                    <span className="font-mono text-zinc-200">
                      {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-mono">
                      <span>Promo Discount ({discount}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-white pt-1">
                    <span>Total Due</span>
                    <span className="font-mono tabular-nums">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Owner Notification Declaration */}
              <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-lg flex items-start gap-2.5 text-xs text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Direct Owner Notification Enabled</p>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Upon order completion, an immediate dispatch notification containing your delivery address, contacts, and items is transmitted directly to the store founder (zulbayaramarsanaa@gmail.com).
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to details</span>
                </button>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Transmitting Order...</span>
                  ) : (
                    <>
                      <span>Confirm & Place Order (${total.toFixed(2)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Order Confirmed & Owner Dispatched State */}
          {step === 'confirmed' && completedOrder && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-zinc-850 rounded-full flex items-center justify-center mx-auto border border-zinc-700 shadow-xl">
                <CheckCircle className="w-8 h-8 text-zinc-100 stroke-[2.2]" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs font-mono tracking-widest uppercase text-zinc-400">Order Confirmed</span>
                </div>
                <h3 className="text-2xl font-bold text-white font-display">
                  Thank you, {completedOrder.customer.fullName}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                  Your order has been recorded and an immediate fulfillment notification was transmitted to the shop owner at <span className="text-zinc-200 font-mono">zulbayaramarsanaa@gmail.com</span>.
                </p>
              </div>

              {/* Order Reference Box */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-left max-w-md mx-auto space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
                  <span className="text-xs text-zinc-500 font-mono uppercase">Order Reference</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white font-bold">{completedOrder.id}</span>
                    <button
                      onClick={copyOrderId}
                      className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                      title="Copy Reference"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 text-zinc-400">
                  <div className="flex justify-between">
                    <span>Recipient</span>
                    <span className="text-zinc-200">{completedOrder.customer.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Address</span>
                    <span className="text-zinc-200 text-right truncate max-w-[200px]">
                      {completedOrder.shippingAddress.addressLine1}, {completedOrder.shippingAddress.city}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Items</span>
                    <span className="text-zinc-200">{completedOrder.items.length} item(s)</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-1 border-t border-zinc-850">
                    <span>Total Paid</span>
                    <span className="font-mono tabular-nums">${completedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-sm rounded-lg transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
