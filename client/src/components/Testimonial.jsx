import React, { memo } from 'react';
import '../styles/TestimonialCard.css';

const Testimonial = () => {
  return (
    <figure className="testimonial-card" aria-label="User testimonial">
      <div className="quote-curve" aria-hidden="true">
        <svg
          width="100"
          height="80"
          viewBox="0 0 100 80"
          className="quote-svg"
          role="img"
          aria-label="Decorative quote curve"
        >
          <title>Quote Decorative Curve</title>
          <path 
            d="M20,0 Q50,20 80,0" 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="2"
          />
        </svg>
        <span className="quote-mark">"</span>
      </div>

      <blockquote className="testimonial-text">
        Booking a plumber was quick and easy. The service provider was professional and did a great job!
      </blockquote>

      <figcaption className="testimonial-author">
        <div className="author-info">
          <span className="author-name">Srivani</span>
          <span className="author-role">Homeowner</span>
        </div>
      </figcaption>
    </figure>
  );
};

export default memo(Testimonial);