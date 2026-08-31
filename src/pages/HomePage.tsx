import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { fetchAllProducts } from '../services/productService';
import { ProductCard } from '../components/common/ProductCard';
import { DEMO_COLLECTIONS } from '../data/demoData';
import { ArrowRight, Sparkles, Compass, Scissors, Award, Calendar, CheckCircle2 } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(false);
        const prods = await fetchAllProducts();
        setFeaturedProducts(prods);
      } catch (err: any) {
        setFetchError(err.message || 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="bg-background min-h-screen">
      {/* 1. HERO SECTION (Editorial Fashion Cover) */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-surface-container-highest overflow-hidden border-b border-outline-variant/30">
        {/* Background Image with tonal gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=2000&q=85"
            alt="Saanvya Couture Hero"
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-primary/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-left w-full">
          <div className="max-w-2xl text-ivory-base space-y-6 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-ivory-base/10 backdrop-blur-md border border-ivory-base/20 text-antique-gold text-xs font-sans tracking-[0.25em] uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autumn / Festive Couture Capsule</span>
            </div>

            <h1 className="font-serif text-5xl sm:text-7xl font-normal leading-[1.08] tracking-tight text-ivory-base">
              The Architecture of Indian Grandeur.
            </h1>

            <p className="font-sans text-sm sm:text-base text-ivory-base/85 leading-relaxed max-w-xl font-light">
              Hand-embroidered bridal silhouettes, liquid organzas, and heirloom textiles woven for contemporary celebrations.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('shop')}
                className="px-8 py-4 bg-antique-gold text-primary font-sans text-xs font-semibold tracking-[0.2em] uppercase hover:bg-antique-gold-light transition-all duration-300 shadow-md flex items-center gap-2 group"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onNavigate('visit-store')}
                className="px-8 py-4 bg-transparent border border-ivory-base/60 text-ivory-base font-sans text-xs font-medium tracking-[0.2em] uppercase hover:bg-ivory-base hover:text-primary transition-all duration-300 backdrop-blur-sm"
              >
                Book Atelier Viewing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CURATED CAPSULES / COLLECTIONS STRIP */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-outline-variant/30 pb-6 gap-4">
          <div>
            <span className="text-xs font-sans tracking-[0.25em] text-antique-gold uppercase block mb-2 font-semibold">
              Curated Capsules
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-text">
              Seasonal Couture Edit
            </h2>
          </div>
          <button
            onClick={() => onNavigate('collections')}
            className="text-xs font-sans tracking-[0.18em] uppercase text-charcoal-text hover:text-antique-gold transition-colors flex items-center gap-1.5 font-medium underline underline-offset-4"
          >
            <span>View All Lookbooks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DEMO_COLLECTIONS.map((col) => (
            <div
              key={col.id}
              onClick={() => onNavigate('collections')}
              className="group cursor-pointer relative overflow-hidden bg-surface-container-high border border-outline-variant/30 flex flex-col"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-text/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-6 left-6 right-6 text-ivory-base">
                  <span className="text-[10px] font-sans tracking-widest text-antique-gold uppercase block mb-1">
                    Capsule Showcase
                  </span>
                  <h3 className="font-serif text-2xl mb-1 leading-snug">
                    {col.title}
                  </h3>
                  <p className="font-sans text-xs text-ivory-base/80 font-light line-clamp-1">
                    {col.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SIGNATURE BRIDAL ATELIER (Full-bleed split editorial) */}
      <section className="py-20 bg-surface-container-low border-y border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Image (7 cols) */}
            <div className="lg:col-span-7 relative">
              <div className="relative aspect-[16/10] overflow-hidden border border-outline-variant/40 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=85"
                  alt="Bridal Couture Fitting"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                <div className="absolute top-4 left-4 bg-charcoal-text/85 backdrop-blur-sm text-ivory-base text-[10px] font-sans px-3 py-1 uppercase tracking-widest">
                  Atelier Craftsmanship (Sample)
                </div>
              </div>
            </div>

            {/* Right Text (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-sans tracking-[0.25em] text-antique-gold uppercase block font-semibold">
                Bespoke Bridal Suite
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-charcoal-text leading-tight">
                Handcrafted for Your Special Day.
              </h2>
              <p className="font-sans text-xs sm:text-sm text-charcoal-text/80 leading-relaxed">
                Every bridal silhouette undergoes hundreds of hours of delicate zardozi needlework, custom silhouette calibration, and individual canvas shaping.
              </p>

              <div className="space-y-3 pt-2 text-xs font-sans text-charcoal-text/90">
                <div className="flex items-center gap-3">
                  <Scissors className="w-4 h-4 text-antique-gold flex-shrink-0" />
                  <span>Custom measurements & personalized drape adjustments</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-antique-gold flex-shrink-0" />
                  <span>Private 1-on-1 stylist consultation at our atelier</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-antique-gold flex-shrink-0" />
                  <span>Prices exclusively in INR (₹) with insured logistics</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onNavigate('visit-store')}
                  className="px-8 py-3.5 bg-primary text-ivory-base font-sans text-xs font-semibold tracking-[0.2em] uppercase hover:bg-charcoal-text transition-all duration-300 shadow-sm"
                >
                  Schedule Bridal Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED COUTURE CATALOG GRID */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold">
            Artisanal Repertoire
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-text">
            Featured Couture Pieces
          </h2>
          <p className="font-sans text-xs text-charcoal-text/70">
            Select an ensemble to view variant sizes, fabric specifications, and custom measurement options.
          </p>
        </div>

        {fetchError ? (
          <div className="p-8 text-center bg-error/10 border border-error/20 text-error text-sm font-sans max-w-md mx-auto">
            {fetchError}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {featuredProducts.slice(0, 6).map(prod => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelectProduct={(slug) => onNavigate('product-detail', { slug })}
              />
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <button
            onClick={() => onNavigate('shop')}
            className="px-10 py-4 bg-transparent border border-charcoal-text text-charcoal-text font-sans text-xs font-semibold tracking-[0.2em] uppercase hover:bg-charcoal-text hover:text-ivory-base transition-all duration-300"
          >
            Explore Complete Collection
          </button>
        </div>
      </section>

      {/* 5. CRAFT ETHOS & ATELIER VALUES */}
      <section className="py-20 bg-primary text-ivory-base border-t border-antique-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold">
              The Pillar of Our Craft
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-ivory-base">
              Conscious Luxury & Textile Preservation
            </h2>
            <p className="font-sans text-xs text-ivory-base/70">
              Grounded in ethical artisan collaborations and architectural silhouettes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="p-8 bg-primary-container/40 border border-ivory-base/10 space-y-3">
              <Compass className="w-6 h-6 text-antique-gold mb-2" />
              <h3 className="font-serif text-xl text-ivory-base">Heritage Handlooms</h3>
              <p className="font-sans text-xs text-ivory-base/70 leading-relaxed">
                Genuine pit-loom mulberry silks, Kanchipuram zari, and pure Chanderi textiles crafted without industrial synthetic blends.
              </p>
            </div>

            <div className="p-8 bg-primary-container/40 border border-ivory-base/10 space-y-3">
              <Scissors className="w-6 h-6 text-antique-gold mb-2" />
              <h3 className="font-serif text-xl text-ivory-base">Bespoke Fit Precision</h3>
              <p className="font-sans text-xs text-ivory-base/70 leading-relaxed">
                Individual body mapping and custom measurements ensure sculpted comfort and balanced weight distribution for long festive hours.
              </p>
            </div>

            <div className="p-8 bg-primary-container/40 border border-ivory-base/10 space-y-3">
              <Award className="w-6 h-6 text-antique-gold mb-2" />
              <h3 className="font-serif text-xl text-ivory-base">Transparent Pricing (INR)</h3>
              <p className="font-sans text-xs text-ivory-base/70 leading-relaxed">
                Complete clarity in pricing with zero hidden duties or fabricated markups, strictly adhering to authentic Indian haute couture standards.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
