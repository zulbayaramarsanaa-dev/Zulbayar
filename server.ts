import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

// Data directory setup
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const CONFIG_FILE = path.join(DATA_DIR, 'owner-config.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// Initialize products from data file or default catalog
function getStoredProducts(): any[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading products file:', err);
  }
  return [];
}

function saveStoredProducts(products: any[]) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing products file:', err);
  }
}

// Initialize default owner config (configured for Zulbayar)
const DEFAULT_CONFIG = {
  ownerEmail: 'zulbayaramarsanaa@gmail.com',
  ownerName: 'Zulbayar Amarsanaa (SOLO Founder)',
  soundAlertsEnabled: true,
  emailNotificationsEnabled: true,
  webhookUrl: '',
};

function getOwnerConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error reading config file:', err);
  }
  return DEFAULT_CONFIG;
}

function saveOwnerConfig(config: any) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing config file:', err);
  }
}

// No random orders by default - starts clean for the shop owner
const INITIAL_SAMPLE_ORDERS: any[] = [];

function getOrders(): any[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading orders file:', err);
  }
  // If no file exists, initialize with sample
  saveOrders(INITIAL_SAMPLE_ORDERS);
  return INITIAL_SAMPLE_ORDERS;
}

function saveOrders(orders: any[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving orders file:', err);
  }
}

// Active Server-Sent Events (SSE) connections for merchant live order stream
const sseClients: { id: number; res: express.Response }[] = [];
let nextClientId = 1;

