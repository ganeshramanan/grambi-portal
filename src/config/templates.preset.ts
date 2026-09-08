export interface IndustryTemplate {
  id: string;
  name: string;
  category: string; // 'Automotive', 'Healthcare & Pharma', 'Clinic', 'Grocery', 'Salon & Beauty', 'Professional Services'
  icon: string;
  badgeText: string;
  theme: 'amber' | 'emerald' | 'blue' | 'rose' | 'purple';
  heroBg: string;
  previewThumb: string;
  tagline: string;
  about: string;
  defaultServices: Array<{
    name: string;
    price: string;
    description: string;
  }>;
  defaultGallery: string[];
}

export let INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  // --- AUTOMOTIVE INDUSTRY TEMPLATES ---
  {
    id: 'tpl_auto_dark',
    name: 'Biker & Garage Dark Pro',
    category: 'Automotive',
    icon: 'ri-car-washing-line',
    badgeText: 'Certified Multi-Brand Workshop',
    theme: 'amber',
    heroBg: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=1600&auto=format&fit=crop',
    previewThumb: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=500&auto=format&fit=crop',
    tagline: 'Multi-Brand Two & Four Wheeler Service Specialist',
    about: 'Dedicated automotive care center equipped with advanced diagnostic tools, genuine OEM spare parts, and certified master technicians for complete vehicle reliability.',
    defaultServices: [
      { name: 'Periodic General Service', price: '₹1,499', description: '• Full fluid top-up\n• 40-point safety check\n• Brake pad & chain clean' },
      { name: 'Computerized Scan & Tuning', price: '₹799', description: '• OBD-II error scan\n• Injector tuning\n• Sensor calibration' },
      { name: 'Brake Disc & Pad Overhaul', price: '₹899', description: '• Caliper service\n• Rotor resurfacing\n• Fluid bleed' }
    ],
    defaultGallery: [
      'https://images.unsplash.com/photo-1613214149922-f1809c99b414?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'tpl_auto_speed',
    name: 'Speed & Performance Racing Edition',
    category: 'Automotive',
    icon: 'ri-flashlight-line',
    badgeText: 'High-Performance Superbike & Car Care',
    theme: 'rose',
    heroBg: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1600&auto=format&fit=crop',
    previewThumb: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=500&auto=format&fit=crop',
    tagline: 'Precision Tuning, Performance Exhausts & Custom Upgrades',
    about: 'We specialize in performance tuning, custom exhaust fittings, ECU remapping, track-prep inspections, and premium synthetic lubricant upgrades.',
    defaultServices: [
      { name: 'ECU Remap & Dyno Tuning', price: '₹4,999', description: '• Stage 1 & 2 maps\n• Throttle response sharpening\n• Speed limiter lift' },
      { name: 'Performance Exhaust & Intake', price: 'From ₹1,999', description: '• Free flow filter install\n• Exhaust de-cat & slip-on fitting' },
      { name: 'Racing Suspension Setup', price: '₹1,299', description: '• Sag & preload setting\n• Fork oil rebuild & seal replacement' }
    ],
    defaultGallery: [
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'tpl_auto_detailing',
    name: 'Ceramic & Spa Detailing Studio',
    category: 'Automotive',
    icon: 'ri-sparkling-fill',
    badgeText: '9H Ceramic & Paint Protection Experts',
    theme: 'blue',
    heroBg: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=1600&auto=format&fit=crop',
    previewThumb: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=500&auto=format&fit=crop',
    tagline: 'Showroom Mirror Shine, PPF Wraps & Deep Interior Wash',
    about: 'Premium automotive spa delivering 9H ceramic coating, scratch removal, self-healing paint protection film (PPF), and deep antimicrobial interior steam wash.',
    defaultServices: [
      { name: '9H Nano Ceramic Coating', price: 'From ₹5,999', description: '• 3-stage paint correction\n• 3-year hydrophobic warranty\n• Deep gloss glass coat' },
      { name: 'Deep Steam Interior Detailing', price: '₹1,799', description: '• Upholstery steam wash\n• AC duct disinfection\n• Leather conditioning' },
      { name: 'Foam Wash & Polymer Wax', price: '₹699', description: '• pH neutral snow foam\n• Underbody pressure spray\n• High gloss sealant' }
    ],
    defaultGallery: [
      'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=600&auto=format&fit=crop&q=80'
    ]
  },

  // --- HEALTHCARE & PHARMA ---
  {
    id: 'tpl_pharmacy_classic',
    name: 'Neighborhood MediCare Store',
    category: 'Healthcare & Pharma',
    icon: 'ri-capsule-line',
    badgeText: 'Licensed 100% Genuine Pharmacy',
    theme: 'emerald',
    heroBg: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=1600&auto=format&fit=crop',
    previewThumb: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=500&auto=format&fit=crop',
    tagline: 'Prescription Medicines, Surgical Essentials & Fast Home Delivery',
    about: 'Your trusted neighborhood pharmacy offering 100% genuine allopathic medicines, healthcare supplements, baby products, and rapid home delivery on valid prescriptions.',
    defaultServices: [
      { name: 'Prescription Medicine Delivery', price: 'Free on ₹499+', description: '• Send prescription via WhatsApp\n• Genuine branded & generic medicines\n• Doorstep delivery within 2 hours' },
      { name: 'Blood Pressure & Sugar Checkup', price: 'Free', description: '• Instant digital BP reading\n• Fast blood glucose test\n• Health record log assistance' }
    ],
    defaultGallery: [
      'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'tpl_pharmacy_wellness',
    name: 'Holistic Ayurveda & Wellness Hub',
    category: 'Healthcare & Pharma',
    icon: 'ri-plant-line',
    badgeText: 'Pure Herbal & Organic Wellness',
    theme: 'emerald',
    heroBg: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1600&auto=format&fit=crop',
    previewThumb: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=500&auto=format&fit=crop',
    tagline: 'Ayurvedic Remedies, Organic Herbal Supplements & Natural Healing',
    about: 'Specialized wellness dispensary offering authentic Ayurvedic formulations, herbal teas, cold-pressed oils, and certified natural skin health products.',
    defaultServices: [
      { name: 'Ayurvedic Consultation & Remedy', price: '₹299', description: '• Dosha evaluation\n• Personalized herbal regime\n• Dietary guidance' }
    ],
    defaultGallery: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'
    ]
  },

  // --- DOCTOR & CLINIC ---
  {
    id: 'tpl_clinic_family',
    name: 'Family Health & Specialty Clinic',
    category: 'Clinic & Healthcare',
    icon: 'ri-stethoscope-line',
    badgeText: 'Verified Medical Consultation & Care',
    theme: 'blue',
    heroBg: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1600&auto=format&fit=crop',
    previewThumb: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=500&auto=format&fit=crop',
    tagline: 'Compassionate Family Healthcare & Expert Medical Consultations',
    about: 'Modern multi-specialty clinical practice dedicated to comprehensive primary care, chronic disease management, and personalized patient wellness programs.',
    defaultServices: [
      { name: 'General Physician Consultation', price: '₹400', description: '• Physical examination\n• Fever, viral & infection care\n• Preventive lifestyle counseling' }
    ],
    defaultGallery: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80'
    ]
  },

  // --- GROCERY & SUPERMARKET ---
  {
    id: 'tpl_grocery_fresh',
    name: 'Daily Fresh Supermarket',
    category: 'Retail & Grocery',
    icon: 'ri-shopping-basket-2-line',
    badgeText: 'Fresh Farm Produce & Daily Provisions',
    theme: 'emerald',
    heroBg: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop',
    previewThumb: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=500&auto=format&fit=crop',
    tagline: 'Farm-Fresh Vegetables, Daily Staples & Household Goods',
    about: 'Your premier community store for handpicked organic vegetables, premium grains, cold-pressed oils, packaged food, and fast WhatsApp order deliveries.',
    defaultServices: [
      { name: 'WhatsApp Monthly Grocery List', price: 'Wholesale Rates', description: '• Send list as photo or text\n• Packed & delivered same day' }
    ],
    defaultGallery: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80'
    ]
  },

  // --- SALON & BEAUTY ---
  {
    id: 'tpl_salon_luxury',
    name: 'Luxury Hair & Beauty Lounge',
    category: 'Beauty & Wellness',
    icon: 'ri-scissors-2-line',
    badgeText: 'Premium Hair Styling & Skin Therapy',
    theme: 'rose',
    heroBg: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1600&auto=format&fit=crop',
    previewThumb: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=500&auto=format&fit=crop',
    tagline: 'Luxury Hair Styling, Skin Therapy & Bridal Grooming',
    about: 'Relax, rejuvenate, and elevate your personal style with our certified hairstylists, organic facials, bridal packages, and relaxing head-to-toe spa rituals.',
    defaultServices: [
      { name: 'Signature Haircut & Spa Treatment', price: '₹599', description: '• Customized style consultation\n• Wash & scalp massage\n• Deep conditioning' }
    ],
    defaultGallery: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80'
    ]
  },

  // --- PROFESSIONAL SERVICES ---
  {
    id: 'tpl_consulting_corp',
    name: 'Corporate Advisory & Tax Studio',
    category: 'Professional Services',
    icon: 'ri-briefcase-line',
    badgeText: 'Verified Advisory & Business Solutions',
    theme: 'purple',
    heroBg: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop',
    previewThumb: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=500&auto=format&fit=crop',
    tagline: 'Strategic Business Consulting, Legal & Financial Advisory',
    about: 'Empowering businesses and individuals with strategic advisory, tax planning, corporate compliance, and digital growth consulting backed by proven expertise.',
    defaultServices: [
      { name: 'Strategic Advisory Session', price: '₹1,999', description: '• 60-minute roadmap session\n• Business model review' }
    ],
    defaultGallery: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80'
    ]
  }
];

export const addCustomTemplate = (tpl: IndustryTemplate) => {
  INDUSTRY_TEMPLATES.unshift(tpl);
  return tpl;
};

export const deleteCustomTemplate = (id: string) => {
  const index = INDUSTRY_TEMPLATES.findIndex(t => t.id === id);
  if (index !== -1) {
    INDUSTRY_TEMPLATES.splice(index, 1);
    return true;
  }
  return false;
};
