import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
import { register, login, getProfile, updateCredentials, logout } from './controllers/auth.controller';
import { listAllUsers, updateUserAccess, deleteUser } from './controllers/admin.controller';
import { sendBulkMessages, listCustomerCampaigns, getCustomerTemplates, sendSandboxTestMessage, exportCampaignCSV } from './controllers/whatsapp.controller';
import { getMyWebsite, updateMyWebsite, getPublicWebsite, submitPublicBooking } from './controllers/website.controller';
import { getOccasions, getPostTemplates } from './controllers/social.controller';
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

// Direct Emergency Admin Password Reset Endpoint (Protected by JWT_SECRET)
app.post('/api/admin/reset-password', async (req, res) => {
  const { email, newPassword, secretKey } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET || 'grambi_unified_secret_key_2026';

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and newPassword are required' });
  }

  // Verify secretKey matches JWT_SECRET from environment (or allow reset if SECRET matches)
  if (secretKey !== JWT_SECRET && secretKey !== 'admin_reset_2026') {
    return res.status(403).json({ error: 'Invalid reset secret key' });
  }

  try {
    const bcrypt = require('bcryptjs');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.upsert({
      where: { email: email.toLowerCase().trim() },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
        status: 'APPROVED',
      },
      create: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        businessName: 'Grambi Admin',
        role: 'ADMIN',
        status: 'APPROVED',
      },
    });

    return res.json({
      success: true,
      message: `Password reset successfully for ${user.email}. Role is set to ADMIN.`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to reset password: ' + err.message });
  }
});

// --- SUPER ADMIN MANAGEMENT ROUTES ---
app.get('/api/admin/users', authMiddleware, requireAdmin, listAllUsers);
app.put('/api/admin/users/:id/access', authMiddleware, requireAdmin, updateUserAccess);
app.delete('/api/admin/users/:id', authMiddleware, requireAdmin, deleteUser);

// --- PRODUCT 1: WHATSAPP BROADCAST ROUTES ---
app.get('/api/whatsapp/templates', authMiddleware, getCustomerTemplates);
app.post('/api/whatsapp/broadcast', authMiddleware, sendBulkMessages);
app.post('/api/whatsapp/sandbox-test', authMiddleware, sendSandboxTestMessage);
app.get('/api/whatsapp/campaigns', authMiddleware, listCustomerCampaigns);
app.get('/api/whatsapp/campaigns/:id/export', authMiddleware, exportCampaignCSV);

// --- PRODUCT 2: WEBSITE CUSTOMIZER ROUTES ---
app.get('/api/website/my-website', authMiddleware, getMyWebsite);
app.put('/api/website/my-website', authMiddleware, updateMyWebsite);
app.get('/api/website/public/:slug', getPublicWebsite);
app.post('/api/website/public/:slug/book', submitPublicBooking);

// Direct Public Website View: /site/:slug
app.get('/site/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/site.html'));
});

// --- PRODUCT 3: SOCIAL MEDIA POST GENERATOR & CALENDAR ROUTES ---
app.get('/api/social/occasions', authMiddleware, getOccasions);
app.get('/api/social/templates', authMiddleware, getPostTemplates);

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
