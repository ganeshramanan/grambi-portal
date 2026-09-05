import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
import { register, login, getProfile, updateCredentials, logout } from './controllers/auth.controller';
import { listAllUsers, updateUserAccess, deleteUser } from './controllers/admin.controller';
import { sendBulkMessages, listCustomerCampaigns, getCustomerTemplates } from './controllers/whatsapp.controller';
import { verifyWebhook, handleWebhookEvents } from './controllers/webhook.controller';
import { authMiddleware, requireAdmin } from './middlewares/auth.middleware';
import './queues/message.worker';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// --- AUTH & PROFILE ROUTES ---
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/logout', logout);
app.get('/api/auth/me', authMiddleware, getProfile);
app.put('/api/auth/credentials', authMiddleware, updateCredentials);

// --- SUPER ADMIN MANAGEMENT ROUTES ---
app.get('/api/admin/users', authMiddleware, requireAdmin, listAllUsers);
app.put('/api/admin/users/:id/access', authMiddleware, requireAdmin, updateUserAccess);
app.delete('/api/admin/users/:id', authMiddleware, requireAdmin, deleteUser);

// --- PRODUCT 1: WHATSAPP BROADCAST ROUTES ---
app.get('/api/whatsapp/templates', authMiddleware, getCustomerTemplates);
app.post('/api/whatsapp/broadcast', authMiddleware, sendBulkMessages);
app.get('/api/whatsapp/campaigns', authMiddleware, listCustomerCampaigns);

// --- PRODUCT 2: WEBSITE BUILDER MOCK ROUTE ---
app.get('/api/website-builder/projects', authMiddleware, (req, res) => {
  res.json({
    projects: [
      { id: 'proj_1', name: 'Main Brand Portal', domain: 'portal.grambi.in', status: 'LIVE' },
      { id: 'proj_2', name: 'Campaign Landing Page', domain: 'promo.grambi.in', status: 'DRAFT' }
    ]
  });
});

// --- META WEBHOOK ROUTES ---
app.get('/webhook', verifyWebhook);
app.post('/webhook', handleWebhookEvents);

// Fallback to index.html for single-page routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Grambi Unified Platform running smoothly on http://localhost:${PORT}`);
});
