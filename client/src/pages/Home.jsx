import React,{ useEffect, Suspense, lazy } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import CategoryCard from '../components/CategoryCard';
import SearchBar from '../components/SearchBar';
import HeroBanner from '../components/HeroBanner';
import '../styles/CategoriesCardsContainer.css';
import '../styles/Home.css';

// Lazy-loaded components
const FeaturedServices = lazy(() => import('../components/FeaturedServices'));
const Testimonial = lazy(() => import('../components/Testimonial'));
const WhatsApp = lazy(() => import('../components/WhatsApp'));

const Home = () => {
  const categories = [
    { name: 'Cleaning', icon: '🧹' },
    { name: 'Photography', icon: '📷' },
    { name: 'Plumbing', icon: '🚿' },
    { name: 'Electrical', icon: '💡' }
  ];

  useEffect(() => {
    const initAOS = setTimeout(() => {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
      });
      AOS.refresh();
    }, 1000);
    
    return () => clearTimeout(initAOS); // Cleanup timeout
  }, []);

  return (
    <div className="home-container" style={{ maxWidth: '1300px', margin: '0 auto', position: 'relative' }}>
      {/* Hero Section */}
      <div style={{ backgroundColor: '#f0f4f8' }}>
        <HeroBanner />
      </div>

      <div className="div-container" data-aos="fade-up" data-aos-delay="50">
        <h1 className="Hero-title" data-aos="fade-up" data-aos-delay="100">
          Find a trusted service provider
        </h1>
        <p className="categories-title" data-aos="fade-up" data-aos-delay="150">
          Book services from top-rated professionals
        </p>
        <div data-aos="fade-up" data-aos-delay="200">
          <SearchBar />
        </div>
      </div>

      {/* Categories Section */}
      <div data-aos="fade-up" data-aos-delay="50">
        <div className="popular-categories-container">
          <h2 className="popular-categories-title">Popular Categories</h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <CategoryCard
                key={index}
                name={category.name}
                icon={category.icon}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Featured Services Section */}
      <Suspense fallback={<div className="loading-placeholder">Loading Featured Services...</div>}>
        <div data-aos="fade-up" data-aos-delay="100">
          <FeaturedServices />
        </div>
      </Suspense>

      {/* Testimonials Section */}
      <div className="testimonials-section">
        <h1 className="featured-title" data-aos="fade-up" data-aos-delay="50">
          What our users say
        </h1>
        <Suspense fallback={<div className="loading-placeholder">Loading Testimonials...</div>}>
          <div data-aos="fade-up" data-aos-delay="100">
            <Testimonial />
          </div>
        </Suspense>
      </div>

      {/* WhatsApp Floating Button */}
      <Suspense fallback={null}> {/* No fallback needed for floating button */}
        <WhatsApp />
      </Suspense>
    </div>
  );
};

export default Home;
