import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

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
      const initialName = user?.businessName || 'My Auto Workshop';
      const baseSlug = createSlug(initialName) || `site-${Date.now()}`;

      website = await prisma.website.create({
        data: {
          userId: userId!,
          slug: baseSlug,
          businessName: initialName,
          tagline: 'Quality Car & Bike Service Specialist',
          about: 'We provide expert automotive maintenance, periodic servicing, diagnostics, and repairs with certified mechanics.',
          phone: user?.phone || '+91 9876543210',
          whatsapp: user?.phone || '+91 9876543210',
          address: 'Main Highway Road, Industrial Area',
          hours: 'Mon - Sat: 9:00 AM - 7:00 PM',
          theme: 'blue',
          servicesJson: JSON.stringify([
            { id: 's1', name: 'General Maintenance & Oil Service', price: '₹1,499', description: 'Full engine inspection, oil change, and 30-point checkup.' },
            { id: 's2', name: 'Brake Inspection & Pad Replacement', price: '₹999', description: 'Brake pad replacement, disc resurfacing, and fluid flush.' },
            { id: 's3', name: 'Battery Health & Electrical Diagnosis', price: '₹499', description: 'Alternator testing, battery health check, and wiring diagnostics.' },
            { id: 's4', name: 'AC Service & Gas Top-up', price: '₹1,299', description: 'Cooling coil cleaning, filter replacement, and refrigerant refill.' }
          ]),
          galleryJson: JSON.stringify([
            'https://images.unsplash.com/photo-1613214149922-f1809c99b414?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80'
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
  const { businessName, tagline, about, phone, whatsapp, address, hours, theme, logo, services, gallery, slug } = req.body;

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
        tagline: tagline || undefined,
        about: about || undefined,
        phone: phone || undefined,
        whatsapp: whatsapp || undefined,
        address: address || undefined,
        hours: hours || undefined,
        theme: theme || undefined,
        logo: logo || undefined,
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
    const website = await prisma.website.findUnique({
      where: { slug },
      include: {
        user: {
          select: { businessName: true, email: true }
        }
      }
    });

    if (!website) {
      return res.status(404).json({ error: 'Workshop website not found.' });
    }

    return res.json({
      id: website.id,
      slug: website.slug,
      businessName: website.businessName,
      tagline: website.tagline,
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
    return res.status(500).json({ error: 'Failed to load public website.' });
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

    return res.status(201).json({
      success: true,
      message: 'Service appointment request submitted successfully!',
      booking
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to submit booking request.' });
  }
};
