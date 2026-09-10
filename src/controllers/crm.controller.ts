import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// Multi-Industry Recurring Reminder Presets
export const CRM_PRESETS = [
  {
    key: 'AUTOMOTIVE',
    name: 'Auto Workshop / Two & Four Wheeler',
    icon: 'ri-car-washing-line',
    referenceLabel: 'Vehicle Registration No.',
    reminders: [
      { type: 'SERVICE_DUE', title: 'Periodic Engine Oil & Full Service Due', defaultDays: 90 },
      { type: 'INSURANCE_DUE', title: 'Vehicle Insurance Renewal Due', defaultDays: 365 },
      { type: 'PUC_DUE', title: 'Pollution (PUC) Certificate Renewal', defaultDays: 180 },
      { type: 'BRAKE_CHECK', title: 'Brake Fluid & Pad Safety Inspection', defaultDays: 180 }
    ],
    defaultMessageTemplate: 'Hi {name}, friendly reminder from {business}! Your vehicle {ref} is due for {reminder}. Regular maintenance ensures peak mileage and reliability. Reply "BOOK" to reserve your priority slot today.'
  },
  {
    key: 'SALON_SPA',
    name: 'Beauty Salon, Spa & Wellness Studio',
    icon: 'ri-scissors-2-line',
    referenceLabel: 'Member / Client ID',
    reminders: [
      { type: 'HAIRCUT_GROOMING', title: 'Haircut & Styling Cycle', defaultDays: 30 },
      { type: 'FACIAL_SKINCARE', title: 'De-Tan Facial & Skin Glow Therapy', defaultDays: 45 },
      { type: 'HAIR_SPA', title: 'Deep Conditioning Hair Spa & Keratin Care', defaultDays: 60 }
    ],
    defaultMessageTemplate: 'Hi {name}! It has been a month since your last visit to {business}. Time for your {reminder} to keep looking and feeling your best! Reply to book your appointment.'
  },
  {
    key: 'CLINIC_HEALTH',
    name: 'Clinic, Dental & Healthcare',
    icon: 'ri-heart-pulse-line',
    referenceLabel: 'Patient ID / Prescription No.',
    reminders: [
      { type: 'FOLLOWUP_CONSULT', title: 'Post-Treatment Review Consultation', defaultDays: 7 },
      { type: 'DENTAL_CHECKUP', title: 'Routine Dental Scaling & Oral Health Checkup', defaultDays: 180 },
      { type: 'MEDICINE_REFILL', title: 'Monthly Prescription & Medicine Refill', defaultDays: 30 }
    ],
    defaultMessageTemplate: 'Hello {name}, this is a health follow-up reminder from {business}. Your scheduled {reminder} is coming up. Please reply or call to confirm your consultation time.'
  },
  {
    key: 'GYM_FITNESS',
    name: 'Gym, Yoga & Fitness Center',
    icon: 'ri-run-line',
    referenceLabel: 'Member ID / Card No.',
    reminders: [
      { type: 'MEMBERSHIP_DUE', title: 'Monthly Gym / Fitness Membership Renewal', defaultDays: 30 },
      { type: 'QUARTERLY_RENEWAL', title: 'Quarterly Fitness Package Renewal', defaultDays: 90 },
      { type: 'PERSONAL_TRAINING', title: 'Personal Training Session Pack Renewal', defaultDays: 30 }
    ],
    defaultMessageTemplate: 'Hi {name}! Your fitness package at {business} ({reminder}) is due for renewal on {dueDate}. Continue your streak without interruption! Pay online via UPI or visit the front desk.'
  },
  {
    key: 'GENERAL_SERVICES',
    name: 'General Service & Annual Contracts',
    icon: 'ri-calendar-check-line',
    referenceLabel: 'Account / Contract Reference',
    reminders: [
      { type: 'CONTRACT_RENEWAL', title: 'Annual Maintenance Contract (AMC) Renewal', defaultDays: 365 },
      { type: 'QUARTERLY_SERVICE', title: 'Quarterly Preventative Maintenance Check', defaultDays: 90 },
      { type: 'FOLLOWUP', title: 'General Customer Follow-up & Feedback', defaultDays: 30 }
    ],
    defaultMessageTemplate: 'Hi {name}, greetings from {business}! Your {reminder} is scheduled for {dueDate}. We are here to assist with all your requirements. Feel free to contact us anytime.'
  }
];

// 1. Get Presets & Template Strings
export const getCrmPresets = (req: Request, res: Response) => {
  return res.json({ presets: CRM_PRESETS });
};

