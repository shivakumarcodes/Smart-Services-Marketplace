import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Booking from '../components/Booking';
import ShareButton from '../components/ShareButton';
import '../styles/ServiceDetail.css';
import { BASE_URL } from '../api/axiosInstance';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const [bookingDate, setBookingDate] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [address, setAddress] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const placeholderImage = 'https://placehold.co/400x300.png?text=Service+Image&font=roboto';

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }, []);

  const getServiceImage = () => {
    if (service?.images?.length > 0) {
      const primaryImage = service.images.find(img => img.is_primary);
      
      if (primaryImage) {
        return primaryImage.image_url.startsWith('http')
          ? primaryImage.image_url
          : `${BASE_URL}${primaryImage.image_url}`;
      }

      const firstImage = service.images[0];
      return firstImage.image_url.startsWith('http')
        ? firstImage.image_url
        : `${BASE_URL}${firstImage.image_url}`;
    }

    return placeholderImage;
  };

  const getProfilePictureUrl = () => {
    if (service?.provider_image) {
      return service.provider_image.startsWith('http')
        ? service.provider_image
        : `${BASE_URL}${service.provider_image}`;
    }
    return 'https://isobarscience.com/wp-content/uploads/2020/09/default-profile-picture1.jpg';
  };

  useEffect(() => {
    const fetchService = async () => {
      try {
        if (!id) {
          navigate('/services');
          return;
        }

        const response = await axios.get(`${BASE_URL}/api/services/${id}`);
        setService(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id, navigate]);

  const handleBookNowClick = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: `/services/${id}` } });
      return;
    }

    setBookingDate('');
    setSpecialRequests('');
    setAddress('');
    setBookingError('');
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (event) => {
    event.preventDefault();

    if (!bookingDate) {
      setBookingError('Please select a booking date and time');
      return;
    }

    if (!address.trim()) {
      setBookingError('Please provide a service address');
      return;
    }

    setIsBooking(true);
    setBookingError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { from: `/services/${id}` } });
        return;
      }

      const bookingData = {
        serviceId: service.service_id,
        providerId: service.provider_id,
        bookingDate: new Date(bookingDate).toISOString(),
        specialRequests: specialRequests.trim() || null,
        address: address,
        totalAmount: service.base_price
      };

      const response = await axios.post(`${BASE_URL}/api/bookings`, bookingData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201 || response.status === 200) {
        setBookingSuccess(true);
        setTimeout(() => setShowBookingForm(false), 1000);
        setTimeout(() => navigate('/profile'), 2000);
      } else {
        setBookingError('Booking failed: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      setBookingError('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsBooking(false);
    }
  };

  const renderSkeletonLoader = () => {
    return (
      <div className="service-detail-container">
        {/* Header Skeleton */}
        <div className="service-header skeleton-header" data-aos="fade-down">
          <div className="skeleton-title"></div>
          <div className="service-meta">
            <span className="price skeleton-text"></span>
            <span className="duration skeleton-text"></span>
            <div className="rating skeleton-rating"></div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="service-content">
          <div className="service-image-wrapper skeleton-image-wrapper" data-aos="fade-right">
            <div className="skeleton-image"></div>
          </div>

          <div className="service-info">
            <div className="info-section" data-aos="fade-left" data-aos-delay="100">
              <div className="head skeleton-head"></div>
              <div className="description skeleton-description"></div>
              <div className="description skeleton-description"></div>
              <div className="description skeleton-description" style={{width: '80%'}}></div>
            </div>

            <div className="info-section" data-aos="fade-left" data-aos-delay="200">
              <div className="head skeleton-head"></div>
              <ul className="service-details-list">
                {[...Array(4)].map((_, i) => (
                  <li key={i} className="skeleton-text"></li>
                ))}
              </ul>
            </div>

            <div className="action-buttons">
              <div className="book-button skeleton-button"></div>
            </div>
          </div>
        </div>

        {/* Provider Section Skeleton */}
        <div className="provider-section">
          <div className="skeleton-head" data-aos="fade-down"></div>
          <div className="provider-card" data-aos="zoom-in">
            <div className="provider-avatar skeleton-avatar"></div>
            <div className="provider-info">
              <div className="skeleton-text" style={{width: '60%'}} data-aos="fade-right" data-aos-delay="100"></div>
              <div className="skeleton-text" style={{width: '40%'}} data-aos="fade-right" data-aos-delay="150"></div>
              <div className="skeleton-text" style={{width: '30%'}} data-aos="fade-right" data-aos-delay="200"></div>
              <div className="skeleton-text" style={{width: '100%'}} data-aos="fade-right" data-aos-delay="250"></div>
              <div className="skeleton-text" style={{width: '80%'}} data-aos="fade-right" data-aos-delay="300"></div>
              
              <div className="provider-stats">
                {[...Array(3)].map((_, i) => (
                  <div className="stat-item" data-aos="fade-up" data-aos-delay={300 + (i * 50)} key={i}>
                    <span className="stat-value skeleton-text"></span>
                    <span className="stat-label skeleton-text"></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section Skeleton */}
        <div className="reviews-section">
          <div className="skeleton-head" data-aos="fade-down"></div>
          <div className="reviews-list">
            {[...Array(2)].map((_, i) => (
              <div 
                key={i} 
                className="review-card skeleton-review"
                data-aos="fade-up"
                data-aos-delay={i * 100}
              >
                <div className="review-header">
                  <div className="reviewer-avatar skeleton-avatar"></div>
                  <div className="reviewer-info">
                    <div className="skeleton-text" style={{width: '40%'}}></div>
                    <div className="review-meta">
                      <div className="review-rating skeleton-rating"></div>
                      <div className="review-date skeleton-text"></div>
                    </div>
                  </div>
                </div>
                <div className="review-comment skeleton-text"></div>
                <div className="review-comment skeleton-text" style={{width: '80%'}}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return renderSkeletonLoader();
  if (error) return <div className="error">Error: {error}</div>;
  if (!service) return <div className="not-found">Service not found</div>;

  return (
    <div className="service-detail-container">
      {/* Service Header */}
      <div className="service-header" data-aos="fade-down">
        <h1>{service.title.charAt(0).toUpperCase() + service.title.slice(1)}</h1>
        <div className="service-meta">
          <span className="price">₹{service.base_price}</span>
          <span className="duration">{service.duration_minutes} mins</span>
          <div className="rating">
            {(() => {
              const rating = service.provider_rating ?? (Math.random() * 2 + 3).toFixed(1);
              return (
                <>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(rating) ? 'filled' : ''}>★</span>
                  ))}
                  <span>({service.reviews?.length || 0} reviews)</span>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="service-content">
        <div className="service-image-wrapper" data-aos="fade-right">
          <img
            src={getServiceImage()}
            alt={service.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = placeholderImage;
            }}
            className="service-image"
          />
        </div>

        <div className="service-info">
          <div className="info-section" data-aos="fade-left" data-aos-delay="100">
            <h3 className="head">Service Description</h3>
            <p className="description">{service.description}</p>
          </div>

          <div className="info-section" data-aos="fade-left" data-aos-delay="200">
            <h3 className="head">Service Details</h3>
            <ul className="service-details-list">
              <li><strong>Category:</strong> {service.category}</li>
              <li><strong>Duration:</strong> {service.duration_minutes} minutes</li>
              <li><strong>Availability:</strong> {service.availability || 'Flexible'}</li>
              {service.extra_features && (
                <li><strong>Includes:</strong> {service.extra_features}</li>
              )}
            </ul>
          </div>

          <div className="action-buttons">
            {!bookingSuccess ? (
              <button className="book-button" onClick={handleBookNowClick}>
                Book Now
              </button>
            ) : (
              <div className="booking-success-message">
                <p>✓ Booking successful! Redirecting to your bookings...</p>
              </div>
            )}
          </div>
            <ShareButton service={service} />
        </div>
      </div>

      {/* Provider Section */}
      <div className="provider-section">
        <h2 data-aos="fade-down">About the Provider</h2>
        <div className="provider-card" data-aos="zoom-in">
          <img
            src={getProfilePictureUrl()}
            alt={service.provider_name}
            className="provider-avatar"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://isobarscience.com/wp-content/uploads/2020/09/default-profile-picture1.jpg';
            }}
          />
          <div style={{minWidth: '500px'}} className="provider-info">
            <h3 data-aos="fade-right" data-aos-delay="100">{service.provider_name}</h3>
            <p className="provider-specialty" data-aos="fade-right" data-aos-delay="150">{service.service_type} Specialist</p>
            <p className="provider-experience" data-aos="fade-right" data-aos-delay="200">{service.experience_years} years experience</p>
            <p className="provider-description" data-aos="fade-right" data-aos-delay="250">{service.provider_description}</p>
            <div className="provider-stats">
              <div className="stat-item" data-aos="fade-up" data-aos-delay="300">
                <span className="stat-value">{service.completed_jobs || 0}+</span>
                <span className="stat-label">Jobs Done</span>
              </div>
              <div className="stat-item" data-aos="fade-up" data-aos-delay="350">
                <span className="stat-value"><span className="stars">★★★★★</span></span>
                <span className="stat-label">Rating</span>
              </div>
              <div className="stat-item" data-aos="fade-up" data-aos-delay="400">
                <span className="stat-value">{service.response_rate || '100'}%</span>
                <span className="stat-label">Response Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="reviews-section">
        <h2 data-aos="fade-down">Customer Reviews</h2>
        {service.reviews?.length > 0 ? (
          <div className="reviews-list">
            {service.reviews.map((review, index) => (
              <div 
                key={review.review_id} 
                className="review-card"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="review-header">
                  <img
                    src={review.user_image || '/default-avatar.jpg'}
                    alt={review.user_name}
                    className="reviewer-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.jpg';
                    }}
                  />
                  <div className="reviewer-info">
                    <h4>{review.user_name}</h4>
                    <div className="review-meta">
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'filled' : ''}>★</span>
                        ))}
                      </div>
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
                {review.service_image && (
                  <div className="review-image">
                    <img
                      src={review.service_image}
                      alt="Service performed"
                      onClick={() => window.open(review.service_image, '_blank')}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-reviews" data-aos="fade-up">No reviews yet for this service.</p>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingForm && service && (
        <Booking
          service={service}
          bookingDate={bookingDate}
          setBookingDate={setBookingDate}
          specialRequests={specialRequests}
          setSpecialRequests={setSpecialRequests}
          address={address}
          setAddress={setAddress}
          isBooking={isBooking}
          setIsBooking={setIsBooking}
          handleBookingSubmit={handleBookingSubmit}
          setShowBookingForm={setShowBookingForm}
          bookingSuccess={bookingSuccess}
          bookingError={bookingError}
          setBookingError={setBookingError}
          setBookingSuccess={setBookingSuccess}
        />
      )}
    </div>
  );
};

export default ServiceDetail;