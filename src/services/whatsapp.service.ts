import axios from 'axios';

export interface SendTemplatePayload {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  templateName: string;
  languageCode?: string;
}

export class WhatsAppService {
  private baseUrl = 'https://graph.facebook.com/v21.0';

  async sendTemplateMessage(payload: SendTemplatePayload): Promise<{ success: boolean; wamid?: string; error?: string }> {
    const { phoneNumberId, accessToken, to, templateName, languageCode = 'en_US' } = payload;
    const url = `${this.baseUrl}/${phoneNumberId}/messages`;

    // Normalize phone number (digits only)
    const cleanTo = to.replace(/\D/g, '');

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
      },
    };

    try {
      const res = await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const wamid = res.data?.messages?.[0]?.id;
      return { success: true, wamid };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.message || 'WhatsApp Cloud API Error';
      return { success: false, error: errorMsg };
    }
  }

  async getTemplates(wabaId: string, accessToken: string) {
    const url = `${this.baseUrl}/${wabaId}/message_templates`;
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { limit: 100 }
      });
      return res.data?.data || [];
    } catch (err: any) {
      return [];
    }
  }
}
