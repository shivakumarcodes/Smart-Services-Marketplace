import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/ProviderDetails.css';
import ShareButton from '../components/ShareButton';
import { BASE_URL } from '../api/axiosInstance';

const ProviderDetails = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [price, setPrice] = useState(0);

  // const BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    setPrice(generatePrice());
  }, []);

  const generatePrice = () => {
    const prices = [50, 100, 150];
    const randomIndex = Math.floor(Math.random() * prices.length);
    return prices[randomIndex];
  };

  useEffect(() => {
    const fetchProviderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/providers/${id}`);
        setProvider(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching provider details:', err);
        setError(err.response?.data?.error || 'Failed to load provider details');
        setLoading(false);
      }
    };

    fetchProviderDetails();
  }, [id]);

  // Helper function to safely format rating
  const formatRating = (rating) => {
    if (typeof rating === 'number' && !isNaN(rating)) {
      return rating.toFixed(1);
    }
    return 'No ratings';
  };

  if (loading) {
    return (
      <div className="provider-details-loading">
        <p>Loading provider details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="provider-details-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="provider-details-not-found">
        <p>Provider not found</p>
      </div>
    );
  }

  return (
    <div className="provider-details-container">
      <div className="provider-header">
        <img 
          src={provider.profile_picture_url || '/default-profile.png'} 
          alt={provider.provider_name} 
          className="provider-photo"
        />
        <div className="provider-info">
          <h1>{provider.provider_name}</h1>
          <p className="service-type">{provider.service_type}</p>
          <div className="rating">
            <span className="stars">★★★★★</span>
            <span className="rating-value">{formatRating(provider.rating)}</span>
          </div>
          <ShareButton />
        </div>
      </div>

      <div className="provider-content">
        <section className="about-section">
          <h2>About</h2>
          <p>{provider.description || 'No description available.'}</p>
        </section>

        {provider.services?.length > 0 && (
          <section className="services-section">
            <h2>Services Offered</h2>
            <div className="services-grid">
              {provider.services.map(service => (
                <div key={service.service_id} className="service-card">
                  <h3>{service.service_name}</h3>
                  <p>{service.description}</p>
                  <p className="price">₹{price}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {provider.reviews?.length > 0 && (
          <section className="reviews-section">
            <h2>Customer Reviews</h2>
            <div className="reviews-list">
              {provider.reviews.map(review => (
                <div key={review.review_id} className="review-card">
                  <div className="reviewer-info">
                    <img 
                      src={review.reviewer_photo || '/default-profile.png'} 
                      alt={review.reviewer_name} 
                    />
                    <h4>{review.reviewer_name}</h4>
                  </div>
                  <div className="review-content">
                    <div className="review-rating">
                      {'★'.repeat(Math.floor(review.rating))}{'☆'.repeat(5 - Math.floor(review.rating))}
                    </div>
                    <p>{review.comment}</p>
                    <small>{new Date(review.created_at).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProviderDetails;