import React, { useState } from 'react';
import '../styles/TestimonialCard.css';

const TestimonialCarousel = () => {
  const testimonials = [
    {
      id: 1,
      name: "Shashi",
      role: "Home Cleaning Customer",
      company: "Hyderabad",
      quote: "Booked a deep cleaning service — super professional and hassle-free from start to finish!",
      image: "https://res.cloudinary.com/do5aecy6u/image/upload/v1750144941/smart-services-users/1750144939730-IMG_20230219_221435_539.jpg",
      gradient: "white"
    },
    {
      id: 2,
      name: "Priya",
      role: "Freelance Beautician",
      company: "Smart Services Provider",
      quote: "This platform helped me reach new clients every week. Easy bookings and great support!",
      image: "https://randomuser.me/api/portraits/women/33.jpg",
      gradient: "white"
    },
    {
      id: 3,
      name: "Rajesh",
      role: "Electrician",
      company: "LocalFix Services",
      quote: "I get most of my work through this site now. Timely payments and trusted customers!",
      image: "https://res.cloudinary.com/do5aecy6u/image/upload/v1748090368/smart-services-users/ayu1hmjbb9onfnzbfoec.jpg",
      gradient: "white"
    },
    {
      id: 4,
      name: "Anita",
      role: "Event Photography Customer",
      company: "Bangalore",
      quote: "Hired a photographer for my daughter’s birthday — amazing photos and easy coordination.",
      image: "https://randomuser.me/api/portraits/women/42.jpg",
      gradient: "white"
    },
    {
      id: 5,
      name: "Vikram",
      role: "Pest Control Specialist",
      company: "BugFree Experts",
      quote: "This marketplace gives me consistent bookings and a professional edge over competitors.",
      image: "https://randomuser.me/api/portraits/men/65.jpg",
      gradient: "white"
    },
    {
      id: 6,
      name: "Shiva Kumar",
      role: "Customer",
      company: "Secunderabad",
      quote: "Used the platform for AC servicing — technician arrived on time and solved everything smoothly.",
      image: "https://res.cloudinary.com/do5aecy6u/image/upload/v1749970647/smart-services-users/1749970645657-WhatsApp%20Image%202024-09-11%20at%2018.jpg",
      gradient: "white"
    }
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const handleThumbnailClick = (index) => {
    setActiveTestimonial(index);
  };

  return (
    <div className="testimonial-carousel">
      {/* Main Testimonial Display */}
      <div className="testimonial-main">
        <div className="testimonial-card">
          <div className="testimonial-image">
            <img
              src={testimonials[activeTestimonial].image}
              alt={`${testimonials[activeTestimonial].name} Profile`}
              loading="lazy"
            />
          </div>
          <div style={{color: 'white'}} className="testimonial-content">
            <p style={{color: 'white'}} className="testimonial-quote">
              {testimonials[activeTestimonial].quote}
            </p>
            <div style={{color: 'white'}} className="testimonial-author">
              <p style={{color: 'white'}} className="author-name">
                {testimonials[activeTestimonial].name}
              </p>
              <div style={{color: 'white'}} className="author-info">
                <span style={{color: 'white'}} className="role-title">{testimonials[activeTestimonial].role}</span><br />
                {/* {testimonials[activeTestimonial].company} */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail Grid */}
      <div className="testimonial-thumbnails">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className={`thumbnail ${index === activeTestimonial ? 'active' : ''} ${testimonial.gradient}`}
            onClick={() => handleThumbnailClick(index)}
            title={`View testimonial from ${testimonial.name}`}
          >
            <img
              src={testimonial.image}
              alt={`${testimonial.name} Thumbnail`}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;
