export interface IndustryTemplate {
  id: string;
  name: string;
  category: string;
  icon: string;
  badgeText: string;
  theme: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose';
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

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: 'tpl_automobile',
    name: 'Automobile Workshop & Garage',
    category: 'Automotive',
    icon: 'ri-car-washing-line',
    badgeText: 'Certified Automobile Care & Repairs',
    theme: 'amber',
    heroBg: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=1600&auto=format&fit=crop',
    previewThumb: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=500&auto=format&fit=crop',
    tagline: 'Multi-Brand Two & Four Wheeler Service Specialist',
    about: 'Dedicated automotive care center equipped with advanced diagnostic tools, genuine OEM spare parts, and certified master technicians for complete vehicle reliability.',
    defaultServices: [
      {
        name: 'Periodic Full Service & Inspection',
        price: '₹1,499',
        description: '• Complete engine oil & filter replacement\n• 40-point safety and brake inspection\n• Spark plug, air filter & fluid top-up'
      },
      {
        name: 'Computerized Engine Diagnostics',
        price: '₹799',
        description: '• Advanced OBD-II computerized scanning\n• Sensor calibration & error code clearing\n• Fuel injector and performance tuning'
      },
      {
        name: 'Brake Overhaul & Disc Servicing',
        price: '₹899',
        description: '• Front & rear brake pad replacement\n• Rotor disc resurfacing & caliper cleaning\n• DOT 4 brake fluid bleeding'
      },
      {
        name: 'Car AC & Cooling System Service',
        price: '₹1,299',
        description: '• AC condenser & cooling coil antibacterial cleaning\n• Cabin pollen filter replacement\n• Refrigerant R134a gas refill'
      }
    ],
    defaultGallery: [
      'https://images.unsplash.com/photo-1613214149922-f1809c99b414?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'tpl_pharmacy',
    name: 'Pharmacy & Medical Store',
    category: 'Healthcare & Pharma',
    icon: 'ri-capsule-line',
    badgeText: 'Licensed 100% Genuine Pharmacy',
    theme: 'emerald',
    heroBg: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=1600&auto=format&fit=crop',
    previewThumb: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=500&auto=format&fit=crop',
    tagline: 'Prescription Medicines, Surgical Essentials & Daily Wellness',
    about: 'Your trusted neighborhood pharmacy offering 100% genuine allopathic medicines, healthcare supplements, baby products, and rapid home delivery on valid prescriptions.',
    defaultServices: [
      {
        name: 'Prescription Medicine Delivery',
        price: 'Free on ₹499+',
        description: '• Upload prescription on WhatsApp\n• Genuine branded & generic medicines\n• Doorstep delivery within 2 hours'
      },
      {
        name: 'Blood Pressure & Sugar Checkup',
        price: 'Free',
        description: '• Instant digital BP reading\n• Fast blood glucose test\n• Health record log assistance'
      },
      {
        name: 'Baby Care & Mother Wellness',
        price: 'Best Market Price',
        description: '• Diapers, infant milk & pediatric vitamins\n• Mother care essentials & sanitization items'
      },
      {
        name: 'Surgical & Orthopedic Supports',
        price: 'From ₹299',
        description: '• Knee braces, lumbar belts, crepe bandages\n• Vaporizers, thermometers & oximeters'
      }
    ],
    defaultGallery: [
      'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'tpl_clinic',
    name: 'Doctor Clinic & Diagnostic Care',
    category: 'Healthcare',
    icon: 'ri-stethoscope-line',
    badgeText: 'Verified Medical Consultation & Care',
    theme: 'blue',
    heroBg: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1600&auto=format&fit=crop',
    previewThumb: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=500&auto=format&fit=crop',
    tagline: 'Compassionate Family Healthcare & Expert Medical Consultations',
    about: 'Modern multi-specialty clinical practice dedicated to comprehensive primary care, chronic disease management, and personalized patient wellness programs.',
    defaultServices: [
      {
        name: 'General Physician Consultation',
        price: '₹400',
        description: '• Comprehensive physical examination\n• Fever, cold, viral & infection care\n• Preventive lifestyle counseling'
      },
      {
        name: 'Diabetes & Hypertension Management',
        price: '₹600 / mo',
        description: '• Periodic blood sugar & HbA1c monitoring\n• BP tracking & dietary guidance\n• Personalized medication titration'
      },
      {
        name: 'Diagnostic Blood Tests & Labs',
        price: 'From ₹199',
        description: '• Complete Blood Count (CBC) & Lipid Profile\n• Thyroid & Vitamin D/B12 panels\n• Digital reports delivered over WhatsApp'
      },
      {
        name: 'Pediatric Care & Vaccinations',
        price: '₹500',
        description: '• Child growth & developmental checkup\n• Government & IAP schedule immunizations\n• Seasonal flu and viral protection'
      }
    ],
    defaultGallery: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'tpl_grocery',
    name: 'Supermarket & Fresh Groceries',
    category: 'Retail & Grocery',
    icon: 'ri-shopping-basket-2-line',
    badgeText: 'Fresh Farm Produce & Daily Provisions',
    theme: 'emerald',
    heroBg: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop',
    previewThumb: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=500&auto=format&fit=crop',
    tagline: 'Farm-Fresh Vegetables, Daily Staples & Household Goods',
    about: 'Your premier community store for handpicked organic vegetables, premium grains, cold-pressed oils, packaged food, and fast WhatsApp order deliveries.',
    defaultServices: [
      {
        name: 'WhatsApp Monthly Provision List',
        price: 'Best Wholesale Rates',
        description: '• Send your grocery list as text or photo\n• Premium unpolished rice, dals & spices\n• Packed neatly & delivered same day'
      },
      {
        name: 'Daily Fresh Farm Vegetables',
        price: 'Direct Farm Prices',
        description: '• 100% fresh morning harvest\n• Organic leafy greens, roots & seasonal fruits'
      },
      {
        name: 'Dairy, Bakery & Breakfast Staples',
        price: 'MRP Discounts',
        description: '• Farm fresh milk, curd, paneer & butter\n• Fresh whole-wheat breads, eggs & cereals'
      },
      {
        name: 'Express Home Delivery',
        price: 'Free within 3 km',
        description: '• Contactless doorstep delivery\n• UPI / Cash on Delivery accepted'
      }
    ],
    defaultGallery: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'tpl_salon',
    name: 'Salon, Spa & Beauty Lounge',
    category: 'Beauty & Wellness',
    icon: 'ri-scissors-2-line',
    badgeText: 'Premium Hair Styling & Skin Therapy',
    theme: 'rose',
    heroBg: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1600&auto=format&fit=crop',
    previewThumb: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=500&auto=format&fit=crop',
    tagline: 'Luxury Hair Styling, Skin Therapy & Bridal Grooming',
    about: 'Relax, rejuvenate, and elevate your personal style with our certified hairstylists, organic facials, bridal packages, and relaxing head-to-toe spa rituals.',
    defaultServices: [
      {
        name: 'Signature Haircut & Spa Treatment',
        price: '₹599',
        description: '• Customized style consultation\n• Clarifying wash, scalp massage & blow-dry\n• Deep conditioning keratin treatment'
      },
      {
        name: 'Organic Glow Facial & De-Tan',
        price: '₹1,199',
        description: '• 5-step deep pore cleansing & extraction\n• Anti-pigmentation skin brighten mask\n• Soothing cold jade roller massage'
      },
      {
        name: 'Bridal & Grooming Studio Package',
        price: 'From ₹4,999',
        description: '• Complete pre-wedding skin & hair rituals\n• HD Makeup & hair draping'
      },
      {
        name: 'Spa Manicure & Pedicure',
        price: '₹799',
        description: '• Herbal foot soak, exfoliation & callus care\n• Cuticle nourishment & gel polish finish'
      }
    ],
    defaultGallery: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'tpl_consulting',
    name: 'Consultancy & Professional Services',
    category: 'Professional Services',
    icon: 'ri-briefcase-line',
    badgeText: 'Verified Advisory & Business Solutions',
    theme: 'purple',
    heroBg: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop',
    previewThumb: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=500&auto=format&fit=crop',
    tagline: 'Strategic Business Consulting, Legal & Financial Advisory',
    about: 'Empowering businesses and individuals with strategic advisory, tax planning, corporate compliance, and digital growth consulting backed by proven expertise.',
    defaultServices: [
      {
        name: 'Strategic Advisory & Discovery Session',
        price: '₹1,999',
        description: '• 60-minute 1-on-1 discovery roadmap\n• Business model & revenue leak analysis\n• Actionable 90-day execution blueprint'
      },
      {
        name: 'GST, Tax Filing & Compliance',
        price: 'From ₹999 / mo',
        description: '• Monthly GST return filing & reconciliation\n• Annual income tax assessment & filings\n• Audit support & documentation'
      },
      {
        name: 'Company Incorporation & Trademarks',
        price: '₹4,499',
        description: '• Private Limited / LLP registration\n• Trademark application & copyright protection\n• MSME & Startup India certification'
      },
      {
        name: 'Digital Transformation & Automation',
        price: 'Custom Quote',
        description: '• CRM & WhatsApp business workflow setup\n• Custom software & automation roadmaps'
      }
    ],
    defaultGallery: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80'
    ]
  }
];
