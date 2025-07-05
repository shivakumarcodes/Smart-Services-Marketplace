import React, { memo } from 'react';
import PropTypes from 'prop-types';
import '../styles/FeaturedServiceCard.css';

const colors = ['#FF6B6B', '#6BCB77', '#4D96FF', '#FFD93D', '#845EC2', '#00C9A7'];
const fallbackImg = 'https://isobarscience.com/wp-content/uploads/2020/09/default-profile-picture1.jpg';

const FeaturedServiceCard = ({
  index,
  providerPhoto = '',
  providerName,
  provider_id,
  serviceType,
  experience_years = 0,
  rating = 4,
  onClick,
  isLoading = false,
  handleProviderClick
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const renderStars = (ratingValue) => {
    const numericRating = typeof ratingValue === 'number' && !isNaN(ratingValue)
      ? Math.min(Math.max(ratingValue, 0), 5)
      : 0;

    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.5;

    return (
      <div
        className="provider-rating"
        aria-label={`Rating: ${numericRating.toFixed(1)} out of 5`}
      >
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <span key={i} className="star filled">★</span>;
          }
          if (i === fullStars && hasHalfStar) {
            return <span key={i} className="star half">★</span>;
          }
          return <span key={i} className="star empty">★</span>;
        })}
        <span className="rating-value">{numericRating.toFixed(1)}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="featured-card loading">
        <div className="provider-photo-container shimmer"></div>
        <div className="provider-info">
          <div className="provider-name shimmer"></div>
          <div className="provider-category shimmer"></div>
          <div className="provider-category shimmer"></div>
          <div className="provider-category shimmer"></div>
          <div className="provider-rating shimmer"></div>
        </div>
      </div>
    );
  }

  return (
    <article
      className="featured-card"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex="0"
      role="button"
      aria-pressed="false"
      aria-label={`View details for ${providerName}, ${serviceType} provider`}
    >
      <div className="provider-photo-wrapper">
        <div
          style={{ backgroundColor: colors[index % colors.length], borderRadius: '0' }}
          className="provider-photo-bg"
        >
          <img
            src={providerPhoto || fallbackImg}
            alt={providerPhoto ? `${providerName}` : 'Default provider avatar'}
            className="provider-photo"
            loading="lazy"
            onError={(e) => {
              e.target.src = fallbackImg;
              e.target.alt = 'Default provider avatar';
            }}
          />
        </div>
      </div>

      <div className="aprovider-info">
        <h3 className="provider-name">{providerName}</h3>
        <p className="provider-category">{serviceType}</p>
        {renderStars(rating)}
        <p className="experience-info">{experience_years} years of experience</p>
        <a className='connect-button' onClick={() => handleProviderClick(provider_id)}>View Profile</a>
      </div>
    </article>
  );
};

FeaturedServiceCard.propTypes = {
  index: PropTypes.number.isRequired,
  providerPhoto: PropTypes.string,
  providerName: PropTypes.string.isRequired,
  serviceType: PropTypes.string.isRequired,
  experience_years: PropTypes.number,
  rating: PropTypes.number,
  onClick: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export default memo(FeaturedServiceCard);