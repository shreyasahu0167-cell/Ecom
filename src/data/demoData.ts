import { Product } from '../types';

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    title: 'Sample Ivory & Gold Embroidered Bridal Lehenga',
    slug: 'sample-ivory-gold-embroidered-bridal-lehenga',
    category: 'bridal',
    categoryLabel: 'Bridal Couture',
    collectionName: 'Sample Bridal Capsule',
    description: 'Sample couture lehenga set designed on a raw silk base with hand-embroidered metallic accents, structured sweetheart neckline blouse, and dual tulle dupattas.',
    craftDetails: [
      'Hand needlework and cord embroidery accents',
      'Flared panel skirt construction with structured inner lining',
      'Metallic thread and glass bead embellishments',
      'Sample design for catalog demonstration'
    ],
    fabricSpecs: 'Raw Silk, Fine Tulle Dupattas, Satin Lining (Sample specification)',
    careInstructions: 'Dry clean only. Store in a breathable garment bag away from direct heat.',
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
      { id: 'var-001-xs', productId: 'prod-001', sku: 'SNV-SAMPLE-BR-01-XS', size: 'XS', color: 'Ivory Gold', colorHex: '#F6F3EE', additionalPriceInr: 0, stockQuantity: 2, isActive: true },
      { id: 'var-001-s', productId: 'prod-001', sku: 'SNV-SAMPLE-BR-01-S', size: 'S', color: 'Ivory Gold', colorHex: '#F6F3EE', additionalPriceInr: 0, stockQuantity: 3, isActive: true },
      { id: 'var-001-m', productId: 'prod-001', sku: 'SNV-SAMPLE-BR-01-M', size: 'M', color: 'Ivory Gold', colorHex: '#F6F3EE', additionalPriceInr: 0, stockQuantity: 2, isActive: true },
      { id: 'var-001-l', productId: 'prod-001', sku: 'SNV-SAMPLE-BR-01-L', size: 'L', color: 'Ivory Gold', colorHex: '#F6F3EE', additionalPriceInr: 0, stockQuantity: 1, isActive: true },
      { id: 'var-001-xl', productId: 'prod-001', sku: 'SNV-SAMPLE-BR-01-XL', size: 'XL', color: 'Ivory Gold', colorHex: '#F6F3EE', additionalPriceInr: 0, stockQuantity: 1, isActive: true },
      { id: 'var-001-cust', productId: 'prod-001', sku: 'SNV-SAMPLE-BR-01-CUST', size: 'Custom Measurement', color: 'Ivory Gold', colorHex: '#F6F3EE', additionalPriceInr: 10000, stockQuantity: 10, isActive: true },
    ]
  },
  {
    id: 'prod-002',
    title: 'Sample Crimson Velvet Festive Lehenga',
    slug: 'sample-crimson-velvet-festive-lehenga',
    category: 'lehengas',
    categoryLabel: 'Occasion Lehengas',
    collectionName: 'Sample Festive Collection',
    description: 'Sample crimson velvet occasion lehenga tailored with structured kalis and cord embroidery, paired with a matching blouse and delicate drape.',
    craftDetails: [
      'Traditional motif cord and thread embroidery',
      'Pleated circumference with inner structured flare',
      'Decorative latkan accents',
      'Sample design for catalog demonstration'
    ],
    fabricSpecs: 'Micro-Velvet Skirt, Brocade Blouse, Organza Dupatta (Sample specification)',
    careInstructions: 'Dry clean only. Steam iron on reverse at low temperature.',
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
      { id: 'var-002-s', productId: 'prod-002', sku: 'SNV-SAMPLE-LH-02-S', size: 'S', color: 'Crimson Rose', colorHex: '#781B24', additionalPriceInr: 0, stockQuantity: 4, isActive: true },
      { id: 'var-002-m', productId: 'prod-002', sku: 'SNV-SAMPLE-LH-02-M', size: 'M', color: 'Crimson Rose', colorHex: '#781B24', additionalPriceInr: 0, stockQuantity: 2, isActive: true },
      { id: 'var-002-l', productId: 'prod-002', sku: 'SNV-SAMPLE-LH-02-L', size: 'L', color: 'Crimson Rose', colorHex: '#781B24', additionalPriceInr: 0, stockQuantity: 2, isActive: true },
      { id: 'var-002-cust', productId: 'prod-002', sku: 'SNV-SAMPLE-LH-02-CUST', size: 'Custom Measurement', color: 'Crimson Rose', colorHex: '#781B24', additionalPriceInr: 8000, stockQuantity: 8, isActive: true },
    ]
  },
  {
    id: 'prod-003',
    title: 'Sample Tissue Silk Saree',
    slug: 'sample-tissue-silk-saree',
    category: 'sarees',
    categoryLabel: 'Artisanal Sarees',
    collectionName: 'Sample Silk Weaves',
    description: 'Sample handloom-inspired tissue silk saree featuring metallic zari border motifs, accompanied by an unstitched blouse piece.',
    craftDetails: [
      'Woven zari border and pallu motifs',
      'Standard 6.5 meters drape with unstitched blouse piece',
      'Sample design for catalog demonstration'
    ],
    fabricSpecs: 'Tissue Silk Blend, Metallic Zari (Sample specification)',
    careInstructions: 'Dry clean only. Roll in cotton cloth; store in a cool dry area.',
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
      { id: 'var-003-std', productId: 'prod-003', sku: 'SNV-SAMPLE-SR-03-STD', size: 'M', color: 'Champagne Gold', colorHex: '#D7C49E', additionalPriceInr: 0, stockQuantity: 5, isActive: true },
    ]
  },
  {
    id: 'prod-004',
    title: 'Sample Organza Layered Anarkali Set',
    slug: 'sample-organza-layered-anarkali-set',
    category: 'anarkalis',
    categoryLabel: 'Contemporary Anarkalis',
    collectionName: 'Sample Contemporary Edit',
    description: 'Sample floor-length flared silhouette cut in organza with threadwork accents, paired with slim-fit pants and matching stole.',
    craftDetails: [
      'Needle threadwork with bead accents',
      'Voluminous flared panel silhouette',
      'Sample design for catalog demonstration'
    ],
    fabricSpecs: 'Organza Kurta, Silk Crepe Pants, Chiffon Stole (Sample specification)',
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
      { id: 'var-004-s', productId: 'prod-004', sku: 'SNV-SAMPLE-AK-04-S', size: 'S', color: 'Ivory Charcoal', colorHex: '#27201a', additionalPriceInr: 0, stockQuantity: 3, isActive: true },
      { id: 'var-004-m', productId: 'prod-004', sku: 'SNV-SAMPLE-AK-04-M', size: 'M', color: 'Ivory Charcoal', colorHex: '#27201a', additionalPriceInr: 0, stockQuantity: 4, isActive: true },
      { id: 'var-004-l', productId: 'prod-004', sku: 'SNV-SAMPLE-AK-04-L', size: 'L', color: 'Ivory Charcoal', colorHex: '#27201a', additionalPriceInr: 0, stockQuantity: 2, isActive: true },
    ]
  },
  {
    id: 'prod-005',
    title: 'Sample Silk Kurta & Gharara Set',
    slug: 'sample-silk-kurta-gharara-set',
    category: 'ready-to-wear',
    categoryLabel: 'Ready To Wear',
    collectionName: 'Sample Festive Pret',
    description: 'Sample silk tunic detailed with neckline embellishment, paired with tiered gathered gharara pants.',
    craftDetails: [
      'Hand thread and metallic work detailing',
      'Tiered flared gharara with border trim',
      'Sample design for catalog demonstration'
    ],
    fabricSpecs: 'Silk Blend with Cotton Mulmul Lining (Sample specification)',
    careInstructions: 'Dry clean only.',
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
      { id: 'var-005-xs', productId: 'prod-005', sku: 'SNV-SAMPLE-RTW-05-XS', size: 'XS', color: 'Pistachio Sage', colorHex: '#C5D0B8', additionalPriceInr: 0, stockQuantity: 3, isActive: true },
      { id: 'var-005-s', productId: 'prod-005', sku: 'SNV-SAMPLE-RTW-05-S', size: 'S', color: 'Pistachio Sage', colorHex: '#C5D0B8', additionalPriceInr: 0, stockQuantity: 4, isActive: true },
      { id: 'var-005-m', productId: 'prod-005', sku: 'SNV-SAMPLE-RTW-05-M', size: 'M', color: 'Pistachio Sage', colorHex: '#C5D0B8', additionalPriceInr: 0, stockQuantity: 3, isActive: true },
      { id: 'var-005-l', productId: 'prod-005', sku: 'SNV-SAMPLE-RTW-05-L', size: 'L', color: 'Pistachio Sage', colorHex: '#C5D0B8', additionalPriceInr: 0, stockQuantity: 1, isActive: true },
    ]
  },
  {
    id: 'prod-006',
    title: 'Sample Embroidered Evening Potli Bag',
    slug: 'sample-embroidered-evening-potli-bag',
    category: 'accessories',
    categoryLabel: 'Accessories & Fine Accents',
    collectionName: 'Sample Accents',
    description: 'Sample evening potli bag with bead embellishment and metallic drawstrings.',
    craftDetails: [
      'Embroidered motifs on fabric base',
      'Interior lining with drawstring closure',
      'Sample accessory for catalog demonstration'
    ],
    fabricSpecs: 'Silk Blend, Bead Accents (Sample specification)',
    careInstructions: 'Wipe clean with dry cloth.',
    basePriceInr: 16500,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85'
    ],
    isFeatured: false,
    isNewArrival: false,
    isBespokeAvailable: false,
    isSampleItem: true,
    variants: [
      { id: 'var-006-one', productId: 'prod-006', sku: 'SNV-SAMPLE-ACC-06-OS', size: 'M', color: 'Antique Gold', colorHex: '#BFA36C', additionalPriceInr: 0, stockQuantity: 8, isActive: true },
    ]
  }
];

