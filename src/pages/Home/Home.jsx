// ==========================================
// FILE: src/pages/Home/Home.jsx
// ==========================================
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import SearchBar from '../../components/SearchBar/SearchBar';
import Sidebar from '../../components/Sidebar/Sidebar';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductSkeleton from '../../components/Skeleton/ProductSkeleton';
import WishlistOffcanvas from '../../components/Wishlist/WishlistOffcanvas';
import CategoryMenu from '../../components/CategoryMenu/CategoryMenu';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import EmptyState from '../../components/EmptyState/EmptyState';
import Toast from '../../components/Toast/Toast';
import { supabase } from '../../utils/supabaseClient';
import { useWishlist } from '../../hooks/useWishlist';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useImageObserver } from '../../hooks/useImageObserver';
import { shareProduct } from '../../utils/wishlistUtils';
import { getCategoryName } from '../../utils/categories';
import Footer from '../../components/Footer/Footer';
import './Home.css';

// Import Bootstrap JS for offcanvas functionality (important if not already included globally)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const PAGE_SIZE = 12;

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [currentCategoryId, setCurrentCategoryId] = useState('all');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [ads, setAds] = useState([]);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [emptyStateConfig, setEmptyStateConfig] = useState(null);

  const {
    wishlistItems,
    wishlistCount,
    toggleWishlist,
    removeFromWishlist,
    isInWishlist
  } = useWishlist();

  const { observe: observeImage } = useImageObserver(true);

  // ==========================================
  // Load More Products (Infinite Scroll)
  // ==========================================
  const loadMoreProducts = useCallback(async () => {
    try {
      let query = supabase
        .from('products')
        .select('id, name, description, price, category_id, img_path, condition, location')
        .order('id', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (currentSearchTerm) {
        query = query.or(`name.ilike.%${currentSearchTerm}%,description.ilike.%${currentSearchTerm}%`);
      }

      if (currentCategoryId !== 'all') {
        query = query.eq('category_id', Number(currentCategoryId));
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        return false;
      }

      if (!data || data.length === 0) {
        if (offset === 0) {
          let title = 'No products found';
          let message = 'Try adjusting your search or filters.';

          if (currentSearchTerm) {
            title = 'No results for your search';
            message = `No products match "${currentSearchTerm}". Try different keywords.`;
          } else if (currentCategoryId !== 'all') {
            const catName = getCategoryName(parseInt(currentCategoryId));
            title = `No products in ${catName}`;
            message = 'This category is empty. Check back later for new listings.';
          } else {
            title = 'No products available';
            message = 'Stay tuned for exciting products coming soon!';
          }

          setEmptyStateConfig({ title, message });
        } else {
          setToastMessage("You've reached the end of our products! 🎉");
          setShowToast(true);
        }
        return false;
      }

      setProducts(prev => [...prev, ...data]);
      setOffset(prev => prev + data.length);
      setEmptyStateConfig(null);

      return data.length === PAGE_SIZE;
    } catch (err) {
      console.error('Error loading products:', err);
      return false;
    }
  }, [offset, currentCategoryId, currentSearchTerm]);

  const {
    sentinelRef,
    loading,
    exhausted,
    reset,
    setExhausted
  } = useInfiniteScroll(loadMoreProducts, {
    enabled: !emptyStateConfig
  });

  // ==========================================
  // Fetch Ads on Mount
  // ==========================================
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const { data, error } = await supabase
          .from('ads')
          .select('id, image_path, link')
          .order('id', { ascending: true });

        if (error) {
          console.error('Ads fetch error:', error);
          return;
        }

        setAds(data || []);
      } catch (e) {
        console.error('Ads fetch error:', e);
      }
    };

    fetchAds();
  }, []);

  // ==========================================
  // URL Category Handling
  // ==========================================
  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setCurrentCategoryId(category);
    }
  }, [searchParams]);

  const resetPagination = () => {
    setProducts([]);
    setOffset(0);
    setEmptyStateConfig(null);
    reset();
  };

  const handleCategorySelect = (categoryId) => {
    setCurrentCategoryId(categoryId);
    if (categoryId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryId });
    }
    resetPagination();
  };

  const handleSearch = (searchTerm) => {
    setCurrentSearchTerm(searchTerm);
    resetPagination();
  };

  // ==========================================
  // Wishlist handlers
  // ==========================================
  const handleStartShopping = () => {
    handleCategorySelect('all');
    setShowWishlist(false);
  };

  const categoryName = currentCategoryId !== 'all' 
    ? getCategoryName(parseInt(currentCategoryId))
    : null;

  const handleMenuToggle = () => {
    setShowCategoryMenu(prev => !prev);
  };

  // ==========================================
  // Render JSX
  // ==========================================
  return (
    <>
      <Navbar
        wishlistCount={wishlistCount}
        onWishlistClick={() => setShowWishlist(true)}
        onMenuToggle={handleMenuToggle}
        menuActive={showCategoryMenu}
      />

      {/* Wishlist Offcanvas */}
      <WishlistOffcanvas
        show={showWishlist}
        onHide={() => setShowWishlist(false)}
        wishlistItems={wishlistItems}
        onRemove={removeFromWishlist}
        onShare={shareProduct}
        onStartShopping={handleStartShopping}
      />

      {/* Category Menu */}
      <CategoryMenu
        show={showCategoryMenu}
        onHide={() => setShowCategoryMenu(false)}
        activeCategory={currentCategoryId}
        onCategorySelect={handleCategorySelect}
        ads={ads}
      />

      {/* Layout */}
      <div className="layout-container container">
        <Sidebar
          activeCategory={currentCategoryId}
          onCategorySelect={handleCategorySelect}
          ads={ads}
        />

        <main className="product-grid">
          <SearchBar onSearch={handleSearch} initialValue={currentSearchTerm} />

          <Breadcrumb
            categoryName={categoryName}
            onHomeClick={() => handleCategorySelect('all')}
          />

          {emptyStateConfig ? (
            <EmptyState
              icon="bi-inbox"
              title={emptyStateConfig.title}
              message={emptyStateConfig.message}
            />
          ) : (
            <div className="row g-3" id="products-grid">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSaveToggle={toggleWishlist}
                  isInWishlist={isInWishlist(product.id)}
                  imageObserver={{ observe: observeImage }}
                />
              ))}
              {loading && <ProductSkeleton count={PAGE_SIZE} />}
            </div>
          )}

          <div ref={sentinelRef} id="scroll-sentinel" style={{ height: '1px' }}></div>
        </main>
      </div>

      {/* Toast Notification */}
      <Toast
        show={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />

      <Footer />
    </>
  );
};

export default Home;
