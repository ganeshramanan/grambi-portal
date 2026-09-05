const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'grambi_default_jwt_secret_key';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Simple file-based mock DB for easy zero-setup testing
const DB_FILE = path.join(__dirname, 'data.json');

function loadData() {
  const initialProducts = [
    {
      id: 'prod_whatsapp',
      key: 'whatsapp_automator',
      name: 'WhatsApp Automator & Bulk Messenger',
      description: 'Automated messaging, broadcast campaigns, WhatsApp flow automation.',
      icon: 'ri-whatsapp-line',
      badgeColor: 'emerald',
      renderUrl: process.env.WHATSAPP_APP_URL || 'https://grambi-whatsapp-mock.onrender.com'
    },
    {
      id: 'prod_website',
      key: 'website_builder',
      name: 'Website & Customer Portal',
      description: 'High-converting custom web apps, customer management, and client portal.',
      icon: 'ri-global-line',
      badgeColor: 'blue',
      renderUrl: process.env.WEBSITE_BUILDER_APP_URL || 'https://grambi-website-mock.onrender.com'
    }
  ];

  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      products: initialProducts,
      users: [
        {
          id: 'usr_admin',
          name: 'Super Admin',
          email: 'admin@grambi.in',
          phone: '+91 9876543210',
          passwordHash: bcrypt.hashSync('admin123', 10),
          role: 'admin',
          status: 'approved',
          allowedProducts: ['whatsapp_automator', 'website_builder'],
          productConfigs: {},
          createdAt: new Date().toISOString()
        },
        {
          id: 'usr_sample',
          name: 'John Doe',
          email: 'client@example.com',
          phone: '+91 9999988888',
          passwordHash: bcrypt.hashSync('client123', 10),
          role: 'customer',
          status: 'approved',
          allowedProducts: ['whatsapp_automator'], // Only WhatsApp allowed
          productConfigs: {},
          createdAt: new Date().toISOString()
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }

  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  
  // Dynamic sync: Always update product renderUrl from .env if defined
  let modified = false;
  if (data.products) {
    const wa = data.products.find(p => p.key === 'whatsapp_automator');
    if (wa && process.env.WHATSAPP_APP_URL && wa.renderUrl !== process.env.WHATSAPP_APP_URL) {
      wa.renderUrl = process.env.WHATSAPP_APP_URL;
      modified = true;
    }
    const wb = data.products.find(p => p.key === 'website_builder');
    if (wb && process.env.WEBSITE_BUILDER_APP_URL && wb.renderUrl !== process.env.WEBSITE_BUILDER_APP_URL) {
      wb.renderUrl = process.env.WEBSITE_BUILDER_APP_URL;
      modified = true;
    }
  }

  // Ensure productConfigs container exists for all users
  data.users.forEach(u => {
    if (!u.productConfigs) {
      u.productConfigs = {};
      modified = true;
    }
  });
  if (modified) saveData(data);
  return data;
}

function saveData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Auth Middleware
function authenticate(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
}

// --- API ROUTES ---

// 1. Get List of Products (Dynamic Catalog)
app.get('/api/products', (req, res) => {
  const data = loadData();
  res.json({ products: data.products });
});

// 2. Register New User
app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, password, requestedProducts } = req.body;
  const data = loadData();

  if (data.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    name,
    email: email.toLowerCase(),
    phone: phone || '',
    passwordHash: await bcrypt.hash(password, 10),
    role: 'customer',
    status: 'pending', // Requires admin approval
    allowedProducts: [],
    requestedProducts: requestedProducts || ['whatsapp_automator'],
    createdAt: new Date().toISOString()
  };

  data.users.push(newUser);
  saveData(data);

  // Here you can trigger an Email or WhatsApp notification to Admin
  console.log(`[ALERT] New registration request from: ${name} (${email}) for products: ${requestedProducts}`);

  res.json({ success: true, message: 'Registration submitted. Please wait for admin approval.' });
});

// 3. Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const data = loadData();
  const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.status === 'pending') {
    return res.status(403).json({ error: 'Your account is pending admin approval. You will receive access shortly.' });
  }

  if (user.status === 'rejected') {
    return res.status(403).json({ error: 'Your access request was rejected. Contact admin.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({
    success: true,
    token: token, // Also returned in JSON for Authorization header backup
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      allowedProducts: user.allowedProducts
    }
  });
});

// 4. Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// 5. Current Session Details
app.get('/api/auth/me', authenticate, (req, res) => {
  const data = loadData();
  const user = data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      allowedProducts: user.allowedProducts
    },
    products: data.products
  });
});

