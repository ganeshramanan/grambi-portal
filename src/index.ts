import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
import { register, login, getProfile, updateCredentials, logout } from './controllers/auth.controller';
import { listAllUsers, updateUserAccess, deleteUser } from './controllers/admin.controller';
import { sendBulkMessages, listCustomerCampaigns, getCustomerTemplates } from './controllers/whatsapp.controller';
import { getMyWebsite, updateMyWebsite, getPublicWebsite, submitPublicBooking } from './controllers/website.controller';
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

// --- PRODUCT 2: WEBSITE CUSTOMIZER ROUTES ---
app.get('/api/website/my-website', authMiddleware, getMyWebsite);
app.put('/api/website/my-website', authMiddleware, updateMyWebsite);
app.get('/api/website/public/:slug', getPublicWebsite);
app.post('/api/website/public/:slug/book', submitPublicBooking);

// Direct Public Website View: /site/:slug
app.get('/site/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/site.html'));
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
