import React from 'react';
import { Sparkles, Scissors, Feather, Compass, ArrowRight } from 'lucide-react';

interface StoryPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const StoryPage: React.FC<StoryPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-background min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* 1. Header & Vision Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container border border-outline-variant/40 text-antique-gold text-xs font-sans tracking-[0.25em] uppercase font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Heritage × Modern Restraint</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl text-charcoal-text font-normal leading-tight">
            Craftsmanship Rooted in Time, Sculpted for Today.
          </h1>

          <p className="font-sans text-xs sm:text-sm text-charcoal-text/80 leading-relaxed font-light">
            Saanvya was conceived to celebrate the dialogue between traditional Indian textile arts and refined contemporary tailoring.
          </p>
        </div>

        {/* 2. Split Editorial Visual & Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] overflow-hidden border border-outline-variant/40 bg-surface-container-high shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85"
                alt="Artisanal Embroidery"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80';
                }}
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 text-charcoal-text/80 font-sans text-xs sm:text-sm leading-relaxed">
            <span className="text-xs font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold block">
              Ethos & Philosophy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-text leading-tight">
              Preserving the Hand of the Master Weaver.
            </h2>
            <p>
              In an era of fast fashion, true couture lies in patience. Every fold of our raw silk, every thread of electroplated silver zari, and every delicate needle puncture reflects the dedication of master artisans.
            </p>
            <p>
              We prioritize pure natural silks, sustainable vegetable dyes where applicable, and architectural cuts that ensure the garment moves with effortless grace.
            </p>

            <div className="pt-4 grid grid-cols-2 gap-4 border-t border-outline-variant/30 text-xs">
              <div>
                <span className="font-serif text-2xl text-antique-gold block">100%</span>
                <span className="text-charcoal-text/70 text-[11px]">Pure Silk Foundations</span>
              </div>
              <div>
                <span className="font-serif text-2xl text-antique-gold block">300+ hrs</span>
                <span className="text-charcoal-text/70 text-[11px]">Average Bridal Handwork</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Three Pillars of the Atelier */}
        <div className="border-y border-outline-variant/30 py-16">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold">
              The Three Pillars
            </span>
            <h2 className="font-serif text-3xl text-charcoal-text">The Creative Journey</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-surface-container-low border border-outline-variant/30 space-y-3">
              <Compass className="w-6 h-6 text-antique-gold mb-2" />
              <h3 className="font-serif text-xl text-charcoal-text">1. Textile Provenance</h3>
              <p className="font-sans text-xs text-charcoal-text/70 leading-relaxed">
                Sourcing directly from handloom clusters across Varanasi, Kanchipuram, and Chanderi to sustain traditional pit-loom weaving legacies.
              </p>
            </div>

            <div className="p-8 bg-surface-container-low border border-outline-variant/30 space-y-3">
              <Feather className="w-6 h-6 text-antique-gold mb-2" />
              <h3 className="font-serif text-xl text-charcoal-text">2. Zardozi & Needlecraft</h3>
              <p className="font-sans text-xs text-charcoal-text/70 leading-relaxed">
                Micro-bead cutdana, French knots, and antiqued metallic threads applied with microscopic precision by generation-trained craftsmen.
              </p>
            </div>

            <div className="p-8 bg-surface-container-low border border-outline-variant/30 space-y-3">
              <Scissors className="w-6 h-6 text-antique-gold mb-2" />
              <h3 className="font-serif text-xl text-charcoal-text">3. Tailoring Calibration</h3>
              <p className="font-sans text-xs text-charcoal-text/70 leading-relaxed">
                Structural internal corsetry and multi-layered canvas can-can linings designed for supreme comfort and balanced drape flow.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Atelier Invitation */}
        <div className="bg-primary text-ivory-base p-10 sm:p-16 border border-antique-gold/30 text-center space-y-6 max-w-4xl mx-auto">
          <span className="text-xs font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold block">
            Experience in Person
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-ivory-base">
            Visit Our Private Atelier
          </h2>
          <p className="font-sans text-xs sm:text-sm text-ivory-base/80 max-w-xl mx-auto leading-relaxed">
            Reserve a dedicated 1-on-1 consultation with our senior designers to touch our handloom archives and custom-fit your dream ensemble.
          </p>
          <button
            onClick={() => onNavigate('visit-store')}
            className="px-8 py-3.5 bg-antique-gold text-primary font-sans text-xs font-semibold tracking-[0.2em] uppercase hover:bg-antique-gold-light transition-colors inline-flex items-center gap-2"
          >
            <span>Book Private Viewing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
