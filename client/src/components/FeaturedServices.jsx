import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo
} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FeaturedServiceCard from './FeaturedServiceCard';
import { BASE_URL } from '../api/axiosInstance';
import '../styles/FeaturedServices.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { debounce, throttle } from 'lodash';

const FeaturedServices = memo(() => {
  const [state, setState] = useState({
    providers: [],
    loading: true,
    error: null,
    showLeftArrow: false,
    showRightArrow: false,
    hasOverflow: false
  });

  const colors = ['#FF6B6B', '#6BCB77', '#4D96FF', '#FFD93D', '#845EC2', '#00C9A7'];

  const scrollContainerRef = useRef(null);
  const contentRef = useRef(null);
  const navigate = useNavigate();
  const resizeObserverRef = useRef(null);

  const fetchFeaturedProviders = useCallback(async () => {
    const source = axios.CancelToken.source();

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await axios.get(`${BASE_URL}/api/providers`, {
        params: {
          isApproved: 'true',
          minRating: 4.5,
          limit: 8
        },
        cancelToken: source.token
      });

      if (response.data) {
        setState(prev => ({
          ...prev,
          providers: response.data.slice(0, 6),
          loading: false
        }));
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('Error fetching featured providers:', err);
        setState(prev => ({
          ...prev,
          error: 'Failed to load featured providers',
          loading: false
        }));
      }
    }

    return () => source.cancel('Component unmounted, request cancelled');
  }, []);

  useEffect(() => {
    fetchFeaturedProviders();
  }, [fetchFeaturedProviders]);

  const checkOverflow = useCallback(() => {
    const container = scrollContainerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const hasOverflow = content.scrollWidth > container.clientWidth;

    setState(prev => ({
      ...prev,
      hasOverflow,
      showLeftArrow: false,
      showRightArrow: hasOverflow
    }));
  }, []);

  const updateScrollArrows = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;

    setState(prev => ({
      ...prev,
      showLeftArrow: scrollLeft > 0,
      showRightArrow: prev.hasOverflow && scrollLeft < scrollWidth - clientWidth - 1
    }));
  }, []);

  const debouncedUpdateScrollArrows = useCallback(debounce(updateScrollArrows, 100), [updateScrollArrows]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (!state.loading && state.providers.length > 0) {
      setTimeout(() => {
        checkOverflow();
        updateScrollArrows();
      }, 0);
    }

    resizeObserverRef.current = new ResizeObserver(() => {
      checkOverflow();
      debouncedUpdateScrollArrows();
    });
    resizeObserverRef.current.observe(container);

    const handleScroll = throttle(() => {
      updateScrollArrows();
    }, 50);

    container.addEventListener('scroll', handleScroll);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.unobserve(container);
      }
      container.removeEventListener('scroll', handleScroll);
    };
  }, [state.loading, state.providers.length, checkOverflow, debouncedUpdateScrollArrows, updateScrollArrows]);

  const scroll = useCallback((direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    container.scrollTo({
      left: direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount,
      behavior: 'smooth'
    });
  }, []);

  const handleProviderClick = useCallback((providerId) => {
    navigate(`/providers/${providerId}`);
  }, [navigate]);

  const renderLoadingSkeleton = () => (
    <div className="featured-scroll-inner">
      {[...Array(4)].map((_, index) => (
        <div key={`skeleton-${index}`} className="featured-card-skeleton shimmer">
          <div className="skeleton-image" />
          <div className="skeleton-text" />
          <div className="skeleton-text short" />
          <div className="skeleton-rating" />
        </div>
      ))}
    </div>
  );

  return (
    <section className="featured-section" aria-labelledby="featured-services-title">
      <h2 id="featured-services-title" className="featured-title">
        Featured Service Providers
      </h2>

      {state.showLeftArrow && (
        <div className="featured-scroll-fade-left visible">
          <button
            className="scroll-button left"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <FaChevronLeft />
          </button>
        </div>
      )}

      {state.showRightArrow && (
        <div className="featured-scroll-fade-right visible">
          <button
            className="scroll-button right"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <FaChevronRight />
          </button>
        </div>
      )}

      <div className="featured-scroll-container relative">
        <div
          className="featured-scroll-wrapper"
          ref={scrollContainerRef}
          role="region"
          aria-label="Featured services carousel"
          tabIndex="0"
        >
          {state.loading ? (
            renderLoadingSkeleton()
          ) : state.error ? (
            <div className="status-message error" role="alert">
              {state.error}
              <button
                onClick={fetchFeaturedProviders}
                className="retry-button"
                aria-label="Retry loading featured providers"
              >
                Try Again
              </button>
            </div>
          ) : state.providers.length === 0 ? (
            <div className="status-message">No featured providers available</div>
          ) : (
            <div className="featured-scroll-inner" ref={contentRef}>
              {state.providers.map((provider, i) => (
                <FeaturedServiceCard
                  key={provider.provider_id}
                  index={i}
                  providerPhoto={provider.profile_picture_url}
                  providerName={provider.provider_name}
                  serviceType={provider.service_type}
                  experience_years={provider.experience_years}
                  rating={Number(provider.rating) || 4.5}
                  // onClick={() => handleProviderClick(provider.provider_id)}
                  handleProviderClick={handleProviderClick}
                  provider_id={provider.provider_id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

FeaturedServices.displayName = 'FeaturedServices';

export default FeaturedServices;
