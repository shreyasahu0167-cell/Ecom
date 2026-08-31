import React, { useState } from 'react';
import { Product } from '../../types';
import { formatInr } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (slug: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isInWishlist, toggleWishlist } = useCart();
  const isWishlisted = isInWishlist(product.id);

  const primaryImage = product.images[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80';
  const secondaryImage = product.images[1] || primaryImage;

  const inStockVariants = product.variants.filter(v => v.stockQuantity > 0);
  const isSoldOut = inStockVariants.length === 0;

  return (
    <div
      className="group relative flex flex-col cursor-pointer bg-background transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelectProduct(product.slug)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-container-high border border-outline-variant/30">
        <img
          src={isHovered ? secondaryImage : primaryImage}
          alt={product.title}
          className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== primaryImage) {
              target.src = primaryImage;
            } else {
              target.src = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80';
            }
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNewArrival && (
            <span className="bg-antique-gold text-primary text-[10px] font-sans font-semibold px-2 py-0.5 tracking-wider uppercase">
              New Addition
            </span>
          )}
          {isSoldOut && (
            <span className="bg-deep-rose text-white text-[10px] font-sans font-medium px-2 py-0.5 tracking-wider uppercase">
              Made to Order Only
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          aria-label="Add to wishlist"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-ivory-base/80 backdrop-blur-md text-charcoal-text hover:text-deep-rose hover:bg-ivory-base transition-all duration-200 shadow-sm"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-deep-rose text-deep-rose' : ''
            }`}
          />
        </button>

        {/* Hover Quick Sizes Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-charcoal-text/80 via-charcoal-text/40 to-transparent opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-between text-ivory-base text-xs">
          <span className="text-[11px] font-sans tracking-wider uppercase text-ivory-base/90">
            Available Sizes:
          </span>
          <div className="flex gap-1">
            {product.variants.slice(0, 4).map(v => (
              <span
                key={v.id}
                className={`px-1.5 py-0.5 text-[10px] border ${
                  v.stockQuantity > 0
                    ? 'border-ivory-base/60 text-ivory-base'
                    : 'border-ivory-base/20 text-ivory-base/40 line-through'
                }`}
              >
                {v.size === 'Custom Measurement' ? 'Custom' : v.size}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="pt-4 pb-2 flex flex-col items-center text-center">
        <span className="text-[11px] font-sans tracking-[0.2em] text-antique-gold uppercase mb-1">
          {product.categoryLabel}
        </span>
        <h3 className="font-serif text-lg text-charcoal-text line-clamp-1 group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        <p className="font-sans font-medium text-sm text-charcoal-text/90 mt-1">
          {formatInr(product.basePriceInr)}
        </p>
      </div>
    </div>
  );
};
