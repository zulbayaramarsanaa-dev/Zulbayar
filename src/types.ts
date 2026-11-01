export interface Product {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number; // Sale price
  originalPrice?: number; // Regular/original price for strikethrough
  isOnSale?: boolean;
  saleDiscountPercent?: number;
  category: 'Apparel' | 'Carry' | 'Objects & Tech' | 'Accessories';
  images: string[];
  specs: { label: string; value: string }[];
  options?: string[]; // e.g. ["S", "M", "L", "XL"] or ["Matte Black", "Charcoal Grey"]
  isNew?: boolean;
  inStock: boolean;
  stockCount: number;
}

export interface CartItem {
  product: Product;
  selectedOption: string;
  quantity: number;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  deliveryNotes?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';

export interface OrderItemRecord {
  productId: string;
  productName: string;
  image: string;
  selectedOption: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  createdAt: string;
  customer: CustomerInfo;
  shippingAddress: ShippingAddress;
  items: OrderItemRecord[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: 'Instant Pay' | 'Credit Card' | 'Cash on Delivery';
  status: OrderStatus;
  ownerNotified: boolean;
  ownerEmail: string;
  notificationLog?: {
    channel: string;
    timestamp: string;
    status: string;
  }[];
}

export interface OwnerConfig {
  ownerEmail: string;
  ownerName: string;
  soundAlertsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  webhookUrl?: string;
}