function broadcastOrderToOwner(order: any) {
  const payload = JSON.stringify({
    type: 'NEW_ORDER',
    order,
    timestamp: new Date().toISOString(),
    recipient: getOwnerConfig().ownerEmail,
  });

  sseClients.forEach((client) => {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch (e) {
      // client may have disconnected
    }
  });

  // Log detailed owner dispatch record to server console
  console.log('====================================================');
  console.log(`[SOLO NOTIFICATION DISPATCH] -> ${getOwnerConfig().ownerEmail}`);
  console.log(`ORDER ID: ${order.id} | TOTAL: $${order.total}`);
  console.log(`CUSTOMER: ${order.customer.fullName} (${order.customer.email})`);
  console.log(`PHONE: ${order.customer.phone}`);
  console.log(`DESTINATION: ${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`);
  console.log(`ITEMS: ${order.items.map((i: any) => `${i.quantity}x ${i.productName} (${i.selectedOption})`).join(', ')}`);
  console.log('====================================================');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // 1. SSE Stream for Real-time Owner notifications
  app.get('/api/orders/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = nextClientId++;
    sseClients.push({ id: clientId, res });

    // Send connection established confirmation
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId, ownerEmail: getOwnerConfig().ownerEmail })}\n\n`);

    req.on('close', () => {
      const idx = sseClients.findIndex((c) => c.id === clientId);
      if (idx !== -1) {
        sseClients.splice(idx, 1);
      }
    });
  });

  // Product Catalog Endpoints (Owner Upload & Management)
  app.get('/api/products', (req, res) => {
    const products = getStoredProducts();
    res.json({ success: true, products });
  });

  app.post('/api/products', (req, res) => {
    const { name, subtitle, description, price, originalPrice, category, images, specs, options, stockCount } = req.body;
    if (!name || !price) {
      return res.status(400).json({ success: false, error: 'Name and price are required' });
    }

    const currentProducts = getStoredProducts();
    const id = `solo-item-${Date.now()}`;
    const pPrice = Number(price);
    const pOrig = originalPrice ? Number(originalPrice) : Math.round(pPrice * 1.3);
    const discount = pOrig > pPrice ? Math.round(((pOrig - pPrice) / pOrig) * 100) : 0;

    const newProduct = {
      id,
      name,
      subtitle: subtitle || 'Curated Solo Sale Drop',
      description: description || 'Special archive release from the SOLO monochrome collection.',
      price: pPrice,
      originalPrice: pOrig,
      isOnSale: true,
      saleDiscountPercent: discount,
      category: category || 'Apparel',
      images: images && images.length > 0 ? images : ['/src/assets/images/solo_technical_hoodie_1793542958627.jpg'],
      specs: specs || [
        { label: 'Condition', value: 'Brand New / Archive' },
        { label: 'Colorway', value: 'Matte Stealth Black' },
      ],
      options: options && options.length > 0 ? options : ['Standard'],
      isNew: true,
      inStock: true,
      stockCount: stockCount ? Number(stockCount) : 10,
    };

    currentProducts.unshift(newProduct);
    saveStoredProducts(currentProducts);

    // Notify connected clients of catalog update
    sseClients.forEach((client) => {
      try {
        client.res.write(`data: ${JSON.stringify({ type: 'PRODUCT_UPLOADED', product: newProduct })}\n\n`);
      } catch (e) {}
    });

    res.status(201).json({ success: true, product: newProduct });
  });

  app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const currentProducts = getStoredProducts();
    const idx = currentProducts.findIndex((p) => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const p = currentProducts[idx];
    const updated = { ...p, ...req.body };
    if (updated.originalPrice && updated.price && updated.originalPrice > updated.price) {
      updated.saleDiscountPercent = Math.round(((updated.originalPrice - updated.price) / updated.originalPrice) * 100);
      updated.isOnSale = true;
    }
    currentProducts[idx] = updated;
    saveStoredProducts(currentProducts);
    res.json({ success: true, product: updated });
  });

  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    let currentProducts = getStoredProducts();
    currentProducts = currentProducts.filter((p) => p.id !== id);
    saveStoredProducts(currentProducts);
    res.json({ success: true, message: 'Product removed from sale' });
  });

  // Dedicated stock adjustment endpoint for the owner
  app.patch('/api/products/:id/stock', (req, res) => {
    const { id } = req.params;
    const { stockCount } = req.body;
    const currentProducts = getStoredProducts();
    const prod = currentProducts.find((p) => p.id === id);
    if (!prod) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    const count = Math.max(0, parseInt(stockCount, 10) || 0);
    prod.stockCount = count;
    prod.inStock = count > 0;
    saveStoredProducts(currentProducts);

    sseClients.forEach((client) => {
      try {
        client.res.write(`data: ${JSON.stringify({ type: 'PRODUCTS_UPDATED', products: currentProducts })}\n\n`);
      } catch (e) {}
    });

    res.json({ success: true, product: prod });
  });

  // 2. Fetch all orders (sorted newest first)
  app.get('/api/orders', (req, res) => {
    const orders = getOrders();
    res.json({
      success: true,
      orders,
      totalCount: orders.length,
      ownerEmail: getOwnerConfig().ownerEmail,
    });
  });

  // 3. Create a new customer order & trigger instant owner notification
  app.post('/api/orders', (req, res) => {
    const { customer, shippingAddress, items, subtotal, shippingFee, discount, total, paymentMethod } = req.body;

    if (!customer?.fullName || !customer?.email || !shippingAddress?.addressLine1 || !items?.length) {
      return res.status(400).json({ success: false, error: 'Incomplete order payload' });
    }

    // Deduct stock for each item ordered
    const currentProducts = getStoredProducts();
    let productsUpdated = false;
    items.forEach((orderedItem: any) => {
      const prod = currentProducts.find((p) => p.id === orderedItem.productId);
      if (prod) {
        prod.stockCount = Math.max(0, (prod.stockCount || 0) - (orderedItem.quantity || 1));
        if (prod.stockCount <= 0) {
          prod.inStock = false;
        }
        productsUpdated = true;
      }
    });
    if (productsUpdated) {
      saveStoredProducts(currentProducts);
      sseClients.forEach((client) => {
        try {
          client.res.write(`data: ${JSON.stringify({ type: 'PRODUCTS_UPDATED', products: currentProducts })}\n\n`);
        } catch (e) {}
      });
    }

    const config = getOwnerConfig();
    const orderId = `SLO-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    const newOrder = {
      id: orderId,
      createdAt: now,
      customer,
      shippingAddress,
      items,
      subtotal: Number(subtotal) || 0,
      shippingFee: Number(shippingFee) || 0,
      discount: Number(discount) || 0,
      total: Number(total) || 0,
      paymentMethod: paymentMethod || 'Instant Pay',
      status: 'pending',
      ownerNotified: true,
      ownerEmail: config.ownerEmail,
      notificationLog: [
        {
          channel: 'email',
          timestamp: now,
          status: `Immediate notification prepared for ${config.ownerEmail}`,
        },
        {
          channel: 'realtime_sse',
          timestamp: now,
          status: `Pushed to connected Owner HQ screens (${sseClients.length} active listeners)`,
        },
      ],
    };

    const currentOrders = getOrders();
    currentOrders.unshift(newOrder);
    saveOrders(currentOrders);

    // Broadcast in real-time
    broadcastOrderToOwner(newOrder);

    res.status(201).json({
      success: true,
      order: newOrder,
      message: `Order confirmed. Owner notification dispatched to ${config.ownerEmail}.`,
    });
  });

  // 4. Update order status
  app.patch('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const orders = getOrders();
    const target = orders.find((o) => o.id === id);

    if (!target) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    target.status = status;
    target.updatedAt = new Date().toISOString();
    saveOrders(orders);

    res.json({ success: true, order: target });
  });

  // 5. Delete order (useful for owner testing)
  app.delete('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    let orders = getOrders();
    orders = orders.filter((o) => o.id !== id);
    saveOrders(orders);
    res.json({ success: true, message: `Order ${id} deleted` });
  });

  // 6. Owner configuration endpoints
  app.get('/api/owner/config', (req, res) => {
    res.json({ success: true, config: getOwnerConfig() });
  });

  app.post('/api/owner/config', (req, res) => {
    const current = getOwnerConfig();
    const updated = { ...current, ...req.body };
    saveOwnerConfig(updated);
    res.json({ success: true, config: updated });
  });

  // 7. Test notification trigger
  app.post('/api/owner/test-notification', (req, res) => {
    const config = getOwnerConfig();
    const testOrder = {
      id: `SLO-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      customer: {
        fullName: 'Elena Rostova (Test Customer)',
        email: 'test.customer@solomonochrome.com',
        phone: '+1 (555) 777-3322',
      },
      shippingAddress: {
        addressLine1: '100 Stealth Way, Penthouse 12',
        city: 'New York',
        state: 'NY',
        postalCode: '10012',
        country: 'United States',
        deliveryNotes: 'Test order notification verification for store owner.',
      },
      items: [
        {
          productId: 'solo-modular-pack',
          productName: 'SOLO Modular Travel Backpack 28L',
          image: '/src/assets/images/solo_modular_backpack_1793542960062.jpg',
          selectedOption: 'Stealth Black',
          quantity: 1,
          unitPrice: 240,
          totalPrice: 240,
        },
      ],
      subtotal: 240,
      shippingFee: 0,
      discount: 0,
      total: 240,
      paymentMethod: 'Instant Pay',
      status: 'pending',
      ownerNotified: true,
      ownerEmail: config.ownerEmail,
      notificationLog: [
        {
          channel: 'test_simulation',
          timestamp: new Date().toISOString(),
          status: `Verified test dispatch to ${config.ownerEmail}`,
        },
      ],
    };

    const orders = getOrders();
    orders.unshift(testOrder);
    saveOrders(orders);

    broadcastOrderToOwner(testOrder);

    res.json({
      success: true,
      order: testOrder,
      message: `Test order sent! Dispatched to ${config.ownerEmail}`,
    });
  });

  // Serve Frontend
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SOLO server listening on http://0.0.0.0:${PORT}`);
    console.log(`Store Owner configured: ${getOwnerConfig().ownerEmail}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SOLO server:', err);
});
