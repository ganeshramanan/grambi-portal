import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// Curated Festival, Occasion, and Marketing Calendar Events
const OCCASIONS_DATABASE = [
  // September 2026
  {
    id: 'occ_teacher_day',
    month: 9,
    day: 5,
    title: "Teachers' Day",
    category: 'Celebration',
    suggestedHeading: "Honoring Our Mentors & Teachers",
    suggestedSubheading: "Special gratitude offers for all educators this week!",
    bgGradient: 'from-amber-500 via-orange-600 to-red-600',
    tags: ['education', 'teachersday', 'inspiration']
  },
  {
    id: 'occ_ganesh_chaturthi',
    month: 9,
    day: 14,
    title: 'Ganesh Chaturthi',
    category: 'Festival',
    suggestedHeading: 'Happy Ganesh Chaturthi!',
    suggestedSubheading: 'May Lord Ganesha remove all obstacles and bring prosperity to your family.',
    bgGradient: 'from-amber-600 via-yellow-500 to-orange-700',
    tags: ['festival', 'ganeshchaturthi', 'blessings']
  },
  {
    id: 'occ_engineer_day',
    month: 9,
    day: 15,
    title: "Engineers' Day",
    category: 'Professional',
    suggestedHeading: 'Happy Engineers Day',
    suggestedSubheading: 'Celebrating the minds that build and drive innovation forward.',
    bgGradient: 'from-blue-600 via-indigo-700 to-slate-900',
    tags: ['engineering', 'tech', 'innovation']
  },
  {
    id: 'occ_navratri',
    month: 10,
    day: 10,
    title: 'Navratri & Durga Puja Begins',
    category: 'Festival',
    suggestedHeading: 'Shubh Navratri Festivities',
    suggestedSubheading: 'Celebrate 9 nights of divine grace, joy, and exclusive festival discounts.',
    bgGradient: 'from-rose-600 via-pink-600 to-purple-800',
    tags: ['navratri', 'durgapuja', 'festival']
  },
  {
    id: 'occ_diwali',
    month: 11,
    day: 8,
    title: 'Diwali — Festival of Lights',
    category: 'Festival',
    suggestedHeading: 'Happy & Prosperous Diwali',
    suggestedSubheading: 'May your home and business be illuminated with happiness, peace, and abundance.',
    bgGradient: 'from-yellow-500 via-amber-600 to-purple-900',
    tags: ['diwali', 'festivaloflights', 'celebration']
  },
  {
    id: 'occ_weekend_sale',
    month: 0, // Recurring
    day: 0,
    title: 'Mega Weekend Special Offer',
    category: 'Promotional',
    suggestedHeading: 'Exclusive Weekend Flash Discount',
    suggestedSubheading: 'Flat 25% Off on all periodic maintenance services. Valid this Saturday & Sunday only!',
    bgGradient: 'from-emerald-600 via-teal-700 to-slate-900',
    tags: ['sale', 'discount', 'weekendoffer']
  }
];

// Get occasions & calendar suggestions
export const getOccasions = async (req: AuthRequest, res: Response) => {
  const { month } = req.query;
  const currentMonth = month ? parseInt(String(month)) : new Date().getMonth() + 1;

  const filtered = OCCASIONS_DATABASE.filter(
    occ => occ.month === 0 || occ.month === currentMonth
  );

  return res.json({
    month: currentMonth,
    occasions: filtered,
    allOccasions: OCCASIONS_DATABASE
  });
};

// Generate Post Template Presets
export const getPostTemplates = (req: Request, res: Response) => {
  const templates = [
    {
      id: 'square_instagram',
      name: 'Instagram / WhatsApp Post',
      aspectRatio: '1:1',
      width: 1080,
      height: 1080,
      badge: 'Most Popular'
    },
    {
      id: 'story_whatsapp_status',
      name: 'WhatsApp Status / IG Story',
      aspectRatio: '9:16',
      width: 1080,
      height: 1920,
      badge: 'Vertical'
    },
    {
      id: 'landscape_banner',
      name: 'Facebook & LinkedIn Banner',
      aspectRatio: '16:9',
      width: 1200,
      height: 675,
      badge: 'Banner'
    }
  ];

  const borders = [
    { id: 'gold_luxury', name: 'Gold Luxury Frame', style: 'border: 8px solid #d97706; box-shadow: inset 0 0 20px #b45309;' },
    { id: 'neon_emerald', name: 'Emerald Glow Frame', style: 'border: 6px solid #10b981; box-shadow: 0 0 25px rgba(16, 185, 129, 0.4);' },
    { id: 'minimal_modern', name: 'Clean Modern Inset', style: 'border: 3px solid rgba(255, 255, 255, 0.3); border-radius: 24px;' },
    { id: 'festive_dots', name: 'Festive Pattern Border', style: 'border: 8px dashed #f59e0b; border-radius: 16px;' }
  ];

  return res.json({ templates, borders });
};
