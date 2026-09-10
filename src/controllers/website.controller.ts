import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';
import { INDUSTRY_TEMPLATES, addCustomTemplate, deleteCustomTemplate } from '../config/templates.preset';

const prisma = new PrismaClient();

// List All Preset & Configured Website Templates (supports ?category=Automotive)
export const getWebsiteTemplates = async (req: Request, res: Response) => {
  const { category } = req.query;
  let filtered = INDUSTRY_TEMPLATES;
  if (category && category !== 'ALL') {
    filtered = INDUSTRY_TEMPLATES.filter(t => t.category.toLowerCase().includes(String(category).toLowerCase()));
  }

  // Also collect all distinct categories for category dropdown
  const categories = Array.from(new Set(INDUSTRY_TEMPLATES.map(t => t.category)));

  return res.json({
    success: true,
    categories,
    templates: filtered
  });
};

// Admin: Add New Industry Website Template
export const createWebsiteTemplate = async (req: AuthRequest, res: Response) => {
  const { name, category, theme, heroBg, previewThumb, tagline, about, defaultServices } = req.body;

  if (!name || !category || !heroBg) {
    return res.status(400).json({ error: 'Name, Category, and Hero Background URL are required.' });
  }

  const newTemplate = addCustomTemplate({
    id: `tpl_${Date.now()}`,
    name,
    category,
    icon: 'ri-layout-masonry-line',
    badgeText: `Verified ${category} Specialist`,
    theme: theme || 'amber',
    heroBg,
    previewThumb: previewThumb || heroBg,
    tagline: tagline || `${name} Quality Services`,
    about: about || `Dedicated to delivering the highest quality ${category} services.`,
    defaultServices: Array.isArray(defaultServices) && defaultServices.length > 0 ? defaultServices : [
      { name: 'Standard Service Package', price: '₹999', description: '• Premium quality\n• Timely delivery' }
    ],
    defaultGallery: [heroBg]
  });

  return res.status(201).json({
    success: true,
    message: 'Template created successfully',
    template: newTemplate
  });
};

// Admin: Delete Website Template
export const removeWebsiteTemplate = async (req: AuthRequest, res: Response) => {
  const { templateId } = req.params;
  const deleted = deleteCustomTemplate(templateId);

  if (!deleted) {
    return res.status(404).json({ error: 'Template not found' });
  }

  return res.json({
    success: true,
    message: 'Template deleted successfully'
  });
};

