import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_SECURE = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'tganeshramanan85@gmail.com';
const APP_URL = (process.env.APP_URL || 'https://grambi.in').replace(/\/+$/, '');

// Create transporter if SMTP credentials are provided
const transporter = (SMTP_USER && SMTP_PASS)
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailPayload): Promise<boolean> {
  const fromAddress = SMTP_USER ? `"Grambi Platform" <${SMTP_USER}>` : '"Grambi Platform" <no-reply@grambi.in>';

  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`[EMAIL NOTICE - SMTP NOT CONFIGURED]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`(Configure SMTP_USER and SMTP_PASS in environment variables to send live emails via Gmail)`);
    console.log(`======================================================\n`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
      text: text || subject,
    });
    console.log(`[EMAIL SUCCESS] Sent "${subject}" to ${to}`);
    return true;
  } catch (error: any) {
    console.error(`[EMAIL ERROR] Failed to send to ${to}:`, error.message);
    return false;
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
        <a href="${APP_URL}/admin.html" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
          Review & Approve in Admin Hub →
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
      <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">Grambi Cloud Ecosystem • Notification Service</p>
    </div>
  `;

  return sendEmail({
    to: ADMIN_EMAIL,
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
        If you have any questions or require urgent activation, feel free to reach out directly to support at <a href="mailto:${ADMIN_EMAIL}" style="color: #60a5fa;">${ADMIN_EMAIL}</a>.
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
        <a href="${APP_URL}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
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
  const subject = `Reset Your Grambi Account Password`;
  const resetLink = `${APP_URL}/reset-password.html?token=${encodeURIComponent(customer.resetToken)}&email=${encodeURIComponent(customer.email)}`;

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
        <a href="${APP_URL}/admin.html" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
          Grant Access in Admin Hub →
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
      <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">Grambi Cloud Ecosystem • Notification Service</p>
    </div>
  `;

  return sendEmail({
    to: ADMIN_EMAIL,
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
        <a href="${APP_URL}/portal.html" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
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
