import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// List all registered customers for Super Admin
export const listAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        businessName: true,
        phone: true,
        role: true,
        status: true,
        phoneNumberId: true,
        wabaId: true,
        createdAt: true,
        subscriptions: {
          select: { productKey: true, status: true }
        },
        _count: {
          select: { campaigns: true }
        }
      }
    });

    return res.json({ users });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Update Customer Status (Approve / Reject) & Product Permissions
export const updateUserAccess = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, allowedProducts } = req.body;

  try {
    if (status) {
      await prisma.user.update({
        where: { id },
        data: { status }
      });
    }

    if (allowedProducts && Array.isArray(allowedProducts)) {
      // Re-sync product subscriptions
      await prisma.productSubscription.deleteMany({ where: { userId: id } });
      await prisma.productSubscription.createMany({
        data: allowedProducts.map((p: string) => ({
          userId: id,
          productKey: p,
          status: 'ACTIVE'
        }))
      });
    }

    const updated = await prisma.user.findUnique({
      where: { id },
      include: { subscriptions: true }
    });

    return res.json({ success: true, user: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update access' });
  }
};

// Delete a customer
export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (id === req.userId) {
    return res.status(400).json({ error: 'You cannot delete your own admin account.' });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return res.json({ success: true, message: 'Customer account deleted.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete customer' });
  }
};
