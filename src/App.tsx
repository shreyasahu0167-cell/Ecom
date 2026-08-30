import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { DemoBanner } from './components/common/DemoBanner';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/common/CartDrawer';

// Pages
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
import { AdminPage } from './pages/AdminPage';

export function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>({});

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // Handle browser back/forward or simple URL hash
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const [page, queryString] = hash.split('?');
        const urlParams = new URLSearchParams(queryString || '');
        const paramsObj: Record<string, string> = {};
        urlParams.forEach((val, key) => {
          paramsObj[key] = val;
        });
        setCurrentPage(page || 'home');
        setPageParams(paramsObj);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
      case 'admin':
        return <AdminPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-charcoal-text selection:bg-antique-gold/20 selection:text-primary">
      <DemoBanner />
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
