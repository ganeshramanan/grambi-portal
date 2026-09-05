import { Worker, Job } from 'bullmq';
import { redisConnection } from './message.queue';
import { WhatsAppService } from '../services/whatsapp.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const waService = new WhatsAppService();

export interface MessageJobData {
  messageRecordId: string;
  phoneNumberId: string;
  accessToken: string;
  phoneNumber: string;
  templateName: string;
  languageCode: string;
}

export const messageWorker = new Worker(
  'whatsapp-messages',
  async (job: Job<MessageJobData>) => {
    const { messageRecordId, phoneNumberId, accessToken, phoneNumber, templateName, languageCode } = job.data;

    try {
      const result = await waService.sendTemplateMessage({
        phoneNumberId,
        accessToken,
        to: phoneNumber,
        templateName,
        languageCode,
      });

      if (result.success && result.wamid) {
        await prisma.messageRecord.update({
          where: { id: messageRecordId },
          data: {
            status: 'SENT',
            wamid: result.wamid,
            sentAt: new Date(),
          },
        });
      } else {
        await prisma.messageRecord.update({
          where: { id: messageRecordId },
          data: {
            status: 'FAILED',
            errorMessage: result.error || 'Failed to send',
          },
        });
      }
    } catch (err: any) {
      await prisma.messageRecord.update({
        where: { id: messageRecordId },
        data: {
          status: 'FAILED',
          errorMessage: err.message || 'Worker processing failure',
        },
      });
      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: 10,
  }
);
