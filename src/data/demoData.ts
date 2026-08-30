import { Product } from '../types';

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-prod-001',
    title: 'Ivory & Gold Hand-Embroidered Bridal Lehenga',
    slug: 'ivory-gold-hand-embroidered-bridal-lehenga',
    category: 'bridal',
    categoryLabel: 'Bridal Couture',
    collectionName: 'Noor Heritage Capsule (Sample Collection)',
    description: '[Sample Product Specification]: Intricately detailed couture lehenga set crafted on raw silk base with zardozi, dabka, and micro-sequin needlework. Paired with a structured sweetheart blouse and dual tulle dupattas with scalloped borders.',
    craftDetails: [
      'Sample craft technique: Hand zardozi needlework',
      'Sample construction: 16-panel flared skirt with canvas can-can lining',
      'Sample embellishments: Metallic bullion thread, dabka, glass cut-dana',
      'Sample origin: Handcrafted by atelier artisans'
    ],
    fabricSpecs: 'Pure Raw Silk (100% Silk), Fine Nylon Tulle Dupattas, Cotton-Silk Satin Lining',
    careInstructions: 'Dry clean only by luxury textile specialists. Store in breathable muslin bag away from direct sunlight.',
    basePriceInr: 185000,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85'
    ],
    isFeatured: true,
    isNewArrival: true,
    isBespokeAvailable: true,
    isSampleItem: true,
    variants: [
      { id: 'demo-var-001-xs', productId: 'demo-prod-001', sku: 'SNV-BR-001-XS', size: 'XS', color: 'Ivory Gold', colorHex: '#F6F3EE', additionalPriceInr: 0, stockQuantity: 2, isActive: true },
      { id: 'demo-var-001-s', productId: 'demo-prod-001', sku: 'SNV-BR-001-S', size: 'S', color: 'Ivory Gold', colorHex: '#F6F3EE', additionalPriceInr: 0, stockQuantity: 3, isActive: true },
      { id: 'demo-var-001-m', productId: 'demo-prod-001', sku: 'SNV-BR-001-M', size: 'M', color: 'Ivory Gold', colorHex: '#F6F3EE', additionalPriceInr: 0, stockQuantity: 2, isActive: true },
      { id: 'demo-var-001-l', productId: 'demo-prod-001', sku: 'SNV-BR-001-L', size: 'L', color: 'Ivory Gold', colorHex: '#F6F3EE', additionalPriceInr: 0, stockQuantity: 1, isActive: true },
      { id: 'demo-var-001-xl', productId: 'demo-prod-001', sku: 'SNV-BR-001-XL', size: 'XL', color: 'Ivory Gold', colorHex: '#F6F3EE', additionalPriceInr: 0, stockQuantity: 1, isActive: true },
      { id: 'demo-var-001-cust', productId: 'demo-prod-001', sku: 'SNV-BR-001-CUST', size: 'Custom Measurement', color: 'Ivory Gold', colorHex: '#F6F3EE', additionalPriceInr: 10000, stockQuantity: 10, isActive: true },
    ]
  },
  {
    id: 'demo-prod-002',
    title: 'Crimson Rose Velvet Festive Lehenga',
    slug: 'crimson-rose-velvet-festive-lehenga',
    category: 'lehengas',
    categoryLabel: 'Occasion Lehengas',
    collectionName: 'Gulab Regalia (Sample Collection)',
    description: '[Sample Product Specification]: Deep crimson micro-velvet lehenga tailored with architectural kalis and antiqued marodi cord work. Accented with a brocade choli and an organza drape.',
    craftDetails: [
      'Sample craft technique: Traditional Marodi and Gota Patti embroidery',
      'Sample flare: Architectural pleated circumference',
      'Sample hardware: Hand-cast brass latkans with silk tassel accents'
    ],
    fabricSpecs: 'Micro-Velvet Skirt, Silk Brocade Blouse, Organza Dupatta',
    careInstructions: 'Professional dry clean only. Steam iron on reverse at low heat.',
    basePriceInr: 145000,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85'
    ],
    isFeatured: true,
    isNewArrival: false,
    isBespokeAvailable: true,
    isSampleItem: true,
    variants: [
      { id: 'demo-var-002-s', productId: 'demo-prod-002', sku: 'SNV-LH-002-S', size: 'S', color: 'Crimson Rose', colorHex: '#781B24', additionalPriceInr: 0, stockQuantity: 4, isActive: true },
      { id: 'demo-var-002-m', productId: 'demo-prod-002', sku: 'SNV-LH-002-M', size: 'M', color: 'Crimson Rose', colorHex: '#781B24', additionalPriceInr: 0, stockQuantity: 2, isActive: true },
      { id: 'demo-var-002-l', productId: 'demo-prod-002', sku: 'SNV-LH-002-L', size: 'L', color: 'Crimson Rose', colorHex: '#781B24', additionalPriceInr: 0, stockQuantity: 2, isActive: true },
      { id: 'demo-var-002-cust', productId: 'demo-prod-002', sku: 'SNV-LH-002-CUST', size: 'Custom Measurement', color: 'Crimson Rose', colorHex: '#781B24', additionalPriceInr: 8000, stockQuantity: 8, isActive: true },
    ]
  },
  {
    id: 'demo-prod-003',
    title: 'Tissue Silk Kanjivaram Revival Saree',
    slug: 'tissue-silk-kanjivaram-revival-saree',
    category: 'sarees',
    categoryLabel: 'Artisanal Sarees',
    collectionName: 'Varanasi & Kanchipuram Weaves (Sample Collection)',
    description: '[Sample Product Specification]: Handwoven tissue silk drape featuring pure silver and gold electroplated zari motifs. Includes an unstitched brocade blouse piece.',
    craftDetails: [
      'Sample craft technique: Korvai interlocking pit-loom weaving',
      'Sample zari: Silver zari with 24k gold bath',
      'Sample length: 6.5 meters with blouse piece'
    ],
    fabricSpecs: '100% Pure Mulberry Silk Warp & Weft, Metallic Zari',
    careInstructions: 'Dry clean only. Roll in muslin cloth; periodically air out in shaded area.',
    basePriceInr: 78000,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85'
    ],
    isFeatured: true,
    isNewArrival: true,
    isBespokeAvailable: false,
    isSampleItem: true,
    variants: [
      { id: 'demo-var-003-std', productId: 'demo-prod-003', sku: 'SNV-SR-003-STD', size: 'M', color: 'Champagne Gold', colorHex: '#D7C49E', additionalPriceInr: 0, stockQuantity: 5, isActive: true },
    ]
  },
  {
    id: 'demo-prod-004',
    title: 'Monochrome Organza Layered Anarkali Set',
    slug: 'monochrome-organza-layered-anarkali-set',
    category: 'anarkalis',
    categoryLabel: 'Contemporary Anarkalis',
    collectionName: 'Aura Monochrome (Sample Collection)',
    description: '[Sample Product Specification]: Modern floor-length flared silhouette cut in sheer glass organza with shadow aari threadwork, paired with silk chudidar pants and an ombre veil.',
    craftDetails: [
      'Sample craft technique: Fine needle aari embroidery with pearl beads',
      'Sample silhouette: 28-kali voluminous flare with asymmetric yoke',
      'Sample closure: Handcrafted potli fabric buttons'
    ],
    fabricSpecs: 'Silk Organza Kurta, Silk Crepe Pants, Chiffon Stole',
    careInstructions: 'Dry clean only.',
    basePriceInr: 64000,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85'
    ],
    isFeatured: false,
    isNewArrival: true,
    isBespokeAvailable: true,
    isSampleItem: true,
    variants: [
      { id: 'demo-var-004-s', productId: 'demo-prod-004', sku: 'SNV-AK-004-S', size: 'S', color: 'Ivory Charcoal', colorHex: '#27201a', additionalPriceInr: 0, stockQuantity: 3, isActive: true },
      { id: 'demo-var-004-m', productId: 'demo-prod-004', sku: 'SNV-AK-004-M', size: 'M', color: 'Ivory Charcoal', colorHex: '#27201a', additionalPriceInr: 0, stockQuantity: 4, isActive: true },
      { id: 'demo-var-004-l', productId: 'demo-prod-004', sku: 'SNV-AK-004-L', size: 'L', color: 'Ivory Charcoal', colorHex: '#27201a', additionalPriceInr: 0, stockQuantity: 2, isActive: true },
    ]
  },
  {
    id: 'demo-prod-005',
    title: 'Pistachio Chanderi Kurta & Gharara Ensemble',
    slug: 'pistachio-chanderi-kurta-gharara-ensemble',
    category: 'ready-to-wear',
    categoryLabel: 'Ready To Wear',
    collectionName: 'Zehn Luxury Pret (Sample Collection)',
    description: '[Sample Product Specification]: Relaxed fit Chanderi silk tunic detailed with delicate pita work along neckline and sleeve hems, matched with tiered gathered gharara pants.',
    craftDetails: [
      'Sample craft technique: Hand pita and mukaish embellishment',
      'Sample silhouette: Flared tier gharara with gota borders'
    ],
    fabricSpecs: 'Pure Chanderi Silk with Cotton Mulmul Lining',
    careInstructions: 'Gentle dry clean only.',
    basePriceInr: 46000,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85'
    ],
    isFeatured: true,
    isNewArrival: false,
    isBespokeAvailable: true,
    isSampleItem: true,
    variants: [
      { id: 'demo-var-005-xs', productId: 'demo-prod-005', sku: 'SNV-RTW-005-XS', size: 'XS', color: 'Pistachio Sage', colorHex: '#C5D0B8', additionalPriceInr: 0, stockQuantity: 3, isActive: true },
      { id: 'demo-var-005-s', productId: 'demo-prod-005', sku: 'SNV-RTW-005-S', size: 'S', color: 'Pistachio Sage', colorHex: '#C5D0B8', additionalPriceInr: 0, stockQuantity: 4, isActive: true },
      { id: 'demo-var-005-m', productId: 'demo-prod-005', sku: 'SNV-RTW-005-M', size: 'M', color: 'Pistachio Sage', colorHex: '#C5D0B8', additionalPriceInr: 0, stockQuantity: 3, isActive: true },
      { id: 'demo-var-005-l', productId: 'demo-prod-005', sku: 'SNV-RTW-005-L', size: 'L', color: 'Pistachio Sage', colorHex: '#C5D0B8', additionalPriceInr: 0, stockQuantity: 1, isActive: true },
    ]
  },
  {
    id: 'demo-prod-006',
    title: 'Handcrafted Antique Polki & Pearl Potli Bag',
    slug: 'handcrafted-antique-polki-pearl-potli-bag',
    category: 'accessories',
    categoryLabel: 'Accessories & Fine Accents',
    collectionName: 'Heirloom Accents (Sample Collection)',
    description: '[Sample Product Specification]: Structured evening potli bag embellished with faux un-cut polki stones, seed pearls, and braided gold metallic drawstrings.',
    craftDetails: [
      'Sample craft technique: Hand-set polki settings on raw silk base',
      'Sample lining: Suede satin interior with slip pocket'
    ],
    fabricSpecs: 'Raw Silk, Seed Pearls, Metal Accents',
    careInstructions: 'Wipe clean with dry soft cloth. Keep wrapped in cotton pouch.',
    basePriceInr: 16500,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85'
    ],
    isFeatured: false,
    isNewArrival: false,
    isBespokeAvailable: false,
    isSampleItem: true,
    variants: [
      { id: 'demo-var-006-one', productId: 'demo-prod-006', sku: 'SNV-ACC-006-OS', size: 'M', color: 'Antique Gold', colorHex: '#BFA36C', additionalPriceInr: 0, stockQuantity: 8, isActive: true },
    ]
  }
];

