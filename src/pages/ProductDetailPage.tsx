import React, { useState, useEffect } from 'react';
import { Product, ProductVariant, ProductSize } from '../types';
import { fetchProductBySlug, fetchAllProducts } from '../services/productService';
import { formatInr } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/common/ProductCard';
import {
  Heart,
  ShoppingBag,
  Sparkles,
  Scissors,
  Truck,
  RotateCcw,
  Check,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (page: string, params?: any) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, onNavigate }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'craft' | 'fabric' | 'sizing' | 'care'>('craft');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customMeasurements, setCustomMeasurements] = useState({
    bust: '',
    waist: '',
    hip: '',
    shoulder: '',
    length: '',
    notes: '',
  });
  const [showCustomModal, setShowCustomModal] = useState(false);

  const { addToCart, isInWishlist, toggleWishlist } = useCart();

  useEffect(() => {
    async function loadProduct() {
      try {
        setIsLoading(true);
        const data = await fetchProductBySlug(slug);
        if (!data) {
          setError(`Product '${slug}' not found.`);
          return;
        }
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          const firstInStock = data.variants.find(v => v.stockQuantity > 0) || data.variants[0];
          setSelectedVariant(firstInStock);
        }
        // Load related products
        const all = await fetchAllProducts(data.category);
        setRelatedProducts(all.filter(p => p.id !== data.id).slice(0, 3));
      } catch (err: any) {
        setError(err.message || 'Failed to load product details.');
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-24 text-center bg-background min-h-screen flex items-center justify-center">
        <div className="space-y-3">
          <div className="w-8 h-8 border-2 border-antique-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-charcoal-text text-lg">Unfolding Ensemble Details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-24 max-w-lg mx-auto text-center px-4 bg-background min-h-screen space-y-4">
        <h2 className="font-serif text-3xl text-charcoal-text">Ensemble Not Found</h2>
        <p className="font-sans text-xs text-charcoal-text/70">{error || 'The requested product could not be loaded.'}</p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-3 bg-primary text-ivory-base text-xs font-sans tracking-widest uppercase hover:bg-charcoal-text"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const currentPriceInr = product.basePriceInr + (selectedVariant?.additionalPriceInr || 0);
  const isCustomSize = selectedVariant?.size === 'Custom Measurement';
  const isOutOfStock = !selectedVariant || selectedVariant.stockQuantity <= 0;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart({
      variantId: selectedVariant.id,
      productId: product.id,
      title: product.title,
      categoryLabel: product.categoryLabel,
      sku: selectedVariant.sku,
      size: selectedVariant.size,
      color: selectedVariant.color,
      image: product.images[0] || '',
      unitPriceInr: currentPriceInr,
      quantity,
      stockAvailable: selectedVariant.stockQuantity,
      customMeasurements: isCustomSize ? customMeasurements : undefined,
    });
  };

  return (
    <div className="bg-background min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs font-sans text-charcoal-text/60 mb-8 overflow-x-auto">
          <button onClick={() => onNavigate('home')} className="hover:text-primary">
            Home
          </button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => onNavigate('shop')} className="hover:text-primary">
            Shop
          </button>
          <ChevronRight className="w-3 h-3" />
          <button
            onClick={() => onNavigate('shop', { category: product.category })}
            className="hover:text-primary capitalize"
          >
            {product.categoryLabel}
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-charcoal-text font-medium truncate">{product.title}</span>
        </nav>

        {/* Main Grid: Gallery (7 cols) + Details (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Gallery Area */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Preview Image */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-container-high border border-outline-variant/40 shadow-sm">
              <img
                src={product.images[selectedImageIndex] || product.images[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85'}
                alt={product.title}
                className="w-full h-full object-cover object-top transition-all duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85';
                }}
              />

              {/* Sample Tag */}
              {product.isSampleItem && (
                <div className="absolute top-4 left-4 bg-charcoal-text/90 backdrop-blur-md text-ivory-base text-[10px] font-sans px-3 py-1 uppercase tracking-widest">
                  Sample Item
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-24 flex-shrink-0 border-2 overflow-hidden bg-surface-container transition-all ${
                      selectedImageIndex === idx
                        ? 'border-antique-gold ring-1 ring-antique-gold'
                        : 'border-outline-variant/40 hover:border-charcoal-text'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Angle ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Specifications & Purchasing Controls */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header Details */}
            <div className="border-b border-outline-variant/30 pb-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans tracking-[0.2em] text-antique-gold uppercase font-semibold">
                  {product.collectionName || product.categoryLabel}
                </span>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="p-2 text-charcoal-text hover:text-deep-rose transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isWishlisted ? 'fill-deep-rose text-deep-rose' : ''
                    }`}
                  />
                </button>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-text leading-tight">
                {product.title}
              </h1>

              {/* Price in INR */}
              <div className="pt-2 flex items-baseline gap-3">
                <span className="font-serif text-2xl sm:text-3xl text-charcoal-text font-normal">
                  {formatInr(currentPriceInr)}
                </span>
                <span className="text-xs font-sans text-charcoal-text/60">
                  (Inclusive of luxury textile specifications)
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="font-sans text-xs sm:text-sm text-charcoal-text/80 leading-relaxed">
              {product.description}
            </p>

            {/* Color Variant Selector */}
            {product.variants.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-sans font-semibold tracking-wider text-charcoal-text uppercase flex items-center justify-between">
                  <span>Color Option:</span>
                  <span className="font-normal text-antique-gold">
                    {selectedVariant?.color || 'Standard'}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(product.variants.map(v => v.color))).map(col => {
                    const variantForCol = product.variants.find(v => v.color === col);
                    const isSelected = selectedVariant?.color === col;
                    return (
                      <button
                        key={col}
                        onClick={() => {
                          if (variantForCol) setSelectedVariant(variantForCol);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-sans border transition-all ${
                          isSelected
                            ? 'border-primary bg-surface-container-high font-semibold'
                            : 'border-outline-variant/50 hover:border-charcoal-text bg-surface-container-low'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-charcoal-text/20"
                          style={{ backgroundColor: variantForCol?.colorHex || '#3D352E' }}
                        />
                        <span>{col}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Variant Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-sans">
                <label className="font-semibold tracking-wider text-charcoal-text uppercase">
                  Select Size:
                </label>
                <button
                  onClick={() => setActiveTab('sizing')}
                  className="text-antique-gold hover:underline"
                >
                  Size & Fitting Guide
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {product.variants.map(variant => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const inStock = variant.stockQuantity > 0;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariant(variant);
                        if (variant.size === 'Custom Measurement') {
                          setShowCustomModal(true);
                        }
                      }}
                      className={`py-2.5 px-3 text-xs font-sans text-center border transition-all ${
                        isSelected
                          ? 'border-primary bg-primary text-ivory-base font-semibold shadow-sm'
                          : inStock
                          ? 'border-outline-variant/50 bg-surface-container-low text-charcoal-text hover:border-charcoal-text'
                          : 'border-outline-variant/30 text-charcoal-text/40 bg-surface-container-highest line-through'
                      }`}
                    >
                      <div className="leading-tight">
                        {variant.size === 'Custom Measurement' ? 'Custom Fit' : variant.size}
                      </div>
                      {variant.additionalPriceInr > 0 && (
                        <div className="text-[10px] text-antique-gold mt-0.5">
                          +{formatInr(variant.additionalPriceInr)}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* SKU & Stock Info */}
              {selectedVariant && (
                <div className="flex items-center justify-between text-[11px] font-sans text-charcoal-text/70 pt-1">
                  <span>SKU: <span className="font-mono">{selectedVariant.sku}</span></span>
                  <span>
                    {selectedVariant.stockQuantity > 0 ? (
                      <span className="text-emerald-800 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        In Stock ({selectedVariant.stockQuantity} ready to dispatch)
                      </span>
                    ) : (
                      <span className="text-deep-rose font-medium">Made to Order (4-6 weeks)</span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Custom Measurement Form Modal */}
            {isCustomSize && (
              <div className="p-4 bg-surface-container-low border border-antique-gold/40 space-y-3 text-xs font-sans">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-antique-gold font-semibold">
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Custom Tailoring Specifications</span>
                  </div>
                  <span className="text-[10px] text-charcoal-text/60">Optional in inches</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase text-charcoal-text/70">Bust (in)</label>
                    <input
                      type="text"
                      placeholder="e.g. 34"
                      value={customMeasurements.bust}
                      onChange={e => setCustomMeasurements({ ...customMeasurements, bust: e.target.value })}
                      className="w-full bg-background border border-outline-variant/50 p-1.5 text-xs focus:outline-none focus:border-antique-gold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-charcoal-text/70">Waist (in)</label>
                    <input
                      type="text"
                      placeholder="e.g. 28"
                      value={customMeasurements.waist}
                      onChange={e => setCustomMeasurements({ ...customMeasurements, waist: e.target.value })}
                      className="w-full bg-background border border-outline-variant/50 p-1.5 text-xs focus:outline-none focus:border-antique-gold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-charcoal-text/70">Hip (in)</label>
                    <input
                      type="text"
                      placeholder="e.g. 38"
                      value={customMeasurements.hip}
                      onChange={e => setCustomMeasurements({ ...customMeasurements, hip: e.target.value })}
                      className="w-full bg-background border border-outline-variant/50 p-1.5 text-xs focus:outline-none focus:border-antique-gold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-charcoal-text/70">Blouse Length (in)</label>
                    <input
                      type="text"
                      placeholder="e.g. 14"
                      value={customMeasurements.length}
                      onChange={e => setCustomMeasurements({ ...customMeasurements, length: e.target.value })}
                      className="w-full bg-background border border-outline-variant/50 p-1.5 text-xs focus:outline-none focus:border-antique-gold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-outline-variant/30">
              <div className="flex gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-outline-variant/50 bg-surface-container-low">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-3 text-charcoal-text hover:bg-surface-container"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-sans font-medium text-charcoal-text">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={selectedVariant ? quantity >= selectedVariant.stockQuantity : true}
                    className="px-3 py-3 text-charcoal-text hover:bg-surface-container disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 py-3.5 bg-primary text-ivory-base font-sans text-xs font-semibold tracking-[0.2em] uppercase hover:bg-charcoal-text transition-all duration-300 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Sold Out' : 'Add to Shopping Bag'}</span>
                </button>
              </div>

              {/* Atelier Viewing CTA */}
              <button
                onClick={() => onNavigate('visit-store')}
                className="w-full py-3 bg-transparent border border-outline-variant/70 text-charcoal-text font-sans text-xs font-medium tracking-[0.16em] uppercase hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5 text-antique-gold" />
                <span>Book Atelier Consultation for This Piece</span>
              </button>
            </div>

            {/* Specification Tabs */}
            <div className="pt-6 border-t border-outline-variant/30 space-y-4">
              <div className="flex border-b border-outline-variant/30 text-xs font-sans">
                {[
                  { id: 'craft', label: 'Craft & Work' },
                  { id: 'fabric', label: 'Fabric Composition' },
                  { id: 'sizing', label: 'Sizing Guide' },
                  { id: 'care', label: 'Care & Delivery' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-2.5 px-3 tracking-wider uppercase font-medium transition-colors relative ${
                      activeTab === tab.id
                        ? 'text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-antique-gold'
                        : 'text-charcoal-text/60 hover:text-charcoal-text'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="text-xs font-sans text-charcoal-text/80 leading-relaxed min-h-[90px]">
                {activeTab === 'craft' && (
                  <ul className="space-y-1.5 list-disc list-inside">
                    {product.craftDetails.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                )}
                {activeTab === 'fabric' && (
                  <p>{product.fabricSpecs || 'Pure Indian luxury silk with premium lining.'}</p>
                )}
                {activeTab === 'sizing' && (
                  <div className="space-y-2">
                    <p>Standard Couture Sizing Chart (in inches):</p>
                    <p className="text-[11px] text-charcoal-text/70">
                      XS (Bust 32, Waist 26) • S (Bust 34, Waist 28) • M (Bust 36, Waist 30) • L (Bust 38, Waist 32) • XL (Bust 40, Waist 34)
                    </p>
                    <p className="text-[11px] text-antique-gold font-medium">
                      Select 'Custom Fit' for tailor-made personalization.
                    </p>
                  </div>
                )}
                {activeTab === 'care' && (
                  <div className="space-y-2">
                    <p>{product.careInstructions}</p>
                    <p className="text-[11px] text-charcoal-text/70 italic">
                      [Sample Policy Notice]: Standard made-to-order timeline is 4-6 weeks with complimentary insured shipping across India.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Ensembles */}
        {relatedProducts.length > 0 && (
          <div className="mt-28 border-t border-outline-variant/30 pt-16">
            <div className="text-center mb-12 space-y-2">
              <span className="text-xs font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold">
                Harmonious Pairings
              </span>
              <h2 className="font-serif text-3xl text-charcoal-text">
                Complete Your Couture Ensemble
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map(rel => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  onSelectProduct={(newSlug) => onNavigate('product-detail', { slug: newSlug })}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
