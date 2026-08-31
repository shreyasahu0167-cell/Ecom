import React, { useState } from 'react';
import { Product, ProductVariant } from '../../types';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Scissors,
  DollarSign,
  Tag,
  Layers,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { formatInr } from '../../utils/formatters';

interface ProductEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> & { id?: string }) => Promise<void>;
  initialProduct?: Product | null;
}

const CATEGORY_OPTIONS = [
  { value: 'bridal', label: 'Bridal Couture', defaultCollection: 'Noor Heritage Capsule' },
  { value: 'lehengas', label: 'Occasion Lehengas', defaultCollection: 'Gulab Regalia' },
  { value: 'sarees', label: 'Artisanal Sarees', defaultCollection: 'Varanasi & Kanchipuram Weaves' },
  { value: 'anarkalis', label: 'Contemporary Anarkalis', defaultCollection: 'Aura Monochrome' },
  { value: 'ready-to-wear', label: 'Ready To Wear', defaultCollection: 'Zehn Luxury Pret' },
  { value: 'accessories', label: 'Accessories & Fine Accents', defaultCollection: 'Heirloom Accents' },
];

const DEFAULT_SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
];

export const ProductEditorModal: React.FC<ProductEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}) => {
  const isEditing = Boolean(initialProduct);

  const [activeTab, setActiveTab] = useState<'details' | 'media' | 'variants' | 'craft'>('details');

  // Form State
  const [title, setTitle] = useState(initialProduct?.title || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [category, setCategory] = useState<string>(initialProduct?.category || 'bridal');
  const [categoryLabel, setCategoryLabel] = useState(initialProduct?.categoryLabel || 'Bridal Couture');
  const [collectionName, setCollectionName] = useState(initialProduct?.collectionName || 'Noor Heritage Capsule');
  const [basePriceInr, setBasePriceInr] = useState<number>(initialProduct?.basePriceInr || 125000);
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [fabricSpecs, setFabricSpecs] = useState(initialProduct?.fabricSpecs || 'Pure Raw Silk, Fine Tulle Dupatta, Cotton Silk Satin Lining');
  const [careInstructions, setCareInstructions] = useState(
    initialProduct?.careInstructions || 'Dry clean only by luxury textile specialists. Store in breathable muslin bag.'
  );

  // Flags
  const [isFeatured, setIsFeatured] = useState(initialProduct?.isFeatured ?? true);
  const [isNewArrival, setIsNewArrival] = useState(initialProduct?.isNewArrival ?? true);
  const [isBespokeAvailable, setIsBespokeAvailable] = useState(initialProduct?.isBespokeAvailable ?? true);

  // Craft details list
  const [craftDetails, setCraftDetails] = useState<string[]>(
    initialProduct?.craftDetails && initialProduct.craftDetails.length > 0
      ? initialProduct.craftDetails
      : [
          'Hand zardozi needlework and marodi cord craft',
          'Structured architectural flare with canvas can-can lining',
          'Handcrafted by master artisans across 250+ hours',
        ]
  );
  const [newCraftItem, setNewCraftItem] = useState('');

  // Images list
  const [images, setImages] = useState<string[]>(
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images
      : [DEFAULT_SAMPLE_IMAGES[0], DEFAULT_SAMPLE_IMAGES[1]]
  );
  const [newImageUrl, setNewImageUrl] = useState('');

  // Variants list
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialProduct?.variants && initialProduct.variants.length > 0
      ? initialProduct.variants
      : [
          { id: 'v-1', productId: '', sku: 'SNV-CUST-XS', size: 'XS', color: 'Ivory Gold', colorHex: '#F6F3EE', additionalPriceInr: 0, stockQuantity: 3, isActive: true },
          { id: 'v-2', productId: '', sku: 'SNV-CUST-S', size: 'S', color: 'Ivory Gold', colorHex: '#F6F3EE', additionalPriceInr: 0, stockQuantity: 5, isActive: true },
          { id: 'v-3', productId: '', sku: 'SNV-CUST-M', size: 'M', color: 'Ivory Gold', colorHex: '#F6F3EE', additionalPriceInr: 0, stockQuantity: 4, isActive: true },
          { id: 'v-4', productId: '', sku: 'SNV-CUST-L', size: 'L', color: 'Ivory Gold', colorHex: '#F6F3EE', additionalPriceInr: 0, stockQuantity: 2, isActive: true },
          { id: 'v-5', productId: '', sku: 'SNV-CUST-CUSTOM', size: 'Custom Measurement', color: 'Ivory Gold', colorHex: '#F6F3EE', additionalPriceInr: 10000, stockQuantity: 15, isActive: true },
        ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditing || !slug) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCategory(val);
    const catObj = CATEGORY_OPTIONS.find(c => c.value === val);
    if (catObj) {
      setCategoryLabel(catObj.label);
      if (!isEditing) {
        setCollectionName(catObj.defaultCollection);
      }
    }
  };

  // Add Craft Item
  const handleAddCraftItem = () => {
    if (!newCraftItem.trim()) return;
    setCraftDetails([...craftDetails, newCraftItem.trim()]);
    setNewCraftItem('');
  };

  const handleRemoveCraftItem = (index: number) => {
    setCraftDetails(craftDetails.filter((_, i) => i !== index));
  };

  // Add Image URL
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Variants helpers
  const handleAddVariant = () => {
    const newV: ProductVariant = {
      id: `var-${Date.now()}-${variants.length}`,
      productId: initialProduct?.id || '',
      sku: `SNV-${category.substring(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}-${variants.length + 1}`,
      size: 'M',
      color: variants[0]?.color || 'Antique Gold',
      colorHex: variants[0]?.colorHex || '#BFA36C',
      additionalPriceInr: 0,
      stockQuantity: 5,
      isActive: true,
    };
    setVariants([...variants, newV]);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const next = [...variants];
    next[index] = { ...next[index], [field]: value };
    setVariants(next);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      setErrorMsg('Product must have at least one variant/size.');
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Product title is required.');
      setActiveTab('details');
      return;
    }

    if (!slug.trim()) {
      setErrorMsg('Product URL slug is required.');
      setActiveTab('details');
      return;
    }

    if (basePriceInr <= 0) {
      setErrorMsg('Base price must be greater than 0 INR.');
      setActiveTab('details');
      return;
    }

    if (images.length === 0) {
      setErrorMsg('Please add at least one product showcase image URL.');
      setActiveTab('media');
      return;
    }

    if (variants.length === 0) {
      setErrorMsg('Please configure at least one variant / size.');
      setActiveTab('variants');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...(initialProduct?.id ? { id: initialProduct.id } : {}),
        title: title.trim(),
        slug: slug.trim(),
        category: category as any,
        categoryLabel: categoryLabel.trim(),
        collectionName: collectionName.trim(),
        basePriceInr: Number(basePriceInr),
        description: description.trim() || `${title} crafted with authentic Indian heritage techniques.`,
        fabricSpecs: fabricSpecs.trim(),
        careInstructions: careInstructions.trim(),
        craftDetails,
        images,
        isFeatured,
        isNewArrival,
        isBespokeAvailable,
        isSampleItem: false,
        variants,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save product. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-variant/50 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl rounded-none text-charcoal-text overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-6 bg-primary text-ivory-base flex items-center justify-between border-b border-antique-gold/30">
          <div>
            <span className="text-[10px] font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold block">
              {isEditing ? 'Couture Inventory Edit' : 'New Creation Studio'}
            </span>
            <h2 className="font-serif text-2xl text-ivory-base">
              {isEditing ? `Edit: ${initialProduct?.title}` : 'Add New Couture Garment'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ivory-base/70 hover:text-ivory-base hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-outline-variant/30 bg-surface-container-low px-6 text-xs font-sans font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'details'
                ? 'border-antique-gold text-primary font-semibold'
                : 'border-transparent text-charcoal-text/60 hover:text-charcoal-text'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>General & Pricing</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'media'
                ? 'border-antique-gold text-primary font-semibold'
                : 'border-transparent text-charcoal-text/60 hover:text-charcoal-text'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Lookbook Images ({images.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('variants')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'variants'
                ? 'border-antique-gold text-primary font-semibold'
                : 'border-transparent text-charcoal-text/60 hover:text-charcoal-text'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sizes & Stock ({variants.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('craft')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'craft'
                ? 'border-antique-gold text-primary font-semibold'
                : 'border-transparent text-charcoal-text/60 hover:text-charcoal-text'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Craft & Textiles ({craftDetails.length})</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs font-sans flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-sans">
          {/* TAB 1: DETAILS & PRICING */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-[11px] font-semibold tracking-wider uppercase text-charcoal-text">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="e.g. Ivory & Gold Hand-Embroidered Bridal Lehenga"
                    className="w-full p-3 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold tracking-wider uppercase text-charcoal-text">
                    URL Slug (Identifier) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="e.g. ivory-gold-hand-embroidered-bridal-lehenga"
                    className="w-full p-2.5 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold tracking-wider uppercase text-charcoal-text">
                    Base Price (INR ₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-charcoal-text/60 font-semibold">₹</span>
                    <input
                      type="number"
                      required
                      min={100}
                      step={500}
                      value={basePriceInr}
                      onChange={e => setBasePriceInr(Number(e.target.value))}
                      className="w-full pl-8 p-2.5 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold tracking-wider uppercase text-charcoal-text">
                    Couture Category
                  </label>
                  <select
                    value={category}
                    onChange={handleCategoryChange}
                    className="w-full p-2.5 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold tracking-wider uppercase text-charcoal-text">
                    Collection / Capsule Name
                  </label>
                  <input
                    type="text"
                    value={collectionName}
                    onChange={e => setCollectionName(e.target.value)}
                    placeholder="e.g. Noor Heritage Capsule, Gulab Regalia"
                    className="w-full p-2.5 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold tracking-wider uppercase text-charcoal-text">
                  Editorial Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Artisanal narrative, silhouette profile, embellishment context..."
                  className="w-full p-3 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none leading-relaxed"
                />
              </div>

              {/* Feature Switches */}
              <div className="p-4 bg-surface-container-low border border-outline-variant/30 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={e => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded-none"
                  />
                  <div>
                    <span className="font-semibold text-charcoal-text block">Featured Item</span>
                    <span className="text-[10px] text-charcoal-text/60">Highlighted on homepage</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={e => setIsNewArrival(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded-none"
                  />
                  <div>
                    <span className="font-semibold text-charcoal-text block">New Addition</span>
                    <span className="text-[10px] text-charcoal-text/60">Shows New badge</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBespokeAvailable}
                    onChange={e => setIsBespokeAvailable(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded-none"
                  />
                  <div>
                    <span className="font-semibold text-charcoal-text block">Made-To-Measure</span>
                    <span className="text-[10px] text-charcoal-text/60">Custom sizing input</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA & IMAGES */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-semibold tracking-wider uppercase text-charcoal-text mb-2">
                  Add Lookbook Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or hosted luxury CDN image"
                    className="flex-1 p-2.5 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2.5 bg-primary text-ivory-base font-semibold hover:bg-charcoal-text transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Image</span>
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-charcoal-text/60 items-center">
                  <span>Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => setImages([...images, DEFAULT_SAMPLE_IMAGES[0]])}
                    className="underline hover:text-antique-gold"
                  >
                    Preset Ivory Bride
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setImages([...images, DEFAULT_SAMPLE_IMAGES[1]])}
                    className="underline hover:text-antique-gold"
                  >
                    Preset Crimson Velvet
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setImages([...images, DEFAULT_SAMPLE_IMAGES[2]])}
                    className="underline hover:text-antique-gold"
                  >
                    Preset Gold Tissue Saree
                  </button>
                </div>
              </div>

              {/* Image Preview Grid */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-charcoal-text block">
                  Configured Product Gallery ({images.length})
                </span>
                {images.length === 0 ? (
                  <div className="p-8 text-center bg-surface-container-low border border-dashed border-outline-variant text-charcoal-text/60">
                    No images added yet. Add at least one image URL above.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-[3/4] bg-surface-container border border-outline-variant/60 overflow-hidden shadow-sm"
                      >
                        <img
                          src={imgUrl}
                          alt={`Product Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={e => {
                            (e.target as HTMLElement).setAttribute(
                              'src',
                              'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'
                            );
                          }}
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-mono">
                          {idx === 0 ? 'Primary' : `#${idx + 1}`}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: VARIANTS & SIZES */}
          {activeTab === 'variants' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-charcoal-text">Size Matrix & Inventory Units</h4>
                  <p className="text-[11px] text-charcoal-text/60">
                    Configure available sizes, color names, hex swatches, SKUs, and stock quantities.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-3.5 py-2 bg-primary text-ivory-base text-xs font-semibold hover:bg-charcoal-text transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Size / Variant</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-outline-variant/40 bg-surface-container-low">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container text-charcoal-text/70 uppercase text-[10px] tracking-wider border-b border-outline-variant/40">
                    <tr>
                      <th className="p-3">Size</th>
                      <th className="p-3">Color</th>
                      <th className="p-3">Color Hex</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">+ Price (INR)</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {variants.map((v, idx) => (
                      <tr key={v.id || idx} className="hover:bg-surface-container/40">
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={v.size}
                            onChange={e => handleUpdateVariant(idx, 'size', e.target.value)}
                            placeholder="XS, S, M, L, Custom"
                            className="w-24 p-1.5 bg-background border border-outline-variant focus:border-antique-gold text-xs"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={v.color}
                            onChange={e => handleUpdateVariant(idx, 'color', e.target.value)}
                            placeholder="Ivory Gold"
                            className="w-28 p-1.5 bg-background border border-outline-variant focus:border-antique-gold text-xs"
                          />
                        </td>
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={v.colorHex || '#F6F3EE'}
                              onChange={e => handleUpdateVariant(idx, 'colorHex', e.target.value)}
                              className="w-6 h-6 border-0 p-0 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={v.colorHex}
                              onChange={e => handleUpdateVariant(idx, 'colorHex', e.target.value)}
                              className="w-20 p-1.5 font-mono text-[11px] bg-background border border-outline-variant"
                            />
                          </div>
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={v.sku}
                            onChange={e => handleUpdateVariant(idx, 'sku', e.target.value)}
                            className="w-28 p-1.5 font-mono text-[11px] bg-background border border-outline-variant"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min={0}
                            value={v.stockQuantity}
                            onChange={e => handleUpdateVariant(idx, 'stockQuantity', Number(e.target.value))}
                            className="w-16 p-1.5 text-center font-semibold bg-background border border-outline-variant focus:border-antique-gold"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min={0}
                            step={500}
                            value={v.additionalPriceInr}
                            onChange={e =>
                              handleUpdateVariant(idx, 'additionalPriceInr', Number(e.target.value))
                            }
                            className="w-24 p-1.5 bg-background border border-outline-variant focus:border-antique-gold text-xs"
                          />
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
                            className="p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Variant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CRAFT & TEXTILES */}
          {activeTab === 'craft' && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold tracking-wider uppercase text-charcoal-text">
                  Fabric & Material Specifications
                </label>
                <input
                  type="text"
                  value={fabricSpecs}
                  onChange={e => setFabricSpecs(e.target.value)}
                  placeholder="e.g. Pure Raw Silk (100% Silk), Fine Nylon Tulle Dupattas, Cotton-Silk Satin Lining"
                  className="w-full p-2.5 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold tracking-wider uppercase text-charcoal-text">
                  Care & Preservation Guidelines
                </label>
                <input
                  type="text"
                  value={careInstructions}
                  onChange={e => setCareInstructions(e.target.value)}
                  placeholder="e.g. Professional dry clean only. Store in muslin bag away from direct heat."
                  className="w-full p-2.5 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none text-xs"
                />
              </div>

              {/* Craft Bullet Points */}
              <div className="space-y-3 pt-2">
                <label className="block text-[11px] font-semibold tracking-wider uppercase text-charcoal-text">
                  Artisanal Craft Details & Technique Bullets
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCraftItem}
                    onChange={e => setNewCraftItem(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCraftItem();
                      }
                    }}
                    placeholder="e.g. Micro-cutdana embroidery, 16-panel flared silhouette..."
                    className="flex-1 p-2.5 bg-background border border-outline-variant focus:border-antique-gold focus:outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCraftItem}
                    className="px-4 py-2.5 bg-surface-container border border-outline-variant text-charcoal-text hover:bg-surface-container-high font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-antique-gold" />
                    <span>Add Craft Spec</span>
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  {craftDetails.map((detail, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-surface-container-low border border-outline-variant/40 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 text-charcoal-text/90">
                        <Sparkles className="w-3.5 h-3.5 text-antique-gold flex-shrink-0" />
                        <span>{detail}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCraftItem(idx)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Remove spec"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-charcoal-text/60">
              * Changes sync immediately with the live storefront catalog and product search.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 border border-outline-variant bg-surface-container-low hover:bg-surface-container text-charcoal-text transition-colors w-full sm:w-auto text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-antique-gold text-primary font-semibold tracking-wider uppercase hover:bg-antique-gold-light transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <span>Saving Changes...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isEditing ? 'Update Product' : 'Publish Product'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
