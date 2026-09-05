import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'grambi_webhook_verify_2026';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
};

export const handleWebhookEvents = async (req: Request, res: Response) => {
  const body = req.body;

  if (body.object === 'whatsapp_business_account') {
    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value;
        const statuses = value?.statuses || [];

        for (const statusObj of statuses) {
          const wamid = statusObj.id;
          const status = statusObj.status; // sent, delivered, read, failed
          const timestamp = statusObj.timestamp ? new Date(parseInt(statusObj.timestamp) * 1000) : new Date();

          const updateData: any = {};
          if (status === 'delivered') updateData.deliveredAt = timestamp;
          if (status === 'read') updateData.readAt = timestamp;
          if (status === 'sent') updateData.sentAt = timestamp;
          if (status === 'failed') {
            updateData.errorMessage = statusObj.errors?.[0]?.message || 'Delivery failed';
          }
          updateData.status = status.toUpperCase();

          try {
            await prisma.messageRecord.updateMany({
              where: { wamid },
              data: updateData,
            });
          } catch (e) {}
        }
      }
    }
  }

  return res.sendStatus(200);
};
