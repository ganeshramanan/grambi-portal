import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// Multi-Industry Presets Catalog
export const INDUSTRY_PRESETS = [
  {
    key: 'AUTOMOTIVE',
    name: 'Auto Workshop & Two/Four Wheeler Service',
    icon: 'ri-car-washing-line',
    referenceLabel: 'Vehicle / Reg. Number (e.g. TN 10 AB 1234)',
    defaultNotes: 'Thank you for choosing us! Next periodic oil service recommended in 3 months or 3,000 km.',
    sampleItems: [
      { name: 'Periodic Full Engine Service & Inspection', qty: 1, rate: 1499, amount: 1499 },
      { name: 'Engine Oil 10W-40 Synthetic (1L Pack)', qty: 1, rate: 450, amount: 450 },
      { name: 'Front & Rear Brake Pad Replacement', qty: 1, rate: 650, amount: 650 },
      { name: 'Air Filter & Spark Plug Cleaning / Replacement', qty: 1, rate: 250, amount: 250 },
      { name: 'Labor & 30-Point Safety Inspection', qty: 1, rate: 400, amount: 400 }
    ]
  },
  {
    key: 'SALON_SPA',
    name: 'Beauty Salon, Spa & Grooming Studio',
    icon: 'ri-scissors-2-line',
    referenceLabel: 'Appointment / Stylist Name',
    defaultNotes: 'Thank you for visiting! Schedule your next facial or hair spa in 4 weeks for glowing results.',
    sampleItems: [
      { name: 'Executive Haircut, Styling & Beard Sculpting', qty: 1, rate: 499, amount: 499 },
      { name: 'Deep Cleansing Herbal Facial & De-Tan Therapy', qty: 1, rate: 1199, amount: 1199 },
      { name: 'Argan Oil Hair Spa & Deep Conditioning Mask', qty: 1, rate: 899, amount: 899 },
      { name: 'Manicure & Luxury Pedicure Package', qty: 1, rate: 699, amount: 699 }
    ]
  },
  {
    key: 'CLINIC_HEALTH',
    name: 'Clinic, Pharmacy & Healthcare Consultation',
    icon: 'ri-heart-pulse-line',
    referenceLabel: 'Patient ID / Prescription Number',
    defaultNotes: 'Follow the prescribed dosage strictly. Next review consultation suggested in 7 days.',
    sampleItems: [
      { name: 'Doctor Consultation & General Health Checkup', qty: 1, rate: 500, amount: 500 },
      { name: 'Blood Sugar (FBS/PPBS) & BP Screening', qty: 1, rate: 250, amount: 250 },
      { name: 'Prescribed Medications (7 Days Pack)', qty: 1, rate: 680, amount: 680 },
      { name: 'Dressing & Nursing Care Charge', qty: 1, rate: 200, amount: 200 }
    ]
  },
  {
    key: 'RETAIL_STORE',
    name: 'Retail Shop, Boutique & Grocery Store',
    icon: 'ri-store-2-line',
    referenceLabel: 'Order / Counter Receipt Number',
    defaultNotes: 'Goods once sold can be exchanged within 7 days with original tag and bill.',
    sampleItems: [
      { name: 'Designer Cotton Kurti / Apparel (M)', qty: 2, rate: 799, amount: 1598 },
      { name: 'Organic Cold-Pressed Coconut Oil (1L)', qty: 1, rate: 320, amount: 320 },
      { name: 'Premium Roasted Cashews & Almonds (500g)', qty: 1, rate: 450, amount: 450 }
    ]
  },
  {
    key: 'FREELANCE_SERVICES',
    name: 'Digital Agency, IT Freelancer & Consulting',
    icon: 'ri-code-s-slash-line',
    referenceLabel: 'Project Name / Contract PO ID',
    defaultNotes: 'Payment due within 15 days of invoice date. 100% intellectual property transferred upon full settlement.',
    sampleItems: [
      { name: 'Responsive Business Website Development (Phase 1)', qty: 1, rate: 12000, amount: 12000 },
      { name: 'Monthly Social Media Marketing & Design Retainer', qty: 1, rate: 6500, amount: 6500 },
      { name: 'Custom Domain, SSL & Cloud Hosting Setup (1 Year)', qty: 1, rate: 2500, amount: 2500 }
    ]
  },
  {
    key: 'GENERAL_SERVICES',
    name: 'General Service & Custom Billing',
    icon: 'ri-file-list-3-line',
    referenceLabel: 'Job / Ref Number (Optional)',
    defaultNotes: 'Thank you for your business! We look forward to serving you again.',
    sampleItems: [
      { name: 'Professional Service & Inspection Charge', qty: 1, rate: 1000, amount: 1000 },
      { name: 'Replacement Components & Materials', qty: 1, rate: 750, amount: 750 },
      { name: 'Standard Delivery & Handling', qty: 1, rate: 150, amount: 150 }
    ]
  }
];

// 1. Get Industry Presets
export const getIndustryPresets = (req: Request, res: Response) => {
  return res.json({ presets: INDUSTRY_PRESETS });
};

