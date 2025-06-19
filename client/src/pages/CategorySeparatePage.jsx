import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Services.css';
import { BASE_URL } from '../api/axiosInstance';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function CategorySeparatePage() {
  const [services, setServices] = useState([]);
  const [displayedServices, setDisplayedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { categoryName } = useParams();
  const navigate = useNavigate();

  // Pagination state
  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const formattedCategoryName = categoryName;

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 150,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }, []);

  // Update displayed services based on current page
  const updateDisplayedServices = (servicesData, page) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setDisplayedServices(servicesData.slice(startIndex, endIndex));
    setTotalItems(servicesData.length);
    setTotalPages(Math.ceil(servicesData.length / ITEMS_PER_PAGE));
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/services?category=${formattedCategoryName}`);
        const servicesData = response.data.services || [];
        setServices(servicesData);
        updateDisplayedServices(servicesData, 1);
      } catch (err) {
        setError(err.message || 'Failed to fetch services');
        console.error('Error fetching services:', err);
        setServices([]);
        setDisplayedServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [categoryName, formattedCategoryName]);

  // Effect for page changes
  useEffect(() => {
    if (services.length) {
      updateDisplayedServices(services, currentPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, services]);

  const handleServiceClick = (serviceId) => {
    if (!serviceId) return;
    navigate(`/services/${serviceId}`);
  };

  const getPrimaryImage = (service) => {
    const placeholderImage = 'https://placehold.co/400x300.png?text=Service+Image&font=roboto';

    if (service?.primary_image_url) {
      return service.primary_image_url.startsWith('http')
        ? service.primary_image_url
        : `${BASE_URL}${service.primary_image_url}`;
    }

    return placeholderImage;
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

  const renderStars = (rating, reviewCount) => {
    return (
      <div className="service-rating" aria-label={`Rating: ${rating} out of 5`}>
        {[...Array(5)].map((_, i) => (
          <span 
            key={i} 
            className={i < Math.floor(rating || 0) ? 'filled' : ''}
            aria-hidden="true"
          >
            ★
          </span>
        ))}
        <span>({reviewCount || 0})</span>
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
      <div className="pagination" data-aos="fade-up">
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

  if (loading) {
    return (
      <div className="services-page">
        <div className="div-container">
          <h1 className="categories-title" data-aos="fade-down">Loading {formattedCategoryName} services...</h1>
          <div className="loading" aria-live="polite">Loading services...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="services-page">
        <div className="div-container">
          <h1 className="categories-title" data-aos="fade-down">{formattedCategoryName.toUpperCase()} SERVICES</h1>
          <p className="error-message" data-aos="fade-up">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page">
      <div className="div-container">
        <h1 className="categories-title" data-aos="fade-down">{formattedCategoryName.toUpperCase()} SERVICES</h1>
        <p className="category-description" data-aos="fade-up" data-aos-delay="100">
          Browse our top-rated {formattedCategoryName.toLowerCase()} professionals
        </p>
      </div>

      <div className="service-grid">
        {displayedServices.length > 0 ? (
          displayedServices.map((service, index) => (
            <article 
              key={service.service_id} 
              className="service-card"
              onClick={() => handleServiceClick(service.service_id)}
              tabIndex="0"
              role="button"
              aria-label={`Service: ${service.title}`}
              onKeyDown={(e) => e.key === 'Enter' && handleServiceClick(service.service_id)}
              data-aos="fade-up"
              data-aos-delay={(index % 4) * 100} // Stagger animation based on column
            >
              <div className="service-image">
                <img 
                  src={getPrimaryImage(service)} 
                  alt={service.title}
                  onError={(e) => {
                    e.target.src = '/default-service.jpg';
                  }}
                />
              </div>
              <div className="service-details">
                <h2>{service.title}</h2>
                <p className="service-provider">by {service.provider_name}</p>
                {renderStars(service.provider_rating, service.review_count)}
                <p className="service-price">{formatPrice(service.base_price)}</p>
                <p className="service-location">
                  <i className="fas fa-map-marker-alt" aria-hidden="true"></i> {service.location || 'Location not specified'}
                </p>
              </div>
            </article>
          ))
        ) : (
          <p className="no-results" data-aos="fade-up">No services found in this category.</p>
        )}
      </div>
      
      {renderPagination()}
    </div>
  );
}