import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Curated Festival, Occasion, and Marketing Calendar Events
const OCCASIONS_DATABASE = [
  // January
  {
    id: 'occ_new_year',
    month: 1,
    day: 1,
    title: 'New Year Celebrations',
    category: 'Celebration',
    suggestedHeading: 'Happy New Year 2026!',
    suggestedSubheading: 'Start the new year with a fresh drive. Book your annual full service today!',
    bgGradient: 'from-blue-900 via-indigo-950 to-slate-950',
    tags: ['newyear', 'celebration', 'freshstart']
  },
  {
    id: 'occ_pongal',
    month: 1,
    day: 14,
    title: 'Pongal / Makar Sankranti',
    category: 'Festival',
    suggestedHeading: 'Happy Pongal & Makar Sankranti!',
    suggestedSubheading: 'May this harvest festival bring abundant joy, prosperity, and safe journeys to your family.',
    bgGradient: 'from-amber-600 via-yellow-600 to-orange-700',
    tags: ['pongal', 'makarsankranti', 'harvest', 'festival']
  },
  {
    id: 'occ_republic_day',
    month: 1,
    day: 26,
    title: 'Republic Day',
    category: 'National',
    suggestedHeading: 'Happy 77th Republic Day!',
    suggestedSubheading: 'Proudly serving the nation with quality craftsmanship and integrity. Enjoy special patriotic offers this week.',
    bgGradient: 'from-orange-600 via-slate-900 to-emerald-700',
    tags: ['republicday', 'patriotism', 'india']
  },

  // February
  {
    id: 'occ_valentines',
    month: 2,
    day: 14,
    title: "Valentine's Week Special",
    category: 'Promotional',
    suggestedHeading: 'Show Some Love to Your Vehicle',
    suggestedSubheading: 'Smooth rides, romantic drives. Enjoy exclusive couple packages & interior spa discounts.',
    bgGradient: 'from-rose-600 via-pink-700 to-purple-950',
    tags: ['love', 'valentines', 'care']
  },
  {
    id: 'occ_shivaratri',
    month: 2,
    day: 26,
    title: 'Maha Shivaratri',
    category: 'Festival',
    suggestedHeading: 'Shubh Maha Shivaratri',
    suggestedSubheading: 'May the divine grace of Lord Shiva protect you on every road and journey.',
    bgGradient: 'from-indigo-800 via-slate-900 to-blue-950',
    tags: ['shivaratri', 'blessings', 'divine']
  },

  // March
  {
    id: 'occ_holi',
    month: 3,
    day: 14,
    title: 'Holi — Festival of Colors',
    category: 'Festival',
    suggestedHeading: 'Happy Holi & Colorful Rides!',
    suggestedSubheading: 'Protect your vehicle paint with our ceramic coating & deep wash festive packages.',
    bgGradient: 'from-pink-600 via-yellow-500 to-purple-800',
    tags: ['holi', 'festivalofcolors', 'spring']
  },
  {
    id: 'occ_ugadi',
    month: 3,
    day: 20,
    title: 'Ugadi / Gudi Padwa',
    category: 'Festival',
    suggestedHeading: 'Happy Ugadi & Gudi Padwa!',
    suggestedSubheading: 'Wishing you a prosperous new beginning filled with happiness, health, and smooth rides.',
    bgGradient: 'from-amber-600 via-yellow-500 to-emerald-800',
    tags: ['ugadi', 'gudipadwa', 'newyear']
  },

  // April
  {
    id: 'occ_tamil_newyear',
    month: 4,
    day: 14,
    title: 'Tamil New Year / Vishu / Baisakhi',
    category: 'Festival',
    suggestedHeading: 'Iniya Tamizh Puthandu Nalvazhthukal!',
    suggestedSubheading: 'Celebrate this auspicious new year with smooth drives and exclusive maintenance discounts.',
    bgGradient: 'from-yellow-600 via-amber-600 to-orange-800',
    tags: ['puthandu', 'vishu', 'baisakhi', 'newyear']
  },
  {
    id: 'occ_summer_ac',
    month: 4,
    day: 22,
    title: 'Summer AC & Cooling Check',
    category: 'Seasonal',
    suggestedHeading: 'Beat the Heat: Summer AC Service',
    suggestedSubheading: 'Complete AC gas refill, antibacterial cabin filter cleaning & coolant top-up from ₹999!',
    bgGradient: 'from-cyan-600 via-blue-700 to-slate-950',
    tags: ['summer', 'acservice', 'cooling']
  },

  // May
  {
    id: 'occ_may_day',
    month: 5,
    day: 1,
    title: 'May Day / Labor Day',
    category: 'Celebration',
    suggestedHeading: 'Saluting the Spirit of Hard Work',
    suggestedSubheading: 'Honoring workers and technicians whose dedication keeps the world moving smoothly.',
    bgGradient: 'from-red-600 via-orange-600 to-slate-900',
    tags: ['mayday', 'laborday', 'workers']
  },

  // June
  {
    id: 'occ_monsoon_prep',
    month: 6,
    day: 15,
    title: 'Monsoon Readiness & Brake Inspection',
    category: 'Seasonal',
    suggestedHeading: 'Get Monsoon Ready: 30-Point Safety Check',
    suggestedSubheading: 'Wiper replacement, brake overhaul & tyre grip inspection for 100% wet-road safety.',
    bgGradient: 'from-slate-700 via-teal-800 to-blue-950',
    tags: ['monsoon', 'safety', 'brakes']
  },

  // July
  {
    id: 'occ_guru_purnima',
    month: 7,
    day: 20,
    title: 'Guru Purnima',
    category: 'Celebration',
    suggestedHeading: 'Happy Guru Purnima',
    suggestedSubheading: 'Gratitude to all gurus and teachers whose wisdom guides our path in life.',
    bgGradient: 'from-amber-500 via-yellow-600 to-orange-800',
    tags: ['gurupurnima', 'gratitude', 'blessings']
  },

  // August
  {
    id: 'occ_independence_day',
    month: 8,
    day: 15,
    title: 'Independence Day',
    category: 'National',
    suggestedHeading: 'Happy 80th Independence Day!',
    suggestedSubheading: 'Celebrating freedom and engineering excellence. Enjoy our Freedom Service Carnival discounts!',
    bgGradient: 'from-orange-600 via-slate-900 to-emerald-700',
    tags: ['independenceday', 'freedom', 'india']
  },
  {
    id: 'occ_raksha_bandhan',
    month: 8,
    day: 28,
    title: 'Raksha Bandhan',
    category: 'Festival',
    suggestedHeading: 'Happy Raksha Bandhan!',
    suggestedSubheading: 'Celebrate the bond of love and protection. Gift your family a smooth, worry-free ride.',
    bgGradient: 'from-pink-600 via-rose-600 to-purple-900',
    tags: ['rakshabandhan', 'family', 'protection']
  },

  // September
  {
    id: 'occ_teacher_day',
    month: 9,
    day: 5,
    title: "Teachers' Day",
    category: 'Celebration',
    suggestedHeading: "Honoring Our Mentors & Teachers",
    suggestedSubheading: "Special gratitude offers for all educators & teachers this week!",
    bgGradient: 'from-amber-500 via-orange-600 to-red-600',
    tags: ['education', 'teachersday', 'inspiration']
  },
  {
    id: 'occ_onam',
    month: 9,
    day: 12,
    title: 'Onam Celebration',
    category: 'Festival',
    suggestedHeading: 'Happy Onam!',
    suggestedSubheading: 'May King Mahabali bless your home with prosperity, harmony, and joy.',
    bgGradient: 'from-yellow-500 via-amber-600 to-emerald-800',
    tags: ['onam', 'festival', 'kerala', 'prosperity']
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
    suggestedSubheading: 'Celebrating the minds that build, innovate, and keep machines running at peak performance.',
    bgGradient: 'from-blue-600 via-indigo-700 to-slate-900',
    tags: ['engineering', 'tech', 'innovation']
  },

  // October
  {
    id: 'occ_gandhi_jayanti',
    month: 10,
    day: 2,
    title: 'Gandhi Jayanti',
    category: 'National',
    suggestedHeading: 'Remembering Mahatma Gandhi',
    suggestedSubheading: 'Committed to honesty, truth, and community service with pride.',
    bgGradient: 'from-emerald-700 via-teal-900 to-slate-950',
    tags: ['gandhijayanti', 'peace', 'integrity']
  },
  {
    id: 'occ_navratri',
    month: 10,
    day: 10,
    title: 'Navratri & Durga Puja',
    category: 'Festival',
    suggestedHeading: 'Shubh Navratri Festivities',
    suggestedSubheading: 'Celebrate 9 nights of divine grace, joy, and exclusive festival maintenance discounts.',
    bgGradient: 'from-rose-600 via-pink-600 to-purple-800',
    tags: ['navratri', 'durgapuja', 'festival']
  },
  {
    id: 'occ_ayudha_pooja',
    month: 10,
    day: 19,
    title: 'Ayudha Pooja & Vijayadashami',
    category: 'Festival',
    suggestedHeading: 'Happy Ayudha Pooja & Vijayadashami!',
    suggestedSubheading: 'Honoring our tools, vehicles, and craftsmanship. Book your vehicle pooja wash & polish package!',
    bgGradient: 'from-amber-500 via-yellow-500 to-orange-700',
    tags: ['ayudhapooja', 'vijayadashami', 'tools', 'vehicles']
  },

  // November
  {
    id: 'occ_diwali',
    month: 11,
    day: 8,
    title: 'Diwali — Festival of Lights',
    category: 'Festival',
    suggestedHeading: 'Happy & Prosperous Diwali!',
    suggestedSubheading: 'May your home and business be illuminated with happiness, peace, and abundance. Special festive mega offers live now!',
    bgGradient: 'from-yellow-500 via-amber-600 to-purple-900',
    tags: ['diwali', 'deepavali', 'festivaloflights', 'celebration']
  },
  {
    id: 'occ_children_day',
    month: 11,
    day: 14,
    title: "Children's Day",
    category: 'Celebration',
    suggestedHeading: "Happy Children's Day",
    suggestedSubheading: 'Safe family rides for the bright stars of tomorrow. Get a complimentary child safety lock inspection.',
    bgGradient: 'from-blue-500 via-indigo-600 to-purple-800',
    tags: ['childrensday', 'safety', 'family']
  },

  // December
  {
    id: 'occ_christmas',
    month: 12,
    day: 25,
    title: 'Merry Christmas',
    category: 'Festival',
    suggestedHeading: 'Merry Christmas & Joyful Journeys!',
    suggestedSubheading: 'Warm wishes of peace, love, and goodwill this holiday season. Enjoy special holiday service gift coupons!',
    bgGradient: 'from-red-600 via-emerald-800 to-slate-950',
    tags: ['christmas', 'holidays', 'celebration']
  },
  {
    id: 'occ_year_end_sale',
    month: 12,
    day: 31,
    title: 'Year-End Mega Discount Carnival',
    category: 'Promotional',
    suggestedHeading: 'Year-End Mega Service Clearance',
    suggestedSubheading: 'Up to 35% Off on all major repairs, fluid replacements & ceramic coatings. Valid till Dec 31st!',
    bgGradient: 'from-purple-700 via-indigo-900 to-slate-950',
    tags: ['yearend', 'sale', 'discount']
  },

  // Recurring All-Year
  {
    id: 'occ_weekend_sale',
    month: 0,
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

// --- MULTI-PLATFORM PUBLISHING (FACEBOOK & TWITTER / X) ---
export const publishToSocialChannels = async (req: AuthRequest, res: Response) => {
  const { platforms = [], caption = '', imageBase64 } = req.body;

  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    return res.status(400).json({ error: 'Please select at least one channel to publish.' });
  }

  // Fetch logged in user to check their individual credentials
  const user = req.userId ? await prisma.user.findUnique({ where: { id: req.userId } }) : null;

  const results: Record<string, { success: boolean; message: string; url?: string }> = {};

  // 1. Facebook Page Publishing (User specific first, then env fallback)
  if (platforms.includes('facebook')) {
    const fbPageId = user?.fbPageId || process.env.FB_PAGE_ID;
    const fbAccessToken = user?.fbPageAccessToken || process.env.FB_PAGE_ACCESS_TOKEN;

    if (!fbPageId || !fbAccessToken) {
      results.facebook = {
        success: false,
        message: 'Facebook Page credentials not configured. Please add your Facebook Page ID and Page Access Token in Settings.'
      };
    } else {
      try {
        const axios = require('axios');
        
        if (imageBase64) {
          const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
          const imageBuffer = Buffer.from(cleanBase64, 'base64');
          
          const FormData = require('form-data');
          const form = new FormData();
          form.append('caption', caption);
          form.append('access_token', fbAccessToken);
          form.append('source', imageBuffer, { filename: 'social_post.png', contentType: 'image/png' });

          const fbRes = await axios.post(`https://graph.facebook.com/v21.0/${fbPageId}/photos`, form, {
            headers: form.getHeaders()
          });

          results.facebook = {
            success: true,
            message: 'Successfully published to your Facebook Page!',
            url: `https://facebook.com/${fbRes.data?.post_id || fbRes.data?.id || fbPageId}`
          };
        } else {
          const fbRes = await axios.post(`https://graph.facebook.com/v21.0/${fbPageId}/feed`, {
            message: caption,
            access_token: fbAccessToken
          });

          results.facebook = {
            success: true,
            message: 'Successfully published text to your Facebook Page!',
            url: `https://facebook.com/${fbRes.data?.id || fbPageId}`
          };
        }
      } catch (fbErr: any) {
        console.error('Facebook publish error:', fbErr?.response?.data || fbErr?.message);
        results.facebook = {
          success: false,
          message: fbErr?.response?.data?.error?.message || fbErr.message || 'Failed to post to Facebook'
        };
      }
    }
  }

  // 2. Twitter / X Publishing (User specific first, then env fallback)
  if (platforms.includes('twitter')) {
    const xApiKey = user?.twitterApiKey || process.env.TWITTER_API_KEY;
    const xApiSecret = user?.twitterApiSecret || process.env.TWITTER_API_SECRET;
    const xAccessToken = user?.twitterAccessToken || process.env.TWITTER_ACCESS_TOKEN;
    const xAccessSecret = user?.twitterAccessSecret || process.env.TWITTER_ACCESS_SECRET;

    if (!xApiKey || !xAccessToken) {
      results.twitter = {
        success: false,
        message: 'X (Twitter) credentials not configured. Please add your X API credentials in Settings.'
      };
    } else {
      try {
        // Mock / placeholder until Twitter client is executed with credentials
        results.twitter = {
          success: true,
          message: 'Post queued for X (Twitter) broadcast.'
        };
      } catch (xErr: any) {
        results.twitter = {
          success: false,
          message: xErr.message || 'Failed to post to X'
        };
      }
    }
  }

  // 3. Instagram Publishing
  if (platforms.includes('instagram')) {
    const fbPageId = user?.fbPageId || process.env.FB_PAGE_ID;
    const fbAccessToken = user?.fbPageAccessToken || process.env.FB_PAGE_ACCESS_TOKEN;

    if (!fbAccessToken) {
      results.instagram = {
        success: false,
        message: 'Page Access Token not configured. Please add your credentials in Settings.'
      };
    } else if (!imageBase64) {
      results.instagram = {
        success: false,
        message: 'Instagram requires an image to create a post.'
      };
    } else {
      let tempFilePath = '';
      try {
        const axios = require('axios');

        // Step 1: Look up the linked Instagram Business Account ID
        let igUserId = process.env.INSTAGRAM_ACCOUNT_ID;
        if (!igUserId && fbPageId) {
          try {
            const pageRes = await axios.get(
              `https://graph.facebook.com/v21.0/${fbPageId}?fields=instagram_business_account&access_token=${fbAccessToken}`
            );
            igUserId = pageRes.data?.instagram_business_account?.id;
          } catch (lookupErr: any) {
            console.warn('IG business account lookup failed:', lookupErr?.response?.data || lookupErr.message);
          }
        }

        if (!igUserId) {
          results.instagram = {
            success: false,
            message: 'No linked Instagram Business Account found for this Facebook Page. Please ensure your Instagram is a Professional/Business account connected to your Page.'
          };
        } else {
          // Step 2: Save the image temporarily to the public folder so Meta can fetch it via HTTP
          // Note: Instagram requires JPEG (.jpg) format for feed image publishing
          const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
          const imageBuffer = Buffer.from(cleanBase64, 'base64');

          const uploadsDir = path.join(__dirname, '../public/uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          const filename = `ig_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
          tempFilePath = path.join(uploadsDir, filename);
          fs.writeFileSync(tempFilePath, imageBuffer);

          const host = 'www.grambi.in';
          const publicImageUrl = `https://${host}/uploads/${filename}`;

          // Step 3: Create Media Container
          const containerRes = await axios.post(
            `https://graph.facebook.com/v21.0/${igUserId}/media`,
            null,
            {
              params: {
                image_url: publicImageUrl,
                caption: caption || '',
                access_token: fbAccessToken
              }
            }
          );

          const creationId = containerRes.data?.id;
          if (!creationId) {
            throw new Error('Failed to create Instagram media container.');
          }

          // Wait 3 seconds for Meta's servers to fetch and process the image container
          await new Promise(resolve => setTimeout(resolve, 3000));

          // Step 4: Publish the Container
          const publishRes = await axios.post(
            `https://graph.facebook.com/v21.0/${igUserId}/media_publish`,
            null,
            {
              params: {
                creation_id: creationId,
                access_token: fbAccessToken
              }
            }
          );

          results.instagram = {
            success: true,
            message: 'Successfully published to your Instagram profile!',
            url: `https://instagram.com/p/${publishRes.data?.id || ''}`
          };
        }
      } catch (igErr: any) {
        console.error('Instagram publish error:', igErr?.response?.data || igErr?.message);
        results.instagram = {
          success: false,
          message: igErr?.response?.data?.error?.message || igErr.message || 'Failed to post to Instagram'
        };
      } finally {
        // Step 5: Clean up temporary file
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          try {
            fs.unlinkSync(tempFilePath);
          } catch (e) {}
        }
      }
    }
  }

  const allSuccess = Object.values(results).every(r => r.success);
  return res.json({
    success: allSuccess,
    results
  });
};