// 2. Create Invoice
export const createInvoice = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const {
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    businessCategory = 'GENERAL',
    referenceNo,
    items,
    discount = 0,
    taxPercent = 0,
    status = 'PENDING',
    paymentMethod,
    upiId,
    notes,
    dueDate
  } = req.body;

  if (!customerName || !customerPhone) {
    return res.status(400).json({ error: 'Customer Name and WhatsApp Phone number are required.' });
  }

  const parsedItems = Array.isArray(items) && items.length > 0 ? items : [
    { name: 'General Service Charge', qty: 1, rate: 500, amount: 500 }
  ];

  // Calculate Subtotal & Amounts
  const subtotal = parsedItems.reduce((sum: number, item: any) => {
    const qty = parseFloat(item.qty) || 1;
    const rate = parseFloat(item.rate) || 0;
    return sum + (qty * rate);
  }, 0);

  const numDiscount = parseFloat(String(discount)) || 0;
  const taxable = Math.max(0, subtotal - numDiscount);
  const numTaxPercent = parseFloat(String(taxPercent)) || 0;
  const taxAmount = (taxable * numTaxPercent) / 100;
  const totalAmount = Math.round((taxable + taxAmount) * 100) / 100;

  try {
    // Generate Serial Invoice Number (e.g. INV-2026-0001)
    const count = await prisma.invoice.count({ where: { userId } });
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        userId: userId!,
        invoiceNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : null,
        customerAddress: customerAddress ? customerAddress.trim() : null,
        businessCategory,
        referenceNo: referenceNo ? referenceNo.trim() : null,
        itemsJson: JSON.stringify(parsedItems.map((it: any) => ({
          name: it.name || 'Item',
          qty: parseFloat(it.qty) || 1,
          rate: parseFloat(it.rate) || 0,
          amount: (parseFloat(it.qty) || 1) * (parseFloat(it.rate) || 0)
        }))),
        subtotal,
        discount: numDiscount,
        taxPercent: numTaxPercent,
        taxAmount,
        totalAmount,
        status: status || 'PENDING',
        paymentMethod: paymentMethod || (status === 'PAID' ? 'UPI' : null),
        upiId: upiId ? upiId.trim() : null,
        notes: notes || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        paidAt: status === 'PAID' ? new Date() : null
      }
    });

    return res.status(201).json({
      success: true,
      message: `Invoice #${invoiceNumber} created successfully!`,
      invoice: {
        ...invoice,
        items: JSON.parse(invoice.itemsJson || '[]')
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create invoice: ' + err.message });
  }
};

// 3. List Invoices with Aggregated Summary
export const listInvoices = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { status, search } = req.query;

  try {
    const whereClause: any = { userId };
    if (status && status !== 'ALL') {
      whereClause.status = String(status);
    }
    if (search) {
      const q = String(search).trim();
      whereClause.OR = [
        { customerName: { contains: q } },
        { customerPhone: { contains: q } },
        { invoiceNumber: { contains: q } },
        { referenceNo: { contains: q } }
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    // Summary Analytics
    const allUserInvoices = await prisma.invoice.findMany({ where: { userId } });
    const totalBilled = allUserInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalCollected = allUserInvoices.filter(i => i.status === 'PAID').reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPending = allUserInvoices.filter(i => i.status === 'PENDING').reduce((sum, inv) => sum + inv.totalAmount, 0);

    const formatted = invoices.map(inv => ({
      ...inv,
      items: JSON.parse(inv.itemsJson || '[]')
    }));

    return res.json({
      stats: {
        totalInvoices: allUserInvoices.length,
        totalBilled,
        totalCollected,
        totalPending
      },
      invoices: formatted
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch invoices: ' + err.message });
  }
};

// 4. Update Invoice Status
export const updateInvoiceStatus = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const { status, paymentMethod } = req.body;

  try {
    const existing = await prisma.invoice.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status: status || existing.status,
        paymentMethod: paymentMethod || existing.paymentMethod,
        paidAt: status === 'PAID' ? (existing.paidAt || new Date()) : null
      }
    });

    return res.json({
      success: true,
      message: `Invoice status updated to ${updated.status}`,
      invoice: {
        ...updated,
        items: JSON.parse(updated.itemsJson || '[]')
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update invoice: ' + err.message });
  }
};

// 5. Delete Single Invoice
export const deleteInvoice = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  try {
    const existing = await prisma.invoice.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    await prisma.invoice.delete({ where: { id } });
    return res.json({ success: true, message: 'Invoice deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete invoice: ' + err.message });
  }
};

// 6. Batch Delete Invoices
export const batchDeleteInvoices = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Please provide an array of invoice IDs.' });
  }

  try {
    const deleted = await prisma.invoice.deleteMany({
      where: { id: { in: ids }, userId }
    });

    return res.json({
      success: true,
      count: deleted.count,
      message: `Successfully deleted ${deleted.count} invoice(s).`
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to batch delete invoices: ' + err.message });
  }
};

// 7. Public Digital Invoice View (Directly accessible via /api/invoices/public/:id)
export const getPublicInvoice = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            businessName: true,
            phone: true,
            email: true,
            website: {
              select: { address: true, logo: true, tagline: true }
            }
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found or expired.' });
    }

    return res.json({
      invoice: {
        ...invoice,
        items: JSON.parse(invoice.itemsJson || '[]')
      },
      merchant: {
        name: invoice.user.businessName,
        phone: invoice.user.phone,
        email: invoice.user.email,
        address: invoice.user.website?.address || 'Main Business Address',
        logo: invoice.user.website?.logo || null,
        tagline: invoice.user.website?.tagline || ''
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to load digital invoice: ' + err.message });
  }
};
