import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { BASE_URL } from '../api/axiosInstance';
import '../styles/Services.css';

const LOCATION_OPTIONS = [
  { value: '', label: 'All Locations' },
  { value: 'Hyderabad', label: 'Hyderabad' },
  { value: 'Siddipet', label: 'Siddipet' },
  { value: 'Karimnagar', label: 'Karimnagar' }
];

const PRICE_RANGE_OPTIONS = [
  { value: '', label: 'All Prices' },
  { value: '0-50', label: '₹0 - ₹50' },
  { value: '50-100', label: '₹50 - ₹100' },
  { value: '100-', label: '₹100+' }
];

const ITEMS_PER_PAGE = 8;

// Skeleton Loader Component
const ServiceCardSkeleton = ({ count = 8 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <article key={index} className="service-card skeleton">
          <div className="service-image skeleton-image"></div>
          <div className="service-details">
            <h2 className="skeleton-text skeleton-title"></h2>
            <p className="service-provider skeleton-text skeleton-provider"></p>
            <div className="service-rating skeleton-rating">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="skeleton-star">★</span>
              ))}
            </div>
            <p className="service-price skeleton-text skeleton-price"></p>
            <p className="service-location skeleton-text skeleton-location"></p>
          </div>
        </article>
      ))}
    </>
  );
};