// 2. Add / Ingest CRM Contact
export const createCrmContact = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const {
    name,
    phone,
    email,
    category = 'AUTOMOTIVE',
    referenceNo,
    reminderType = 'SERVICE_DUE',
    reminderTitle,
    lastInteraction,
    nextDueDate,
    repeatCycleDays = 90,
    notes,
    totalSpend = 0
  } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Customer Name and Phone Number are required.' });
  }

  // Calculate Next Due Date if not provided
  let computedDueDate = nextDueDate ? new Date(nextDueDate) : null;
  if (!computedDueDate) {
    const baseDate = lastInteraction ? new Date(lastInteraction) : new Date();
    const cycle = parseInt(String(repeatCycleDays)) || 90;
    computedDueDate = new Date(baseDate.getTime() + cycle * 24 * 60 * 60 * 1000);
  }

  try {
    const contact = await prisma.crmContact.create({
      data: {
        userId: userId!,
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : null,
        category,
        referenceNo: referenceNo ? referenceNo.trim() : null,
        reminderType,
        reminderTitle: reminderTitle || 'Periodic Service / Follow-up Due',
        lastInteraction: lastInteraction ? new Date(lastInteraction) : new Date(),
        nextDueDate: computedDueDate,
        repeatCycleDays: parseInt(String(repeatCycleDays)) || 90,
        status: 'ACTIVE',
        notes: notes || null,
        totalSpend: parseFloat(String(totalSpend)) || 0
      }
    });

    return res.status(201).json({
      success: true,
      message: `Contact "${contact.name}" added to CRM!`,
      contact
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create CRM contact: ' + err.message });
  }
};

// 3. List CRM Contacts with Smart Due Filters
export const listCrmContacts = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { filter, search, category } = req.query;

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const whereClause: any = { userId };

    if (category && category !== 'ALL') {
      whereClause.category = String(category);
    }

    if (search) {
      const q = String(search).trim();
      whereClause.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { referenceNo: { contains: q } },
        { reminderTitle: { contains: q } }
      ];
    }

    // Smart Due Date Filters
    if (filter === 'OVERDUE') {
      whereClause.nextDueDate = { lt: startOfToday };
      whereClause.status = { not: 'COMPLETED' };
    } else if (filter === 'DUE_THIS_WEEK') {
      whereClause.nextDueDate = { gte: startOfToday, lte: endOfWeek };
    } else if (filter === 'DUE_THIS_MONTH') {
      whereClause.nextDueDate = { gte: startOfToday, lte: endOfMonth };
    }

    const contacts = await prisma.crmContact.findMany({
      where: whereClause,
      orderBy: { nextDueDate: 'asc' }
    });

    // Summary Analytics
    const allContacts = await prisma.crmContact.findMany({ where: { userId } });
    const totalContacts = allContacts.length;
    const overdueCount = allContacts.filter(c => c.nextDueDate && new Date(c.nextDueDate) < startOfToday && c.status !== 'COMPLETED').length;
    const dueThisWeekCount = allContacts.filter(c => c.nextDueDate && new Date(c.nextDueDate) >= startOfToday && new Date(c.nextDueDate) <= endOfWeek).length;
    const dueThisMonthCount = allContacts.filter(c => c.nextDueDate && new Date(c.nextDueDate) >= startOfToday && new Date(c.nextDueDate) <= endOfMonth).length;

    return res.json({
      stats: {
        totalContacts,
        overdueCount,
        dueThisWeekCount,
        dueThisMonthCount
      },
      contacts
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch CRM contacts: ' + err.message });
  }
};

// 4. Update Contact / Log Follow-up & Advance Cycle
export const updateCrmContact = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const {
    name,
    phone,
    email,
    category,
    referenceNo,
    reminderType,
    reminderTitle,
    nextDueDate,
    repeatCycleDays,
    status,
    notes,
    advanceCycle
  } = req.body;

  try {
    const existing = await prisma.crmContact.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    let updatedNextDue = nextDueDate ? new Date(nextDueDate) : existing.nextDueDate;
    let newStatus = status || existing.status;
    let visits = existing.totalVisits;

    // Advance cycle to next interval (e.g. customer serviced today -> bump due date +90 days)
    if (advanceCycle) {
      const cycle = parseInt(String(repeatCycleDays || existing.repeatCycleDays)) || 90;
      updatedNextDue = new Date(Date.now() + cycle * 24 * 60 * 60 * 1000);
      newStatus = 'ACTIVE';
      visits += 1;
    }

    const updated = await prisma.crmContact.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        phone: phone !== undefined ? phone.trim() : existing.phone,
        email: email !== undefined ? (email ? email.trim() : null) : existing.email,
        category: category || existing.category,
        referenceNo: referenceNo !== undefined ? (referenceNo ? referenceNo.trim() : null) : existing.referenceNo,
        reminderType: reminderType || existing.reminderType,
        reminderTitle: reminderTitle || existing.reminderTitle,
        nextDueDate: updatedNextDue,
        repeatCycleDays: repeatCycleDays ? parseInt(String(repeatCycleDays)) : existing.repeatCycleDays,
        status: newStatus,
        notes: notes !== undefined ? notes : existing.notes,
        totalVisits: visits,
        lastInteraction: advanceCycle ? new Date() : existing.lastInteraction
      }
    });

    return res.json({
      success: true,
      message: advanceCycle ? `Follow-up logged! Next cycle scheduled for ${updated.nextDueDate?.toISOString().slice(0, 10)}` : 'Contact updated successfully.',
      contact: updated
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update contact: ' + err.message });
  }
};

// 5. Delete Single CRM Contact
export const deleteCrmContact = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  try {
    const existing = await prisma.crmContact.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Contact not found.' });
    }

    await prisma.crmContact.delete({ where: { id } });
    return res.json({ success: true, message: 'Contact deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete contact: ' + err.message });
  }
};

// 6. Batch Delete Contacts
export const batchDeleteCrmContacts = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Please provide an array of contact IDs.' });
  }

  try {
    const deleted = await prisma.crmContact.deleteMany({
      where: { id: { in: ids }, userId }
    });

    return res.json({
      success: true,
      count: deleted.count,
      message: `Successfully deleted ${deleted.count} contact(s).`
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to batch delete contacts: ' + err.message });
  }
};
