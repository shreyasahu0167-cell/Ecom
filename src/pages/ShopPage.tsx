import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../types';
import { fetchAllProducts } from '../services/productService';
import { ProductCard } from '../components/common/ProductCard';
import { useCart } from '../context/CartContext';
import { Filter, X, SlidersHorizontal, ArrowUpDown, Sparkles } from 'lucide-react';

interface ShopPageProps {
  initialCategory?: string;
  initialSearch?: string;
  filterWishlistOnly?: boolean;
  onNavigate: (page: string, params?: any) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategory = 'all',
  initialSearch = '',
  filterWishlistOnly = false,
  onNavigate,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const { wishlist } = useCart();

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await fetchAllProducts();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Update if props change
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialSearch) setSearchQuery(initialSearch);
  }, [initialCategory, initialSearch]);

  const categories = [
    { id: 'all', label: 'All Silhouettes' },
    { id: 'bridal', label: 'Bridal Couture' },
    { id: 'lehengas', label: 'Occasion Lehengas' },
    { id: 'sarees', label: 'Artisanal Sarees' },
    { id: 'anarkalis', label: 'Contemporary Anarkalis' },
    { id: 'ready-to-wear', label: 'Luxury Pret' },
    { id: 'accessories', label: 'Fine Accessories' },
  ];

  const sizes = ['all', 'XS', 'S', 'M', 'L', 'XL', 'Custom Measurement'];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Wishlist Only Filter
      if (filterWishlistOnly && !wishlist.includes(product.id)) {
        return false;
      }

      // Category Filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Size Filter
      if (selectedSize !== 'all') {
        const hasSize = product.variants.some(
          (v) => v.size === selectedSize && v.stockQuantity > 0
        );
        if (!hasSize) return false;
      }

      // Price Range Filter
      if (priceRange === 'under-50k' && product.basePriceInr >= 50000) return false;
      if (
        priceRange === '50k-100k' &&
        (product.basePriceInr < 50000 || product.basePriceInr > 100000)
      )
        return false;
      if (priceRange === 'above-100k' && product.basePriceInr <= 100000) return false;

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesCategory = (product.categoryLabel || product.category).toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCategory) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.basePriceInr - b.basePriceInr;
      if (sortBy === 'price-high') return b.basePriceInr - a.basePriceInr;
      if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [
    products,
    selectedCategory,
    selectedSize,
    priceRange,
    sortBy,
    searchQuery,
    filterWishlistOnly,
    wishlist,
  ]);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSize('all');
    setPriceRange('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedSize !== 'all' ||
    priceRange !== 'all' ||
    Boolean(searchQuery);

  return (
    <div className="bg-background min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 text-center border-b border-outline-variant/30 pb-8 space-y-3">
          <span className="text-xs font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold">
            {filterWishlistOnly ? 'Personal Wishlist' : 'Haute Couture Catalog'}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal-text font-normal">
            {filterWishlistOnly ? 'Saved Ensembles' : 'The Saanvya Collection'}
          </h1>
          <p className="font-sans text-xs sm:text-sm text-charcoal-text/70 max-w-xl mx-auto">
            [Sample Catalog]: Hand-embroidered bridal wear, handloom silks, and contemporary evening ensembles. All prices in Indian Rupees (INR ₹).
          </p>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-8 space-x-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs font-sans tracking-[0.14em] uppercase whitespace-nowrap transition-all duration-200 border ${
                selectedCategory === cat.id
                  ? 'bg-primary text-ivory-base border-primary font-medium shadow-sm'
                  : 'bg-surface-container-low text-charcoal-text/80 border-outline-variant/40 hover:border-charcoal-text'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filter Controls & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 bg-surface-container-low border border-outline-variant/30 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 text-xs font-sans text-charcoal-text px-3 py-1.5 border border-outline-variant/50"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters ({filteredProducts.length})</span>
            </button>

            <span className="text-xs font-sans text-charcoal-text/70 hidden sm:inline">
              Showing <span className="font-semibold text-charcoal-text">{filteredProducts.length}</span> pieces
            </span>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-sans text-deep-rose hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-outline" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-sans text-charcoal-text border border-outline-variant/40 px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="featured">Sort: Curated Editorial</option>
              <option value="newest">Sort: New Additions</option>
              <option value="price-low">Price: Low to High (INR)</option>
              <option value="price-high">Price: High to Low (INR)</option>
            </select>
          </div>
        </div>

        {/* Main Content Layout (Sidebar + Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Filter Sidebar (3 cols) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8 pr-6 border-r border-outline-variant/30 text-xs font-sans">
            {/* Price Filter */}
            <div>
              <h4 className="font-serif text-base text-charcoal-text mb-3 tracking-wide">
                Price (INR ₹)
              </h4>
              <div className="space-y-2 text-charcoal-text/80">
                {[
                  { id: 'all', label: 'All Price Ranges' },
                  { id: 'under-50k', label: 'Under ₹50,000' },
                  { id: '50k-100k', label: '₹50,000 – ₹1,00,000' },
                  { id: 'above-100k', label: '₹1,00,000 & Above' },
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="price-filter"
                      checked={priceRange === item.id}
                      onChange={() => setPriceRange(item.id)}
                      className="accent-primary"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div>
              <h4 className="font-serif text-base text-charcoal-text mb-3 tracking-wide">
                Size & Fit
              </h4>
              <div className="flex flex-wrap gap-2">
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3 py-1.5 text-[11px] border transition-all ${
                      selectedSize === sz
                        ? 'border-primary bg-primary text-ivory-base font-semibold'
                        : 'border-outline-variant/40 bg-surface-container-low text-charcoal-text hover:border-charcoal-text'
                    }`}
                  >
                    {sz === 'all' ? 'All Sizes' : sz === 'Custom Measurement' ? 'Custom' : sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Atelier Bespoke Notice */}
            <div className="p-4 bg-surface-container border border-antique-gold/30 space-y-2">
              <div className="flex items-center gap-1.5 text-antique-gold font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Made-To-Order Couture</span>
              </div>
              <p className="text-[11px] text-charcoal-text/70 leading-relaxed">
                Need customized sleeve lengths, sweetheart neckline alterations, or bespoke bridal colorways? Schedule an atelier consultation.
              </p>
              <button
                onClick={() => onNavigate('visit-store')}
                className="text-[11px] text-primary font-semibold underline underline-offset-2"
              >
                Request Custom Silhouette →
              </button>
            </div>
          </aside>

          {/* Product Grid (9 cols) */}
          <main className="lg:col-span-9">
            {error && (
              <div className="p-6 bg-error/10 border border-error/20 text-error text-sm font-sans mb-8">
                {error}
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-surface-container-low border border-outline-variant/30 p-8 space-y-4">
                <SlidersHorizontal className="w-10 h-10 text-outline mx-auto stroke-1" />
                <h3 className="font-serif text-2xl text-charcoal-text">
                  No matching ensembles found
                </h3>
                <p className="font-sans text-xs text-charcoal-text/70 max-w-sm mx-auto">
                  Try adjusting your category, size, or price filter parameters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-primary text-ivory-base text-xs font-sans tracking-widest uppercase hover:bg-charcoal-text"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onSelectProduct={(slug) => onNavigate('product-detail', { slug })}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