export const DEMO_COLLECTIONS = [
  {
    id: 'sample-bridal-capsule',
    title: 'Sample Bridal Capsule',
    subtitle: 'Demonstration bridal silhouettes for catalog preview',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=85',
    itemCount: 4,
    description: 'Sample showcase featuring demonstration lehengas, blouses, and dupattas crafted for previewing catalog layouts and sizing workflows.'
  },
  {
    id: 'sample-silk-weaves',
    title: 'Sample Silk Weaves',
    subtitle: 'Demonstration handloom and silk drape designs',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=85',
    itemCount: 6,
    description: 'Demonstration collection showcasing sample saree silhouettes, metallic weave accents, and drape styling.'
  },
  {
    id: 'sample-festive-pret',
    title: 'Sample Festive Pret',
    subtitle: 'Demonstration occasionwear and tailored sets',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85',
    itemCount: 8,
    description: 'Demonstration ensembles featuring sample tunic cuts, ghararas, and contemporary festive tailoring.'
  }
];

export const DEMO_STORE_INFO = {
  name: 'Saanvya Atelier (Location To Be Confirmed)',
  notice: 'Store address, appointments, and visiting schedules will be confirmed by Saanvya upon launch.',
  city: 'To Be Confirmed',
  addressLine: 'Atelier address to be confirmed by Saanvya',
  hours: 'Consultation timings to be confirmed by Saanvya',
  phone: 'To be confirmed by Saanvya',
  email: 'contact@saanvya.com (Placeholder)',
  services: [
    'Private Consultations (To be confirmed by Saanvya)',
    'Custom Sizing & Measurement Consultations (To be confirmed by Saanvya)',
    'Order Viewings (To be confirmed by Saanvya)',
  ]
};

export const DEMO_POLICIES = {
  madeToOrderTimeline: 'Bespoke and made-to-order production timelines to be confirmed by Saanvya.',
  shippingTerms: 'Shipping rates, dispatch schedules, and courier partners to be confirmed by Saanvya.',
  alterationPolicy: 'Fitting and alteration terms to be confirmed by Saanvya.',
  returnsCancellation: 'Return, exchange, and cancellation terms to be confirmed by Saanvya.',
  paymentNotice: 'Accepted payment methods and invoicing terms to be confirmed by Saanvya.'
};

