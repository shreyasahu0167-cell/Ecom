import React from 'react';
import { DEMO_COLLECTIONS } from '../data/demoData';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CollectionsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CollectionsPage: React.FC<CollectionsPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-background min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold">
            Seasonal Lookbooks
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-charcoal-text font-normal">
            Couture Capsules
          </h1>
          <p className="font-sans text-xs sm:text-sm text-charcoal-text/75 leading-relaxed">
            Discover curated thematic collections capturing the essence of Indian textile heritage and contemporary silhouette architecture.
          </p>
        </div>

        {/* Collections Editorial Stack */}
        <div className="space-y-24">
          {DEMO_COLLECTIONS.map((col, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={col.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center border-b border-outline-variant/30 pb-20 last:border-b-0"
              >
                {/* Visual Area */}
                <div
                  className={`lg:col-span-7 ${
                    isEven ? 'lg:order-1' : 'lg:order-2'
                  } relative overflow-hidden group`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden border border-outline-variant/40 shadow-sm bg-surface-container-high">
                    <img
                      src={col.image}
                      alt={col.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-primary/85 backdrop-blur-md text-ivory-base text-[10px] font-sans px-3 py-1 uppercase tracking-widest">
                      Capsule {index + 1}
                    </div>
                  </div>
                </div>

                {/* Narrative Area */}
                <div
                  className={`lg:col-span-5 ${
                    isEven ? 'lg:order-2' : 'lg:order-1'
                  } space-y-6`}
                >
                  <span className="text-xs font-sans tracking-[0.25em] text-antique-gold uppercase font-semibold">
                    {col.subtitle}
                  </span>

                  <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-text leading-tight">
                    {col.title}
                  </h2>

                  <p className="font-sans text-xs sm:text-sm text-charcoal-text/80 leading-relaxed font-light">
                    {col.description}
                  </p>

                  <div className="pt-2 flex items-center gap-4 text-xs font-sans text-charcoal-text/70">
                    <span className="flex items-center gap-1.5 text-antique-gold font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{col.itemCount} Curated Masterpieces</span>
                    </span>
                    <span>•</span>
                    <span>Pure Silk & Handlooms</span>
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <button
                      onClick={() => onNavigate('shop')}
                      className="px-6 py-3.5 bg-primary text-ivory-base font-sans text-xs font-semibold tracking-[0.2em] uppercase hover:bg-charcoal-text transition-all duration-300 flex items-center gap-2 group shadow-sm"
                    >
                      <span>Explore Ensembles</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                    <button
                      onClick={() => onNavigate('visit-store')}
                      className="px-6 py-3.5 bg-transparent border border-outline-variant/60 text-charcoal-text font-sans text-xs font-medium tracking-[0.16em] uppercase hover:bg-surface-container transition-colors"
                    >
                      Atelier Inquiry
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
