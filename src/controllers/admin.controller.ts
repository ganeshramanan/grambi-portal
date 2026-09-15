import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';
import { notifyCustomerApproved, notifyCustomerModulesUpdated, notifyAdminModuleRequest } from '../services/email.service';

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
    const previous = await prisma.user.findUnique({
      where: { id },
      include: { subscriptions: true }
    });

    if (status) {
      await prisma.user.update({
        where: { id },
        data: { status }
      });
    }

    let newlyAdded: string[] = [];
    if (allowedProducts && Array.isArray(allowedProducts)) {
      const prevKeys = previous?.subscriptions.map(s => s.productKey) || [];
      newlyAdded = allowedProducts.filter((p: string) => !prevKeys.includes(p));

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

    // 1. If status was changed to APPROVED, notify customer of activation
    if (status === 'APPROVED' && previous?.status !== 'APPROVED' && updated) {
      notifyCustomerApproved({
        businessName: updated.businessName,
        email: updated.email,
      }).catch(err => console.error('Approval notification error:', err));
    }

    // 2. If existing approved user had product subscriptions modified, notify customer of module updates
    if (updated && updated.status === 'APPROVED' && allowedProducts && Array.isArray(allowedProducts)) {
      const activeKeys = updated.subscriptions.map(s => s.productKey);
      notifyCustomerModulesUpdated({
        businessName: updated.businessName,
        email: updated.email,
        activeProducts: activeKeys,
        newlyAdded: newlyAdded.length > 0 ? newlyAdded : undefined,
      }).catch(err => console.error('Product update notify error:', err));
    }

    return res.json({ success: true, user: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update access' });
  }
};

// Customer requesting access to a specific module from the launchpad
export const requestModuleAccess = async (req: AuthRequest, res: Response) => {
  const { productKey, productName } = req.body;
  if (!productKey) {
    return res.status(400).json({ error: 'productKey is required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    notifyAdminModuleRequest({
      businessName: user.businessName,
      email: user.email,
      productKey,
      productName: productName || productKey,
    }).catch(err => console.error('Module request notify admin error:', err));

    return res.json({
      success: true,
      message: `Your request for ${productName || productKey} has been submitted! Admin has been notified via email.`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to submit module request' });
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