const createSlug = (val: string) => {
  return String(val || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
};

// Get the authenticated user's website customizer data
export const getMyWebsite = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  try {
    let website = await prisma.website.findUnique({
      where: { userId },
      include: {
        serviceRequests: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Auto-create initial website record if first visit
    if (!website) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const initialName = user?.businessName || 'My Business';
      const baseSlug = createSlug(initialName) || `site-${Date.now()}`;

      website = await prisma.website.create({
        data: {
          userId: userId!,
          slug: baseSlug,
          businessName: initialName,
          tagline: `${initialName} Professional Services`,
          headline: `Welcome to ${initialName}`,
          about: `Welcome to ${initialName}. We are dedicated to providing high quality professional services, reliable support, and complete customer satisfaction. Contact us today!`,
          phone: user?.phone || '+91 9876543210',
          whatsapp: user?.phone || '+91 9876543210',
          address: 'Location details provided upon appointment confirmation.',
          hours: 'Mon - Sat: 9:00 AM - 7:00 PM',
          theme: 'blue',
          servicesJson: JSON.stringify([
            { id: 's1', name: 'General Consultation & Service', price: '₹499', description: '• Standard inspection & assessment\n• Quality guaranteed assistance\n• Expert professional guidance' },
            { id: 's2', name: 'Premium Full Package Service', price: '₹1,299', description: '• Comprehensive end-to-end service\n• Priority customer support\n• Complete satisfaction guarantee' }
          ]),
          galleryJson: JSON.stringify([
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop'
          ])
        },
        include: {
          serviceRequests: true
        }
      });
    }

    return res.json({
      ...website,
      services: JSON.parse(website.servicesJson || '[]'),
      gallery: JSON.parse(website.galleryJson || '[]')
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to load website details: ' + err.message });
  }
};

// Update Website Customizer Configuration
export const updateMyWebsite = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { businessName, tagline, headline, about, phone, whatsapp, address, hours, theme, logo, services, gallery, slug } = req.body;

  try {
    let finalSlug: string | undefined = undefined;
    if (slug) {
      finalSlug = createSlug(slug);
      // Ensure unique slug
      const existing = await prisma.website.findFirst({
        where: { slug: finalSlug, NOT: { userId } }
      });
      if (existing) {
        finalSlug = `${finalSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    const updated = await prisma.website.update({
      where: { userId },
      data: {
        businessName: businessName || undefined,
        tagline: tagline !== undefined ? tagline : undefined,
        headline: headline !== undefined ? headline : undefined,
        about: about || undefined,
        phone: phone || undefined,
        whatsapp: whatsapp || undefined,
        address: address || undefined,
        hours: hours || undefined,
        theme: theme || undefined,
        logo: logo !== undefined ? logo : undefined,
        slug: finalSlug || undefined,
        servicesJson: services ? JSON.stringify(services) : undefined,
        galleryJson: gallery ? JSON.stringify(gallery) : undefined
      }
    });

    return res.json({
      success: true,
      message: 'Website updated successfully!',
      website: {
        ...updated,
        services: JSON.parse(updated.servicesJson || '[]'),
        gallery: JSON.parse(updated.galleryJson || '[]')
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update website: ' + err.message });
  }
};

// Public Website Endpoint (Accessible by anyone via /site/:slug or /api/website/public/:slug)
export const getPublicWebsite = async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    const rawSlug = String(slug || '').trim();
    const cleanSlug = rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Strict tenant matching by exact slug or clean slug
    let website = await prisma.website.findFirst({
      where: {
        OR: [
          { slug: rawSlug },
          { slug: cleanSlug }
        ]
      },
      include: {
        user: {
          select: { businessName: true, email: true }
        }
      }
    });

    if (!website) {
      return res.status(404).json({ error: `Website with slug '${slug}' not found.` });
    }

    return res.json({
      id: website.id,
      slug: website.slug,
      businessName: website.businessName,
      tagline: website.tagline,
      headline: website.headline || website.tagline || website.businessName,
      about: website.about,
      phone: website.phone,
      whatsapp: website.whatsapp,
      address: website.address,
      hours: website.hours,
      theme: website.theme,
      logo: website.logo,
      services: JSON.parse(website.servicesJson || '[]'),
      gallery: JSON.parse(website.galleryJson || '[]')
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to load website details: ' + err.message });
  }
};

// Public Appointment / Service Booking Request
export const submitPublicBooking = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { name, phone, vehicle, service, notes } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and Phone are required.' });
  }

  try {
    const website = await prisma.website.findUnique({ where: { slug } });
    if (!website) return res.status(404).json({ error: 'Website not found' });

    const booking = await prisma.serviceRequest.create({
      data: {
        websiteId: website.id,
        name,
        phone,
        vehicle: vehicle || 'N/A',
        service: service || 'General Service',
        notes: notes || null,
        status: 'NEW'
      }
    });

    // Auto-Sync Web Booking Lead to Customer Retention CRM
    try {
      const cleanPhone = phone.trim();
      const existingCrm = await prisma.crmContact.findFirst({
        where: { userId: website.userId, phone: cleanPhone }
      });

      if (!existingCrm) {
        await prisma.crmContact.create({
          data: {
            userId: website.userId,
            name: name.trim(),
            phone: cleanPhone,
            category: 'AUTOMOTIVE',
            referenceNo: vehicle && vehicle !== 'N/A' ? vehicle.trim() : null,
            reminderTitle: `Web Booking: ${service || 'General Service'}`,
            nextDueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            repeatCycleDays: 90,
            totalVisits: 1,
            status: 'ACTIVE',
            notes: notes ? `Online lead: ${notes}` : 'Captured from public website booking'
          }
        });
      }
    } catch (crmLeadErr) {
      console.warn('CRM Web Lead Auto-Sync notice:', crmLeadErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Service appointment request submitted successfully!',
      booking
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to submit booking request: ' + err.message });
  }
};

// Update Lead / Appointment Status (e.g. NEW -> REPLIED -> COMPLETED)
export const updateLeadStatus = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { leadId } = req.params;
  const { status } = req.body;

  try {
    const website = await prisma.website.findUnique({ where: { userId } });
    if (!website) return res.status(404).json({ error: 'Website not found' });

    const lead = await prisma.serviceRequest.findFirst({
      where: { id: leadId, websiteId: website.id }
    });

    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const updated = await prisma.serviceRequest.update({
      where: { id: leadId },
      data: { status: status || 'REPLIED' }
    });

    return res.json({ success: true, lead: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update lead status: ' + err.message });
  }
};

// Delete a single lead / enquiry
export const deleteLead = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { leadId } = req.params;

  try {
    const website = await prisma.website.findUnique({ where: { userId } });
    if (!website) return res.status(404).json({ error: 'Website not found' });

    const lead = await prisma.serviceRequest.findFirst({
      where: { id: leadId, websiteId: website.id }
    });

    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    await prisma.serviceRequest.delete({
      where: { id: leadId }
    });

    return res.json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete enquiry: ' + err.message });
  }
};

// Clear all attended / completed enquiries
export const clearCompletedLeads = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  try {
    const website = await prisma.website.findUnique({ where: { userId } });
    if (!website) return res.status(404).json({ error: 'Website not found' });

    const result = await prisma.serviceRequest.deleteMany({
      where: {
        websiteId: website.id,
        status: { in: ['COMPLETED', 'REPLIED'] }
      }
    });

    return res.json({ success: true, count: result.count, message: `Cleared ${result.count} attended enquiries` });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to clear enquiries: ' + err.message });
  }
};

// Record Public Analytics Event (Page view, Call Click, WhatsApp Click, Map Directions)
export const recordAnalyticsEvent = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { eventType } = req.body;

  if (!eventType) {
    return res.status(400).json({ error: 'eventType is required' });
  }

  try {
    const website = await prisma.website.findUnique({ where: { slug } });
    if (!website) return res.status(404).json({ error: 'Website not found' });

    await prisma.analyticsEvent.create({
      data: {
        websiteId: website.id,
        eventType: String(eventType).toUpperCase()
      }
    });

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to record event: ' + err.message });
  }
};

// Get Analytics Stats for Workshop Owner (With Time Filters: WEEK, MONTH, ALL)
export const getWebsiteAnalytics = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { period = 'WEEK' } = req.query;

  try {
    const website = await prisma.website.findUnique({ where: { userId } });
    if (!website) return res.status(404).json({ error: 'Website not found' });

    // Calculate Date Threshold
    let dateFilter: Date | undefined = undefined;
    const now = new Date();
    if (period === 'WEEK') {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'MONTH') {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const whereClause: any = {
      websiteId: website.id,
      ...(dateFilter ? { createdAt: { gte: dateFilter } } : {})
    };

    const events = await prisma.analyticsEvent.findMany({
      where: whereClause,
      select: { eventType: true, createdAt: true }
    });

    const pageViews = events.filter(e => e.eventType === 'PAGE_VIEW').length;
    const callClicks = events.filter(e => e.eventType === 'CALL_CLICK').length;
    const whatsappClicks = events.filter(e => e.eventType === 'WHATSAPP_CLICK').length;
    const mapClicks = events.filter(e => e.eventType === 'MAP_CLICK').length;
    const vcardDownloads = events.filter(e => e.eventType === 'VCARD_DOWNLOAD').length;

    // Also count bookings received in this period
    const bookingsCount = await prisma.serviceRequest.count({
      where: {
        websiteId: website.id,
        ...(dateFilter ? { createdAt: { gte: dateFilter } } : {})
      }
    });

    return res.json({
      period,
      stats: {
        pageViews,
        callClicks,
        whatsappClicks,
        mapClicks,
        vcardDownloads,
        bookingsCount,
        totalInteractions: callClicks + whatsappClicks + mapClicks + vcardDownloads + bookingsCount
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch analytics: ' + err.message });
  }
};
