import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../styles/Faq.css';

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });
  }, []);

  const faqData = [
    {
      question: "What services can I find on this platform?",
      answer: "You can discover a wide range of local smart services including home cleaning, photography, electricians, plumbing, and many more. All services are provided by verified professionals in your area."
    },
    {
      question: "How do I book a service?",
      answer: "Simply search or browse for a service, view the service details, select an available time slot, provide your address, choose a payment method, and confirm your booking — all from within the platform."
    },
    {
      question: "Who can use this platform?",
      answer: "Our platform is built for three types of users: customers looking to book services, providers offering services, and admins managing platform operations. Each role has its own dedicated dashboard."
    },
    {
      question: "Can I filter or search services easily?",
      answer: "Yes! You can search by service name or location, filter by category, rating, and price range, and sort by popularity or cost. We've designed the listing page to help you find the right service quickly."
    },
    {
      question: "What does the Service Details page include?",
      answer: "Each service page provides a detailed description, images, provider info, pricing, availability calendar, and user reviews. From here, you can directly proceed to book a time slot."
    },
    {
      question: "How do I manage my bookings as a user?",
      answer: "Once logged in, you can access your User Dashboard to view upcoming, completed, or canceled bookings, edit your profile, and leave reviews for completed services."
    },
    {
      question: "I'm a service provider — what tools do I have?",
      answer: "As a provider, your dashboard lets you add or manage services, accept bookings, mark jobs as completed, and respond to user reviews. You can even monitor your service stats."
    },
    {
      question: "Is the platform mobile-friendly?",
      answer: "Yes, our platform is fully responsive and optimized for both desktop and mobile devices, ensuring a smooth experience whether you're browsing, booking, or managing services."
    },
    {
      question: "Do you offer real-time availability and booking validation?",
      answer: "Absolutely. Our calendar system and backend validations prevent booking conflicts and ensure that only available time slots are shown to users."
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes. We use secure JWT-based authentication, encrypted password storage, and role-based access control to protect your personal and payment information."
    },
    {
      question: "What happens after I complete a booking?",
      answer: "Once the service is completed, you'll have the option to leave a review and rating for the provider. You can also view past bookings and invoices in your dashboard."
    },
    {
      question: "How can I get support or report an issue?",
      answer: "You can reach out through our website chat, email, or contact form. For any reported issues or content, our admin team will review and take appropriate action."
    }
  ];

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <h1>Frequently Asked Questions</h1>
      <div className="faq-container">
        <div className="faq-wrapper">
          <div className="faq-questions" data-aos="fade-right">
            <h2 className="faq-title" data-aos="fade-down">Questions</h2>
            <div className="faq-list">
              {faqData.map((faq, index) => (
                <div 
                  key={index} 
                  className="faq-item"
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                >
                  <div className={`faq-mobile ${activeIndex === index ? 'active' : ''}`}>
                    <div className="faq-question-container" onClick={() => toggleFaq(index)}>
                      <div className="faq-question-content">
                        <p className="faq-question-text">{faq.question}</p>
                        <svg
                          className={`faq-icon ${activeIndex === index ? 'rotated' : ''}`}
                          viewBox="0 0 512 512"
                          fill="currentColor"
                        >
                          <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
                        </svg>
                      </div>
                      {activeIndex === index && (
                        <div 
                          className="faq-answer-mobile"
                          data-aos="fade-in"
                          data-aos-delay="100"
                        >
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div 
                    className={`faq-desktop ${activeIndex === index ? 'active' : ''}`}
                    onClick={() => toggleFaq(index)}
                  >
                    <p className="faq-question-desktop" title={faq.question}>
                      {faq.question}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="faq-answers" data-aos="fade-left">
            <h2 className="faq-answers-title" data-aos="fade-down">Answers</h2>
            <div className="faq-answer-box">
              <div className="faq-answer-content">
                {activeIndex !== null ? (
                  <div>
                    <p>{faqData[activeIndex].answer}</p>
                  </div>
                ) : (
                  <p 
                    className="faq-placeholder"
                    data-aos="fade-in"
                  >
                    Select a question to view the answer
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faq;