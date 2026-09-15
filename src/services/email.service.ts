import nodemailer from 'nodemailer';
import axios from 'axios';

const DEFAULT_ADMIN_EMAIL = 'tganeshramanan85@gmail.com';
const getAppUrl = () => (process.env.APP_URL || 'https://grambi.in').replace(/\/+$/, '');
const getAdminEmail = () => (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim();

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailPayload): Promise<boolean> {
  const res = await sendEmailDetailed({ to, subject, html, text });
  return res.success;
}

/**
 * Universal Email Sender:
 * 1. Checks for RESEND_API_KEY (HTTP Port 443 — 100% immune to Render port blocking)
 * 2. Falls back to Nodemailer SMTP (for local dev or SMTP providers)
 */
export async function sendEmailDetailed({ to, subject, html, text }: EmailPayload): Promise<SendEmailResult> {
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();

  // --- METHOD 1: Resend HTTP REST API (Best for Render cloud) ---
  if (resendApiKey) {
    try {
      // Use custom domain notifications@grambi.in once verified, fallback to onboarding@resend.dev
      const fromEmail = process.env.RESEND_FROM || 'Grambi <notifications@grambi.in>';
      const response = await axios.post(
        'https://api.resend.com/emails',
        {
          from: fromEmail,
          to: [to],
          subject,
          html,
          text: text || subject,
        },
        {
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log(`[RESEND HTTP SUCCESS] ID: ${response.data.id} | Sent to ${to}`);
      return { success: true, messageId: response.data.id };
    } catch (err: any) {
      // If custom domain is still propagating in DNS, fallback gracefully to sandbox sender
      if (err.response?.data?.message && err.response.data.message.includes('domain')) {
        try {
          const fallback = await axios.post(
            'https://api.resend.com/emails',
            {
              from: 'Grambi <onboarding@resend.dev>',
              to: [to],
              subject,
              html,
              text: text || subject,
            },
            {
              headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              timeout: 10000,
            }
          );
          console.log(`[RESEND FALLBACK SUCCESS] ID: ${fallback.data.id} | Sent to ${to}`);
          return { success: true, messageId: fallback.data.id };
        } catch (fallbackErr: any) {
          // continue to reporting
        }
      }
      const errMsg = err.response?.data?.message || err.message;
      console.error(`[RESEND HTTP FAILED] To: ${to}:`, errMsg);
      return { success: false, error: `Resend API Error: ${errMsg}` };
    }
  }

  // --- METHOD 2: Direct SMTP (Gmail) ---
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (!user || !pass) {
    const errMsg = 'Neither RESEND_API_KEY nor SMTP credentials configured.';
    console.warn(`[EMAIL SKIPPED] ${errMsg}`);
    return { success: false, error: errMsg };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      socketTimeout: 15000,
    });

    const info = await transporter.sendMail({
      from: `"Grambi Platform" <${user}>`,
      to,
      subject,
      html,
      text: text || subject,
    });

    console.log(`[SMTP SUCCESS] ID: ${info.messageId} | Sent to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[SMTP FAILED] Error sending to ${to}:`, error.message);
    return { 
      success: false, 
      error: `${error.message}. (Note: Render blocks raw SMTP ports 465/587. Add RESEND_API_KEY in Render to send via HTTPS)` 
    };
  }
}

/**
 * 1. Admin Notification: New customer signup awaiting approval
 */