// 6. Launch Product Route (Secure Redirect with SSO Token + Injected Credentials)
app.get('/api/products/launch/:productKey', authenticate, (req, res) => {
  const { productKey } = req.params;
  const data = loadData();
  const user = data.users.find(u => u.id === req.user.id);

  if (!user) return res.status(404).json({ error: 'User not found' });

  // Check if user has permission
  const hasAccess = user.role === 'admin' || (user.allowedProducts && user.allowedProducts.includes(productKey));
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied. You do not have permission for this product.' });
  }

  const product = data.products.find(p => p.key === productKey);
  if (!product) {
    return res.status(404).json({ error: 'Product not configured' });
  }

  // Get user's product-specific configuration/credentials (e.g. phoneId, token, etc.)
  const userConfig = (user.productConfigs && user.productConfigs[productKey]) || {};

  // Generate an SSO Token containing customer info + their product credentials
  const ssoToken = jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      name: user.name, 
      product: productKey,
      config: userConfig 
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  // If target app does not yet have an SSO handler endpoint, launch clean URL or append ?sso_token=
  const separator = product.renderUrl.includes('?') ? '&' : '?';
  const targetUrl = `${product.renderUrl}${separator}sso_token=${ssoToken}`;
  res.json({ success: true, launchUrl: targetUrl, directUrl: product.renderUrl, hasConfig: Object.keys(userConfig).length > 0 });
});

// 6b. Get / Save Product-Specific Configuration for current user
app.get('/api/user/config/:productKey', authenticate, (req, res) => {
  const { productKey } = req.params;
  const data = loadData();
  const user = data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const config = (user.productConfigs && user.productConfigs[productKey]) || {};
  res.json({ config });
});

app.post('/api/user/config/:productKey', authenticate, (req, res) => {
  const { productKey } = req.params;
  const { config } = req.body;
  const data = loadData();
  const userIndex = data.users.findIndex(u => u.id === req.user.id);
  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

  if (!data.users[userIndex].productConfigs) {
    data.users[userIndex].productConfigs = {};
  }
  data.users[userIndex].productConfigs[productKey] = config;
  saveData(data);

  res.json({ success: true, message: 'Settings saved successfully' });
});

// --- ADMIN ROUTES ---

// 7. Get All Users (Admin only)
app.get('/api/admin/users', authenticate, requireAdmin, (req, res) => {
  const data = loadData();
  const sanitized = data.users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status,
    allowedProducts: u.allowedProducts || [],
    requestedProducts: u.requestedProducts || [],
    createdAt: u.createdAt
  }));
  res.json({ users: sanitized, products: data.products });
});

// 8. Update User Access & Status (Admin only)
app.post('/api/admin/users/:userId/access', authenticate, requireAdmin, (req, res) => {
  const { userId } = req.params;
  const { status, allowedProducts } = req.body;
  const data = loadData();

  const userIndex = data.users.findIndex(u => u.id === userId);
  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

  if (status) data.users[userIndex].status = status;
  if (allowedProducts) data.users[userIndex].allowedProducts = allowedProducts;

  saveData(data);
  res.json({ success: true, user: data.users[userIndex] });
});

// 9. Add a New Product to Catalog (Future Proofing for Product 3, 4, etc.)
app.post('/api/admin/products', authenticate, requireAdmin, (req, res) => {
  const { key, name, description, icon, renderUrl, badgeColor } = req.body;
  const data = loadData();

  if (data.products.find(p => p.key === key)) {
    return res.status(400).json({ error: 'Product key already exists' });
  }

  const newProduct = {
    id: 'prod_' + Date.now(),
    key,
    name,
    description,
    icon: icon || 'ri-apps-2-line',
    badgeColor: badgeColor || 'indigo',
    renderUrl
  };

  data.products.push(newProduct);
  saveData(data);
  res.json({ success: true, product: newProduct });
});

// 10. Delete a Product from Catalog (Admin only)
app.delete('/api/admin/products/:key', authenticate, requireAdmin, (req, res) => {
  const { key } = req.params;
  const data = loadData();

  const prodIndex = data.products.findIndex(p => p.key === key);
  if (prodIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Remove the product from catalog
  data.products.splice(prodIndex, 1);

  // Also remove this product from all users' allowedProducts list
  data.users.forEach(u => {
    if (u.allowedProducts) {
      u.allowedProducts = u.allowedProducts.filter(pKey => pKey !== key);
    }
  });

  saveData(data);
  res.json({ success: true, message: `Product ${key} deleted successfully` });
});

// 11. Delete a User / Customer (Admin only)
app.delete('/api/admin/users/:userId', authenticate, requireAdmin, (req, res) => {
  const { userId } = req.params;
  const data = loadData();

  // Prevent admin from deleting themselves
  if (req.user.id === userId) {
    return res.status(400).json({ error: 'Cannot delete your own active admin account.' });
  }

  const userIndex = data.users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const deletedUser = data.users.splice(userIndex, 1)[0];
  saveData(data);

  res.json({ success: true, message: `Customer ${deletedUser.name} (${deletedUser.email}) removed successfully` });
});

app.listen(PORT, () => {
  console.log(`🚀 Grambi Portal Server running on http://localhost:${PORT}`);
});
