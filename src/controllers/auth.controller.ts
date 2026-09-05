import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'grambi_unified_secret_key_2026';

const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  businessName: z.string().min(1, 'Business name is required'),
  phone: z.string().optional(),
  phoneNumberId: z.string().optional(),
  wabaId: z.string().optional(),
  accessToken: z.string().optional(),
  requestedProducts: z.array(z.string()).optional()
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req: Request, res: Response) => {
  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.format() });
  }

  const { email, password, businessName, phone, phoneNumberId, wabaId, accessToken, requestedProducts } = result.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userCount = await prisma.user.count();
  
  // First user is super admin & approved; others start as customer
  const role = userCount === 0 ? 'ADMIN' : 'CUSTOMER';
  const status = role === 'ADMIN' ? 'APPROVED' : 'PENDING';

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
      businessName,
      phone: phone || null,
      role,
      status,
      phoneNumberId: phoneNumberId || null,
      wabaId: wabaId || null,
      accessToken: accessToken || null,
      subscriptions: {
        create: (requestedProducts || ['WHATSAPP_BROADCAST']).map(p => ({
          productKey: p,
          status: 'ACTIVE'
        }))
      }
    },
    include: {
      subscriptions: true
    }
  });

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
  res.cookie('grambi_token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });

  return res.status(201).json({
    message: role === 'ADMIN' ? 'Admin account created!' : 'Registration submitted! Please wait for admin approval.',
    token,
    user: {
      id: user.id,
      email: user.email,
      businessName: user.businessName,
      role: user.role,
      status: user.status,
      subscriptions: user.subscriptions.map(s => s.productKey)
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid email or password format.' });
  }

  const { email, password } = result.data;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { subscriptions: true }
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.status === 'PENDING') {
    return res.status(403).json({ error: 'Your account is pending admin approval. You will receive access shortly.' });
  }

  if (user.status === 'REJECTED') {
    return res.status(403).json({ error: 'Your account access request was rejected. Contact support.' });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
  res.cookie('grambi_token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });

  return res.json({
    message: 'Login successful!',
    token,
    user: {
      id: user.id,
      email: user.email,
      businessName: user.businessName,
      role: user.role,
      status: user.status,
      phoneNumberId: user.phoneNumberId,
      wabaId: user.wabaId,
      subscriptions: user.subscriptions.map(s => s.productKey)
    },
  });
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { subscriptions: true }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.json({
    id: user.id,
    email: user.email,
    businessName: user.businessName,
    phone: user.phone,
    role: user.role,
    status: user.status,
    phoneNumberId: user.phoneNumberId,
    wabaId: user.wabaId,
    hasMetaCredentials: Boolean(user.phoneNumberId && user.accessToken),
    subscriptions: user.subscriptions.map(s => s.productKey)
  });
};

export const updateCredentials = async (req: AuthRequest, res: Response) => {
  const { phoneNumberId, accessToken, wabaId, businessName } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        phoneNumberId: phoneNumberId ? String(phoneNumberId).trim() : undefined,
        accessToken: accessToken ? String(accessToken).trim() : undefined,
        wabaId: wabaId ? String(wabaId).trim() : undefined,
        businessName: businessName ? String(businessName).trim() : undefined
      }
    });

    return res.json({
      success: true,
      message: 'Credentials updated successfully!',
      user: {
        phoneNumberId: user.phoneNumberId,
        wabaId: user.wabaId,
        businessName: user.businessName
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update credentials.' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('grambi_token');
  res.json({ success: true, message: 'Logged out successfully.' });
};
