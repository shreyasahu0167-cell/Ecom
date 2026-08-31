import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Heart, User, Search, Menu, X, Shield, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { totalItems, wishlist, setIsCartOpen } = useCart();
  const { profile, isAdmin, isSupabaseConfigured } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('shop', { search: searchQuery.trim() });
      setIsSearchOpen(false);
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop Catalog' },
    { id: 'collections', label: 'Collections' },
    { id: 'bridal', label: 'Bridal Couture' },
    { id: 'story', label: 'Our Story' },
    { id: 'visit-store', label: 'Visit Atelier' },
    { id: 'support', label: 'Support & Policies' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top micro bar for bespoke concierge */}
      <div className="bg-primary text-ivory-base/80 text-[11px] font-sans py-1.5 px-4 hidden md:flex items-center justify-between border-b border-antique-gold/20">
        <div className="flex items-center gap-3">
          <span className="text-antique-gold font-medium">Bespoke Atelier Consultations</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('visit-store')}
            className="hover:text-antique-gold transition-colors underline underline-offset-2"
          >
            Book Private Viewing
          </button>
          <span className="text-ivory-base/40">•</span>
          <button
            onClick={() => onNavigate('support')}
            className="hover:text-antique-gold transition-colors"
          >
            Client Services
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`w-full transition-all duration-300 border-b ${
          isScrolled
            ? 'bg-ivory-base/95 backdrop-blur-md shadow-sm border-outline-variant/30 py-3.5'
            : 'bg-ivory-base/85 backdrop-blur-sm border-outline-variant/20 py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-charcoal-text hover:text-primary transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Nav Links (Left) */}
          <div className="hidden lg:flex items-center space-x-7">
            {navLinks.slice(0, 4).map(link => (
              <button
                key={link.id}
                onClick={() => {
                  if (link.id === 'bridal') {
                    onNavigate('shop', { category: 'bridal' });
                  } else {
                    onNavigate(link.id);
                  }
                }}
                className={`text-xs font-sans tracking-[0.16em] uppercase transition-colors relative py-1 ${
                  currentPage === link.id || (link.id === 'bridal' && currentPage === 'shop')
                    ? 'text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-antique-gold'
                    : 'text-charcoal-text/80 hover:text-primary'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Centered Brand Emblem & Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="cursor-pointer flex flex-col items-center justify-center text-center px-4"
          >
            <span className="font-serif text-2xl sm:text-3xl tracking-[0.28em] text-primary font-normal uppercase leading-none">
              SAANVYA
            </span>
            <span className="text-[9px] font-sans tracking-[0.3em] text-antique-gold uppercase mt-1 font-semibold">
              Modern Indian Couture
            </span>
          </div>

          {/* Desktop Nav Links (Right) & Utility Icons */}
          <div className="flex items-center space-x-5">
            <div className="hidden lg:flex items-center space-x-7 mr-2">
              {navLinks.slice(4).map(link => (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`text-xs font-sans tracking-[0.16em] uppercase transition-colors relative py-1 ${
                    currentPage === link.id
                      ? 'text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-antique-gold'
                      : 'text-charcoal-text/80 hover:text-primary'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1.5 text-charcoal-text hover:text-primary transition-colors"
              aria-label="Search collection"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('shop', { filterWishlist: true })}
              className="p-1.5 text-charcoal-text hover:text-deep-rose transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-4.5 h-4.5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-deep-rose text-white text-[9px] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Account / Admin Portal */}
            <button
              onClick={() => onNavigate(profile ? (isAdmin ? 'admin' : 'account') : 'auth')}
              className="p-1.5 text-charcoal-text hover:text-primary transition-colors relative"
              aria-label="User Account / Admin"
              title={profile ? `${profile.fullName || profile.email} (${profile.role})` : 'Sign In'}
            >
              {isAdmin ? (
                <Shield className="w-4.5 h-4.5 text-antique-gold" />
              ) : (
                <User className="w-4.5 h-4.5" />
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1.5 text-charcoal-text hover:text-primary transition-colors relative flex items-center"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-antique-gold text-primary text-[10px] font-sans font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Search Drawer Bar */}
        {isSearchOpen && (
          <div className="border-t border-outline-variant/30 bg-surface-container-low px-4 py-3 mt-3 transition-all animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center gap-3">
              <Search className="w-4 h-4 text-outline" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lehengas, sarees, bridal wear, silk organza..."
                className="w-full bg-transparent text-sm font-sans focus:outline-none placeholder:text-outline/70 text-charcoal-text"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-primary text-ivory-base text-xs font-sans tracking-widest uppercase hover:bg-charcoal-text"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-xs text-outline hover:text-charcoal-text px-2"
              >
                Close
              </button>
            </form>
          </div>
        )}
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[88px] z-50 bg-ivory-base/98 backdrop-blur-lg border-t border-outline-variant/30 p-6 flex flex-col justify-between overflow-y-auto animate-fadeIn">
          <div className="flex flex-col space-y-5 pt-2">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (link.id === 'bridal') {
                    onNavigate('shop', { category: 'bridal' });
                  } else {
                    onNavigate(link.id);
                  }
                }}
                className={`text-left font-serif text-2xl tracking-wide transition-colors ${
                  currentPage === link.id ? 'text-antique-gold italic' : 'text-charcoal-text'
                }`}
              >
                {link.label}
              </button>
            ))}

            <div className="pt-6 border-t border-outline-variant/30 flex flex-col space-y-3">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate(profile ? (isAdmin ? 'admin' : 'account') : 'auth');
                }}
                className="flex items-center gap-2 text-sm font-sans text-charcoal-text"
              >
                <User className="w-4 h-4 text-antique-gold" />
                <span>{profile ? `Account (${profile.email})` : 'Client Sign In / Register'}</span>
              </button>
            </div>
          </div>

          <div className="pt-8 text-center text-xs font-sans text-charcoal-text/60 border-t border-outline-variant/20">
            <p className="font-serif italic text-sm text-charcoal-text mb-1">
              "The modern dialogue of Indian heritage and restrained luxury."
            </p>
            <p className="text-[11px]">Saanvya Atelier • Mumbai</p>
          </div>
        </div>
      )}
    </header>
  );
};