const Services = () => {
  const [allServices, setAllServices] = useState([]);
  const [displayedServices, setDisplayedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    category: '',
    priceRange: ''
  });
  
  const [categoryOptions, setCategoryOptions] = useState([{ value: '', label: 'All Categories' }]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const debounceRef = useRef(null);

  useEffect(() => {
    AOS.init({
      duration: 200,
      easing: 'ease-in-out',
      once: false,
      mirror: true
    });
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/categories`);
        const dynamicOptions = res.data.categories.map(category => ({
          value: category,
          label: category
        }));
        setCategoryOptions([{ value: '', label: 'All Categories' }, ...dynamicOptions]);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);
  
  // Initialize filters from URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const initialSearch = searchParams.get('search') || '';
    const initialLocation = searchParams.get('location') || '';
    const initialCategory = searchParams.get('category') || '';
    const initialPriceRange = searchParams.get('priceRange') || '';

    setFilters(prev => ({
      ...prev,
      search: initialSearch,
      location: initialLocation,
      category: initialCategory,
      priceRange: initialPriceRange
    }));
  }, [location.search]);

  // Update URL when filters change
  const updateURL = (newFilters) => {
    const searchParams = new URLSearchParams();
    
    // Only add non-empty filter values to URL
    if (newFilters.search) searchParams.set('search', newFilters.search);
    if (newFilters.location) searchParams.set('location', newFilters.location);
    if (newFilters.category) searchParams.set('category', newFilters.category);
    if (newFilters.priceRange) searchParams.set('priceRange', newFilters.priceRange);
    
    // Update URL without triggering a page reload
    const newURL = searchParams.toString() ? `?${searchParams.toString()}` : '';
    navigate(`/services${newURL}`, { replace: true });
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = {
        search: filters.search,
        location: filters.location,
        category: filters.category
      };

      if (filters.priceRange) {
        const [minPrice, maxPrice] = filters.priceRange.split('-');
        if (minPrice) params.minPrice = parseFloat(minPrice);
        if (maxPrice) params.maxPrice = parseFloat(maxPrice.replace('+', ''));
      }

      const response = await axios.get(`${BASE_URL}/api/services`, { params });
      const servicesData = response.data.services || [];
      setAllServices(servicesData);
      setTotalItems(servicesData.length);
      setTotalPages(Math.ceil(servicesData.length / ITEMS_PER_PAGE));
      updateDisplayedServices(servicesData, 1);
    } catch (err) {
      console.error('Error fetching services:', err);
      setAllServices([]);
      setDisplayedServices([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const updateDisplayedServices = (services, page) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setDisplayedServices(services.slice(startIndex, endIndex));
  };

  const getRandomLocation = () => {
    const locations = ["Hyderabad", "Karimnagar", "Siddipet"];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  useEffect(() => {
    if (allServices.length) {
      updateDisplayedServices(allServices, currentPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, allServices]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchServices();
      updateURL(filters); // Update URL when filters change
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleServiceClick = (serviceId) => {
    if (!serviceId) return;
    navigate(`/services/${serviceId}`);
  };

  const getPrimaryImage = (service) => {
    const imageUrl = service.primary_image_url;
    if (!imageUrl) {
      return 'https://placehold.co/400x300.png?text=Service+Image&font=roboto';
    }
    return imageUrl.startsWith('http')
      ? imageUrl
      : `${BASE_URL}${imageUrl}`;
  };

  const formatPrice = (price) => {
    const numericPrice = Number(price);
    return isNaN(numericPrice) ? '₹0.00' : `₹${numericPrice.toFixed(2)}`;
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderStars = (service) => {
      // Check for various possible property names
      const rating = service.provider_rating ?? service.rating ?? service.avg_rating ?? 0;
      const reviewCount = service.review_count ?? service.reviews_count ?? service.total_reviews ?? 0;
      
      // Generate random values between 3-5 if rating or reviewCount is 0
      const displayRating = rating === "0.00" ? (Math.random() * 2 + 3).toFixed(1) : rating;
      const displayReviewCount = reviewCount === 0 ? Math.floor(Math.random() * 3) + 3 : reviewCount;
      
      return (
        <div className="service-rating" aria-label={`Rating: ${displayRating} out of 5`}>
          {[...Array(5)].map((_, i) => (
            <span 
              key={i} 
              className={i < Math.floor(displayRating) ? 'filled' : ''}
              aria-hidden="true"
            >
              ★
            </span>
          ))}
          <span>({Math.floor(displayRating)})</span>
        </div>
      );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(currentPage + 1, totalPages - 1);

      if (startPage > 2) {
        pageNumbers.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }

      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return (
      <div className="pagination" data-aos="fade-up" data-aos-delay="100">
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="pagination-button"
        >
          &laquo; Prev
        </button>
        
        <div className="page-numbers">
          {pageNumbers.map((number, index) => (
            typeof number === 'number' ? (
              <button
                key={index}
                onClick={() => handlePageChange(number)}
                className={currentPage === number ? 'active' : ''}
                aria-current={currentPage === number ? 'page' : undefined}
                aria-label={`Page ${number}`}
                data-aos="zoom-in"
                data-aos-delay={index * 50}
              >
                {number}
              </button>
            ) : (
              <span key={index} className="ellipsis" aria-hidden="true">
                {number}
              </span>
            )
          ))}
        </div>
        
        <button 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="pagination-button"
        >
          Next &raquo;
        </button>
      </div>
    );
  };

  return (
    <div className="services-page">
      <div className="services-browser-container">
        <div className="doodle-bg">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i} 
              className="doodle-element"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg) scale(${0.5 + Math.random() * 0.7})`,
                opacity: 0.3 + Math.random() * 0.4
              }}
            />
          ))}
        </div>
        
        <div className="services-content">
          <h1 className="services-title" data-aos="fade-down" data-aos-delay="50">
            <span className="title-text">Browse Services</span>
            <span className="title-decoration"></span>
          </h1>
          
          <div className="search-section" data-aos="fade-up" data-aos-delay="100">
            <div className="search-bar-wrapper">
              <div className="search-input-container" data-aos="fade-right" data-aos-delay="150">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.5 15H14.71L14.43 14.73C15.41 13.59 16 12.11 16 10.5C16 6.91 13.09 4 9.5 4C5.91 4 3 6.91 3 10.5C3 14.09 5.91 17 9.5 17C11.11 17 12.59 16.41 13.73 15.43L14 15.71V16.5L19 21.49L20.49 20L15.5 15Z" fill="currentColor"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search services..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  aria-label="Search services"
                  className="search-input"
                />
              </div>
              
              <div className="location-select-container" data-aos="fade-left" data-aos-delay="150">
                <svg className="location-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                </svg>
                <select 
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  aria-label="Filter by location"
                  className="location-select"
                >
                  {LOCATION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="filters-section" data-aos="fade-up" data-aos-delay="200">
            <div className="filter-group" data-aos="zoom-in" data-aos-delay="250">
              <label htmlFor="category-filter" className="filter-label">
                Category
              </label>
              <select
                id="category-filter"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group" data-aos="zoom-in" data-aos-delay="300">
              <label htmlFor="price-filter" className="filter-label">
                Price Range
              </label>
              <select
                id="price-filter"
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="filter-select"
              >
                {PRICE_RANGE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="service-grid">
        {loading ? (
          <ServiceCardSkeleton count={ITEMS_PER_PAGE} />
        ) : (
          <>
            {displayedServices.length > 0 ? (
              displayedServices.map((service, index) => (
                <article 
                  key={service.service_id} 
                  className="service-card"
                  tabIndex="0"
                  role="button"
                  aria-label={`Service: ${service.title} by ${service.provider_name}`}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleServiceClick(service.service_id)}
                  data-aos="fade-up"
                >
                  <div className="service-image">
                    <img 
                      src={getPrimaryImage(service)} 
                      alt={service.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/default-service.jpg';
                        e.target.alt = 'Default service image';
                      }}
                    />
                  </div>
                  <div className="service-details">
                    <h2>{service.title.charAt(0).toUpperCase() + service.title.slice(1)}</h2>
                    <p style={{marginTop: '0'}} className="service-location">
                    <span className="service-provider">by {service.provider_name} </span>
                      ({service.location ?? getRandomLocation()})
                    </p>
                    <div className="service-rating">
                      {renderStars(service)}
                    </div>
                    <p className="service-price"><span>only </span>{formatPrice(service.base_price)}/-</p>
                    
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                      <a className='connect-button' style={{fontSize: '0.8rem'}} onClick={() => handleServiceClick(service.service_id)}>View Service</a>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="no-results" data-aos="fade-in">
                No services found matching your criteria.
              </p>
            )}
          </>
        )}
      </div>
      
      {!loading && renderPagination()}
    </div>
  );
};

export default Services;