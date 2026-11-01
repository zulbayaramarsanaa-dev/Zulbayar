import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OwnerDashboardModal } from './components/OwnerDashboardModal';
import { UploadItemModal } from './components/UploadItemModal';
import { NotificationToast } from './components/NotificationToast';
import { SearchModal } from './components/SearchModal';
import { Footer } from './components/Footer';
import { PRODUCTS } from './data/products';
import { Product, CartItem, Order, OrderStatus } from './types';
import { playOrderChime } from './utils/audioAlert';

const CART_STORAGE_KEY = 'solo_cart_v1';
const OWNER_STORAGE_KEY = 'solo_owner_email';

export default function App() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Panels
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOwnerHQOpen, setIsOwnerHQOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Cart & Promo
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Store Owner & Orders telemetry
  const [ownerEmail, setOwnerEmail] = useState<string>(() => {
    return localStorage.getItem(OWNER_STORAGE_KEY) || 'zulbayaramarsanaa@gmail.com';
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);
  const [incomingAlert, setIncomingAlert] = useState<Order | null>(null);
  const [unreadOrdersCount, setUnreadOrdersCount] = useState(0);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart:', e);
    }
  }, [cart]);

  // Fetch initial products, orders & owner config from backend
  const fetchProductsAndOrders = useCallback(async () => {
    try {
      // Products
      const pRes = await fetch('/api/products');
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.products && pData.products.length > 0) {
          setProducts(pData.products);
        }
      }

      // Orders
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
        }
        if (data.ownerEmail) {
          setOwnerEmail(data.ownerEmail);
        }
      }
    } catch (err) {
      console.warn('Data could not be fetched from server:', err);
    }
  }, []);

  useEffect(() => {
    fetchProductsAndOrders();
  }, [fetchProductsAndOrders]);

  // Connect to SSE stream for immediate real-time incoming order notifications & catalog updates
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: any = null;

    function setupSSE() {
      try {
        eventSource = new EventSource('/api/orders/stream');

        eventSource.onopen = () => {
          setSseConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'NEW_ORDER' && data.order) {
              const newOrder = data.order;
              // Prepend to orders
              setOrders((prev) => {
                if (prev.some((o) => o.id === newOrder.id)) return prev;
                return [newOrder, ...prev];
              });

              // Increment badge and show toast
              setUnreadOrdersCount((c) => c + 1);
              setIncomingAlert(newOrder);

              // Sound chime
              if (soundEnabled) {
                playOrderChime();
              }

              // Flash page title
              document.title = `(1) New Order ${newOrder.id} - SOLO`;
              setTimeout(() => {
                document.title = 'SOLO Monochrome Store';
              }, 5000);
            } else if (data.type === 'PRODUCT_UPLOADED' && data.product) {
              setProducts((prev) => {
                if (prev.some((p) => p.id === data.product.id)) return prev;
                return [data.product, ...prev];
              });
            }
          } catch (e) {
            console.error('Error parsing SSE payload:', e);
          }
        };

        eventSource.onerror = () => {
          setSseConnected(false);
          eventSource?.close();
          retryTimeout = setTimeout(setupSSE, 4000);
        };
      } catch (err) {
        console.warn('SSE stream unavailable:', err);
      }
    }

    setupSSE();

    return () => {
      eventSource?.close();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [soundEnabled]);

  // Cart operations
  const handleAddToCart = (product: Product, option: string, quantity: number) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.product.id === product.id && i.selectedOption === option
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += quantity;
        return copy;
      }
      return [...prev, { product, selectedOption: option, quantity }];
    });

    setRecentlyAddedId(product.id);
    setTimeout(() => setRecentlyAddedId(null), 1800);
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultOption = product.options && product.options.length > 0 ? product.options[0] : 'Standard';
    handleAddToCart(product, defaultOption, 1);
  };

  const handleUpdateQuantity = (productId: string, option: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId && item.selectedOption === option) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (productId: string, option: string) => {
    setCart((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.selectedOption === option))
    );
  };

  const handleApplyPromo = (code: string) => {
    const upper = code.toUpperCase();
    if (upper === 'SOLO10') {
      setDiscountPercent(10);
      return true;
    }
    if (upper === 'MONOCHROME') {
      setDiscountPercent(15);
      return true;
    }
    return false;
  };

  const handleDirectBuy = (product: Product, option: string, quantity: number) => {
    handleAddToCart(product, option, quantity);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    // Clear shopping cart
    setCart([]);
    // Update local orders
    setOrders((prev) => {
      if (prev.some((o) => o.id === order.id)) return prev;
      return [order, ...prev];
    });
    // Trigger audio chime for store owner
    if (soundEnabled) {
      playOrderChime();
    }
    // Increment unread count
    setUnreadOrdersCount((c) => c + 1);
  };

  // Owner HQ operations
  const handleUpdateOwnerEmail = async (email: string) => {
    setOwnerEmail(email);
    localStorage.setItem(OWNER_STORAGE_KEY, email);
    try {
      await fetch('/api/owner/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerEmail: email }),
      });
    } catch (err) {
      console.warn('Failed to update config on server:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.warn('Failed to update order status on server:', err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to delete order on server:', err);
    }
  };

  const handleSendTestOrder = async () => {
    try {
      const res = await fetch('/api/owner/test-notification', { method: 'POST' });
      const data = await res.json();
      if (data.order) {
        setOrders((prev) => [data.order, ...prev.filter((o) => o.id !== data.order.id)]);
        setIncomingAlert(data.order);
        setUnreadOrdersCount((c) => c + 1);
        if (soundEnabled) {
          playOrderChime();
        }
      }
    } catch (err) {
      console.error('Error sending test order:', err);
    }
  };

  const handleUploadProduct = async (productData: Partial<Product>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) => [data.product, ...prev]);
      } else {
        throw new Error(data.error || 'Failed to upload product');
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    try {
      await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to delete product on server:', err);
    }
  };

  const handleToggleProductStock = async (productId: string, inStock: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inStock } : p))
    );
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock }),
      });
    } catch (err) {
      console.warn('Failed to toggle stock on server:', err);
    }
  };

  const handleUpdateProductStock = async (productId: string, stockCount: number) => {
    const validCount = Math.max(0, stockCount);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stockCount: validCount, inStock: validCount > 0 } : p))
    );
    try {
      await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockCount: validCount }),
      });
    } catch (err) {
      console.warn('Failed to update product stock:', err);
    }
  };

  const handleOpenOwnerHQ = () => {
    setIsOwnerHQOpen(true);
    setUnreadOrdersCount(0);
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-[#e4e4e7] flex flex-col selection:bg-zinc-800 selection:text-white">
      {/* Top Banner indicating owner configuration & upload item shortcut */}
      <div className="bg-[#121214] border-b border-zinc-800/80 px-4 py-2 text-center text-xs text-zinc-400 flex flex-wrap items-center justify-center gap-2">
        <span className="hidden sm:inline text-zinc-500 font-mono">SOLO STORE ENGINE:</span>
        <span>Orders automatically transmit to founder</span>
        <span className="font-mono text-zinc-200">({ownerEmail})</span>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="ml-2 px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 hover:text-white font-mono text-[11px] font-semibold cursor-pointer"
        >
          + Upload Item on Sale
        </button>
        <button
          onClick={handleOpenOwnerHQ}
          className="ml-1 text-xs font-semibold text-zinc-200 hover:text-white underline cursor-pointer"
        >
          View Owner HQ
        </button>
      </div>

      {/* Navigation Bar */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOwnerHQ={handleOpenOwnerHQ}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSearchQuery('');
          const el = document.getElementById('collection');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        selectedCategory={selectedCategory}
        unreadOrdersCount={unreadOrdersCount}
        onSearchClick={() => setIsSearchOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onExplore={() => {
            const el = document.getElementById('collection');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onFilterCategory={(cat) => {
            setSelectedCategory(cat);
            const el = document.getElementById('collection');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Product Catalog Grid */}
        <ProductGrid
          products={products}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onQuickAdd={handleQuickAdd}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          recentlyAddedId={recentlyAddedId}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenOwnerHQ={handleOpenOwnerHQ}
        onFilterCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('collection');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onDirectBuy={handleDirectBuy}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        discount={discountPercent}
        onApplyPromo={handleApplyPromo}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        discount={discountPercent}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Owner HQ Portal */}
      <OwnerDashboardModal
        isOpen={isOwnerHQOpen}
        onClose={() => setIsOwnerHQOpen(false)}
        orders={orders}
        ownerEmail={ownerEmail}
        onUpdateOwnerEmail={handleUpdateOwnerEmail}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onDeleteOrder={handleDeleteOrder}
        onSendTestOrder={handleSendTestOrder}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        sseConnected={sseConnected}
        products={products}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onDeleteProduct={handleDeleteProduct}
        onToggleProductStock={handleToggleProductStock}
        onUpdateProductStock={handleUpdateProductStock}
      />

      {/* Upload Item Modal */}
      <UploadItemModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadProduct={handleUploadProduct}
      />

      {/* Quick Search Overlay */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Incoming Order Toast */}
      <NotificationToast
        order={incomingAlert}
        onClose={() => setIncomingAlert(null)}
        onOpenOwnerHQ={handleOpenOwnerHQ}
        ownerEmail={ownerEmail}
      />
    </div>
  );
}
