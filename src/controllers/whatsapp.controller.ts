import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';
import { messageQueue } from '../queues/message.queue';
import { WhatsAppService } from '../services/whatsapp.service';

const prisma = new PrismaClient();
const waService = new WhatsAppService();

// Trigger Bulk Campaign Broadcast
export const sendBulkMessages = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { campaignName, templateName, languageCode, recipients } = req.body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: 'Please provide at least one recipient.' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.phoneNumberId || !user.accessToken) {
    return res.status(400).json({
      error: 'WhatsApp Meta Credentials not configured. Please add your Phone ID and Access Token in Settings.',
    });
  }

  try {
    const campaign = await prisma.campaign.create({
      data: {
        userId: user.id,
        name: campaignName || `Broadcast_${new Date().toISOString().slice(0, 10)}`,
        templateName: templateName || 'general_broadcast',
        languageCode: languageCode || 'en_US',
        messages: {
          create: recipients.map((r: any) => ({
            phoneNumber: typeof r === 'string' ? r.trim() : String(r.phoneNumber || r.phone).trim(),
            status: 'PENDING',
          })),
        },
      },
      include: {
        messages: true,
      },
    });

    // Enqueue jobs into BullMQ
    for (const msg of campaign.messages) {
      try {
        await messageQueue.add('send-whatsapp', {
          messageRecordId: msg.id,
          phoneNumberId: user.phoneNumberId,
          accessToken: user.accessToken,
          phoneNumber: msg.phoneNumber,
          templateName: campaign.templateName,
          languageCode: campaign.languageCode,
        });
      } catch (queueErr) {
        // Fallback if Redis is offline: Send synchronously
        waService.sendTemplateMessage({
          phoneNumberId: user.phoneNumberId,
          accessToken: user.accessToken,
          to: msg.phoneNumber,
          templateName: campaign.templateName,
          languageCode: campaign.languageCode,
        }).then(async (result) => {
          await prisma.messageRecord.update({
            where: { id: msg.id },
            data: {
              status: result.success ? 'SENT' : 'FAILED',
              wamid: result.wamid || null,
              errorMessage: result.error || null,
              sentAt: result.success ? new Date() : null,
            },
          });
        }).catch(() => {});
      }
    }

    return res.status(202).json({
      success: true,
      message: `Campaign initiated! ${campaign.messages.length} messages scheduled.`,
      campaignId: campaign.id,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create broadcast campaign: ' + err.message });
  }
};

// List Campaigns for the Customer
export const listCustomerCampaigns = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  try {
    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          select: {
            id: true,
            phoneNumber: true,
            status: true,
            errorMessage: true,
            sentAt: true,
            deliveredAt: true,
            readAt: true,
          },
        },
      },
    });

    const sanitized = campaigns.map((c) => {
      const total = c.messages.length;
      const sent = c.messages.filter((m) => m.status === 'SENT').length;
      const delivered = c.messages.filter((m) => m.status === 'DELIVERED').length;
      const read = c.messages.filter((m) => m.status === 'READ').length;
      const failed = c.messages.filter((m) => m.status === 'FAILED').length;
      const pending = c.messages.filter((m) => m.status === 'PENDING').length;

      return {
        id: c.id,
        name: c.name,
        templateName: c.templateName,
        languageCode: c.languageCode,
        createdAt: c.createdAt,
        stats: { total, sent, delivered, read, failed, pending },
        messages: c.messages,
      };
    });

    return res.json({ campaigns: sanitized });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch campaigns.' });
  }
};

// Fetch Dynamic Meta Templates
export const getCustomerTemplates = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !user.wabaId || !user.accessToken) {
    return res.json({ templates: [] });
  }

  const templates = await waService.getTemplates(user.wabaId, user.accessToken);
  return res.json({ templates });
};