export async function notifyAdminNewSignup(customer: {
  businessName: string;
  email: string;
  phone?: string | null;
  requestedProducts?: string[];
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'tganeshramanan85@gmail.com';
  const appUrl = (process.env.APP_URL || 'https://grambi.in').replace(/\/+$/, '');
  const subject = `[Grambi Action Required] New Customer Signup: ${customer.businessName}`;
  const productsList = customer.requestedProducts && customer.requestedProducts.length > 0
    ? customer.requestedProducts.join(', ')
    : 'Default (WhatsApp Broadcaster, Website Builder)';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="background-color: #2563eb; color: #ffffff; width: 36px; height: 36px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; text-align: center; line-height: 36px;">G</div>
        <span style="font-size: 20px; font-weight: bold; margin-left: 12px; color: #ffffff;">Grambi Admin Hub</span>
      </div>
      <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">New Customer Registration</h2>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">A new customer has signed up and is waiting for your account activation and product approval.</p>
      
      <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155;">
        <table style="width: 100%; font-size: 14px; color: #e2e8f0;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; width: 140px;"><strong>Business Name:</strong></td>
            <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">${customer.businessName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;"><strong>Email Address:</strong></td>
            <td style="padding: 6px 0;"><a href="mailto:${customer.email}" style="color: #60a5fa;">${customer.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;"><strong>Phone:</strong></td>
            <td style="padding: 6px 0; color: #ffffff;">${customer.phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;"><strong>Requested Products:</strong></td>
            <td style="padding: 6px 0; color: #38bdf8;">${productsList}</td>
          </tr>
        </table>
      </div>

      <div style="margin: 28px 0; text-align: center;">
        <a href="${appUrl}/admin.html" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
          Review & Approve in Admin Hub →
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
      <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">Grambi Cloud Ecosystem • Notification Service</p>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject,
    html,
  });
}

/**
 * 2. Customer Notification: Registration received & pending approval
 */
export async function notifyCustomerPendingSignup(customer: {
  businessName: string;
  email: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'tganeshramanan85@gmail.com';
  const subject = `Welcome to Grambi — Your Access Request is Being Reviewed`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="background-color: #2563eb; color: #ffffff; width: 36px; height: 36px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; text-align: center; line-height: 36px;">G</div>
        <span style="font-size: 20px; font-weight: bold; margin-left: 12px; color: #ffffff;">Grambi.in</span>
      </div>
      <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Hello ${customer.businessName},</h2>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
        Thank you for requesting access to <strong>Grambi</strong>! Your account has been created and is currently under review by our administration team.
      </p>
      
      <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155;">
        <p style="margin: 0; font-size: 14px; color: #cbd5e1; line-height: 1.5;">
          ⏳ <strong>Status: Pending Approval</strong><br/>
          Once our administrator verifies and activates your requested product modules, you will receive another email confirmation to sign in immediately.
        </p>
      </div>

      <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
        If you have any questions or require urgent activation, feel free to reach out directly to support at <a href="mailto:${adminEmail}" style="color: #60a5fa;">${adminEmail}</a>.
      </p>

      <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
      <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">© 2026 Grambi.in • All rights reserved.</p>
    </div>
  `;

  return sendEmail({
    to: customer.email,
    subject,
    html,
  });
}

/**
 * 3. Customer Notification: Account Approved & Ready to Use
 */
export async function notifyCustomerApproved(customer: {
  businessName: string;
  email: string;
}) {
  const appUrl = (process.env.APP_URL || 'https://grambi.in').replace(/\/+$/, '');
  const subject = `🎉 Your Grambi Account Has Been Approved!`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="background-color: #10b981; color: #ffffff; width: 36px; height: 36px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; text-align: center; line-height: 36px;">✓</div>
        <span style="font-size: 20px; font-weight: bold; margin-left: 12px; color: #ffffff;">Grambi.in</span>
      </div>
      <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Great news, ${customer.businessName}!</h2>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
        Your Grambi portal account has been approved and activated by the administrator. You now have full access to your authorized business modules.
      </p>
      
      <div style="background-color: #064e3b; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #059669;">
        <p style="margin: 0; font-size: 14px; color: #a7f3d0; line-height: 1.5;">
          🚀 <strong>Your account is now active.</strong><br/>
          You can sign in with your email (<strong>${customer.email}</strong>) and password right away.
        </p>
      </div>

      <div style="margin: 28px 0; text-align: center;">
        <a href="${appUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
          Sign In to Your Launchpad →
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
      <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">© 2026 Grambi.in • All rights reserved.</p>
    </div>
  `;

  return sendEmail({
    to: customer.email,
    subject,
    html,
  });
}

/**
 * 4. Password Reset Notification
 */
export async function sendPasswordResetEmail(customer: {
  businessName?: string;
  email: string;
  resetToken: string;
}) {
  const appUrl = (process.env.APP_URL || 'https://grambi.in').replace(/\/+$/, '');
  const subject = `Reset Your Grambi Account Password`;
  const resetLink = `${appUrl}/reset-password.html?token=${encodeURIComponent(customer.resetToken)}&email=${encodeURIComponent(customer.email)}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="background-color: #2563eb; color: #ffffff; width: 36px; height: 36px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; text-align: center; line-height: 36px;">G</div>
        <span style="font-size: 20px; font-weight: bold; margin-left: 12px; color: #ffffff;">Grambi.in</span>
      </div>
      <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Password Reset Request</h2>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
        We received a request to reset the password for your account (<strong>${customer.email}</strong>). Click the button below to set a new password:
      </p>

      <div style="margin: 28px 0; text-align: center;">
        <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
          Reset My Password →
        </a>
      </div>

      <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
        This password reset link will expire in <strong>30 minutes</strong>. If you did not request a password reset, you can safely ignore this email — your account remains secure.
      </p>

      <div style="background-color: #1e293b; padding: 12px; border-radius: 6px; margin-top: 20px; word-break: break-all; font-size: 11px; color: #64748b;">
        If the button above does not work, copy and paste this URL into your browser:<br/>
        <a href="${resetLink}" style="color: #60a5fa;">${resetLink}</a>
      </div>

      <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
      <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">© 2026 Grambi.in • All rights reserved.</p>
    </div>
  `;

  return sendEmail({
    to: customer.email,
    subject,
    html,
  });
}

/**
 * 5. Customer requested access to a new module
 */
export async function notifyAdminModuleRequest(customer: {
  businessName: string;
  email: string;
  productKey: string;
  productName: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'tganeshramanan85@gmail.com';
  const appUrl = (process.env.APP_URL || 'https://grambi.in').replace(/\/+$/, '');
  const subject = `[Grambi Action Required] Module Access Request: ${customer.productName} by ${customer.businessName}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="background-color: #2563eb; color: #ffffff; width: 36px; height: 36px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; text-align: center; line-height: 36px;">G</div>
        <span style="font-size: 20px; font-weight: bold; margin-left: 12px; color: #ffffff;">Grambi Admin Hub</span>
      </div>
      <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">New Module Access Request</h2>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">An existing customer has requested access to an additional module:</p>
      
      <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155;">
        <table style="width: 100%; font-size: 14px; color: #e2e8f0;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; width: 140px;"><strong>Customer:</strong></td>
            <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">${customer.businessName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;"><strong>Email:</strong></td>
            <td style="padding: 6px 0;"><a href="mailto:${customer.email}" style="color: #60a5fa;">${customer.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;"><strong>Requested Module:</strong></td>
            <td style="padding: 6px 0; color: #38bdf8; font-weight: 600;">${customer.productName} (${customer.productKey})</td>
          </tr>
        </table>
      </div>

      <div style="margin: 28px 0; text-align: center;">
        <a href="${appUrl}/admin.html" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
          Grant Access in Admin Hub →
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
      <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">Grambi Cloud Ecosystem • Notification Service</p>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject,
    html,
  });
}

/**
 * 6. Admin granted/updated module access for customer
 */
export async function notifyCustomerModulesUpdated(customer: {
  businessName: string;
  email: string;
  activeProducts: string[];
  newlyAdded?: string[];
}) {
  const appUrl = (process.env.APP_URL || 'https://grambi.in').replace(/\/+$/, '');
  const subject = `✨ Your Grambi Product Access Has Been Updated!`;
  const addedText = customer.newlyAdded && customer.newlyAdded.length > 0
    ? `<div style="background-color: #064e3b; padding: 14px; border-radius: 8px; margin: 16px 0; border: 1px solid #059669; color: #a7f3d0; font-size: 14px; margin-bottom: 20px;">
        <strong>Newly Unlocked:</strong> ${customer.newlyAdded.join(', ')}
       </div>`
    : '';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="background-color: #10b981; color: #ffffff; width: 36px; height: 36px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; text-align: center; line-height: 36px;">✓</div>
        <span style="font-size: 20px; font-weight: bold; margin-left: 12px; color: #ffffff;">Grambi.in</span>
      </div>
      <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Hello ${customer.businessName},</h2>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
        Your product module permissions have been updated by the administrator.
      </p>

      ${addedText}

      <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155;">
        <strong style="color: #cbd5e1; font-size: 13px;">Currently Active Modules on Your Account:</strong>
        <p style="margin: 8px 0 0; color: #38bdf8; font-size: 14px; font-weight: 500;">
          ${customer.activeProducts.join(', ')}
        </p>
      </div>

      <div style="margin: 28px 0; text-align: center;">
        <a href="${appUrl}/portal.html" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
          Open Grambi Launchpad →
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
      <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">© 2026 Grambi.in • All rights reserved.</p>
    </div>
  `;

  return sendEmail({
    to: customer.email,
    subject,
    html,
  });
}
