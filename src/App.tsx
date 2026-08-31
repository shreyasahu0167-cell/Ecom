import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/common/CartDrawer';

// Client Storefront Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartCheckoutPage } from './pages/CartCheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { StoryPage } from './pages/StoryPage';
import { VisitStorePage } from './pages/VisitStorePage';
import { SupportPage } from './pages/SupportPage';
import { AuthPage } from './pages/AuthPage';

// Isolated Admin Portal
import { AdminPortal } from './pages/admin/AdminPortal';

export function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const pathname = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (pathname.includes('/saanvya.admin') || hash.includes('saanvya.admin') || hash.includes('admin')) {
      return 'admin';
    }
    return 'home';
  });
  const [pageParams, setPageParams] = useState<any>({});

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Safely update hash for robust GitHub Pages & subpath support
    if (page === 'admin') {
      window.location.hash = '#/saanvya.admin';
    } else if (page === 'home') {
      window.location.hash = '';
    } else {
      const queryString = params && Object.keys(params).length > 0
        ? `?${new URLSearchParams(params).toString()}`
        : '';
      window.location.hash = `#/${page}${queryString}`;
    }
  };

  useEffect(() => {
    // Handle initial and browser back/forward URL routing
    const checkRoute = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      
      if (
        pathname.includes('saanvya.admin') ||
        pathname.endsWith('/admin') ||
        hash.includes('saanvya.admin') ||
        hash.includes('admin')
      ) {
        setCurrentPage('admin');
        return;
      }

      const cleanHash = window.location.hash.replace(/^#\/?/, '');
      if (cleanHash) {
        const [page, queryString] = cleanHash.split('?');
        const urlParams = new URLSearchParams(queryString || '');
        const paramsObj: Record<string, string> = {};
        urlParams.forEach((val, key) => {
          paramsObj[key] = val;
        });
        setCurrentPage(page || 'home');
        setPageParams(paramsObj);
      } else {
        setCurrentPage('home');
        setPageParams({});
      }
    };

    checkRoute();

    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, []);

  // Isolated Admin Route: Render completely independent of main storefront layout
  if (currentPage === 'admin') {
    return <AdminPortal onExit={() => handleNavigate('home')} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'shop':
        return (
          <ShopPage
            initialCategory={pageParams.category || 'all'}
            initialSearch={pageParams.search || ''}
            filterWishlistOnly={Boolean(pageParams.filterWishlist)}
            onNavigate={handleNavigate}
          />
        );
      case 'collections':
        return <CollectionsPage onNavigate={handleNavigate} />;
      case 'product-detail':
        return <ProductDetailPage slug={pageParams.slug || ''} onNavigate={handleNavigate} />;
      case 'checkout':
        return <CartCheckoutPage onNavigate={handleNavigate} />;
      case 'order-confirmation':
        return (
          <OrderConfirmationPage
            orderId={pageParams.orderId || ''}
            onNavigate={handleNavigate}
          />
        );
      case 'story':
        return <StoryPage onNavigate={handleNavigate} />;
      case 'visit-store':
        return <VisitStorePage onNavigate={handleNavigate} />;
      case 'support':
        return <SupportPage onNavigate={handleNavigate} />;
      case 'auth':
      case 'account':
        return <AuthPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-charcoal-text selection:bg-antique-gold/20 selection:text-primary">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-1">
        {renderPage()}
      </main>
      <CartDrawer onNavigate={handleNavigate} />
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