export const DEMO_COLLECTIONS = [
  {
    id: 'noor-heritage',
    title: 'Noor Bridal Capsule (Sample)',
    subtitle: 'Heirloom silhouettes reimagined with contemporary restraint',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=85',
    itemCount: 4,
    description: '[Sample Lookbook Description]: A masterclass in subtle extravagance, featuring delicate zardozi, handwoven weaves, and tone-on-tone metallic embroideries designed for contemporary bridal celebrations.'
  },
  {
    id: 'varanasi-weaves',
    title: 'Varanasi & Kanchipuram Weaves (Sample)',
    subtitle: 'Pure mulberry silks and handloom craftsmanship',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=85',
    itemCount: 6,
    description: '[Sample Lookbook Description]: Preserving traditional pit-loom techniques through revivalist palettes and feather-light drape engineering.'
  },
  {
    id: 'zehn-pret',
    title: 'Zehn Luxury Pret (Sample)',
    subtitle: 'Relaxed festive tailoring for modern soirées',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85',
    itemCount: 8,
    description: '[Sample Lookbook Description]: Breezy Chanderi, fluid georgettes, and understated embellishments for intimate celebrations.'
  }
];

export const DEMO_STORE_INFO = {
  name: 'Saanvya Atelier & Flagship (Sample Location Placeholder)',
  notice: 'Demo Placeholder Notice: Official atelier address, contact hours, and phone lines will be updated upon brand verification.',
  city: 'Mumbai (Sample)',
  addressLine: 'Colaba Waterfront Heritage Precinct, Mumbai, Maharashtra 400001 (Placeholder Address)',
  hours: 'Tuesday – Sunday: 11:00 AM – 7:30 PM (By Private Appointment)',
  phone: '+91 22 0000 0000 (Sample Placeholder)',
  email: 'concierge@saanvya-demo.local (Sample Placeholder)',
  services: [
    'Private Bridal Suite Consultations (Sample Service)',
    'Made-to-Measure Custom Tailoring & Fittings (Sample Service)',
    'Worldwide Insured Express Delivery (Scaffolded)',
    'Dedicated Personal Stylist Support'
  ]
};

export const DEMO_POLICIES = {
  madeToOrderTimeline: '[Sample Policy Placeholder]: Standard made-to-order garments typically take 4 to 6 weeks for handcrafting and quality check. Custom bridal couture timelines are determined individually during atelier consultation.',
  shippingTerms: '[Sample Shipping Scaffold]: Complimentary insured courier delivery across India on orders above ₹15,000. Flat ₹500 standard delivery fee on orders below ₹15,000. Real-time carrier tracking integration will be enabled upon logistics partner onboarding.',
  alterationPolicy: '[Sample Alteration Terms]: Complimentary first fitting and minor alterations within 14 days of delivery. Client may visit our atelier or ship garments for adjustments.',
  returnsCancellation: '[Sample Return Notice]: Because couture pieces are crafted or tailored on order, returns are processed under our luxury concierge policy for sizing adjustment or store credit as per brand guidelines upon final verification.',
  paymentNotice: '[Sample Payment Scaffold]: Secure payment integration architecture prepared for UPI, Cards, Net Banking, and Bank Wire. Live gateway credentials will be activated following merchant account approval.'
};
