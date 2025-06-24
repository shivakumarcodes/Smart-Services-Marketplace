import ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';
import { BASE_URL } from '../api/axiosInstance';
import '../styles/Booking.css';

const Booking = ({
  service,
  bookingDate = '',
  setBookingDate = () => {},
  specialRequests = '',
  setSpecialRequests = () => {},
  address = '',
  setAddress = () => {},
  isBooking = false,
  setIsBooking = () => {},
  setShowBookingForm = () => {},
  bookingSuccess = false,
  bookingError = '',
  setBookingError = () => {},
  setBookingSuccess = () => {}
}) => {
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Function to calculate minimum date/time (now + 1 hour)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Simple JWT token validation without external library
  const isTokenValid = (token) => {
    if (!token) return false;
    
    try {
      // Split JWT token into parts
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Decode payload (middle part)
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  // Fetch user data to pre-fill address if it's not already set
  useEffect(() => {
    const fetchUserAddress = async () => {
      if (!address || !address.trim()) {
        try {
          const token = localStorage.getItem('token');
          if (!token || !isTokenValid(token)) return;

          const response = await fetch(`${BASE_URL}/api/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            if (userData.address) {
              setAddress(userData.address);
            }
          }
        } catch (err) {
          console.error('Error fetching user address:', err);
        }
      }
    };
    
    fetchUserAddress();
  }, [address, setAddress]);

  // Create Razorpay order
  const createRazorpayOrder = async (bookingData) => {
    try {
      const token = localStorage.getItem('token');
      
      // Verify token exists and is valid
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      if (!isTokenValid(token)) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please login again.');
      }

      const response = await fetch(`${BASE_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(service.base_price),
          currency: 'INR',
          bookingData: {
            serviceId: bookingData.serviceId,
            providerId: bookingData.providerId,
            bookingDate: bookingData.bookingDate,
            specialRequests: bookingData.specialRequests || null,
            address: bookingData.address,
            totalAmount: parseFloat(service.base_price)
          }
        })
      });

      if (response.status === 401) {
        // Token likely expired or invalid
        localStorage.removeItem('token');
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Payment failed');
      }

      return data;
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  };

  // Create cash booking function
  const createCashBooking = async (bookingData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !isTokenValid(token)) {
        throw new Error('Session expired. Please login again.');
      }

      const response = await fetch(`${BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...bookingData,
          paymentMethod: 'cash',
          paymentStatus: 'pending'
        })
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Booking failed');
      }

      return data;
    } catch (error) {
      console.error('Cash booking error:', error);
      throw error;
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setBookingError('');
    setIsBooking(true);

    try {
      // Validate service data
      if (!service?.service_id || !service?.provider_id) {
        throw new Error('Service information is incomplete');
      }

      if (!bookingDate) {
        throw new Error('Please select a booking date and time');
      }

      if (!address?.trim()) {
        throw new Error('Please provide a service address');
      }

      // Check token validity before proceeding
      const token = localStorage.getItem('token');
      if (!token || !isTokenValid(token)) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please login again.');
      }

      // Prepare booking data
      const bookingData = {
        serviceId: service.service_id,
        providerId: service.provider_id,
        bookingDate: bookingDate,
        specialRequests: specialRequests || null,
        address: address.trim(),
        totalAmount: parseFloat(service.base_price)
      };

      // console.log('Submitting booking with data:', bookingData);

      if (paymentMethod === 'online') {
        setIsProcessingPayment(true);
        const orderData = await createRazorpayOrder(bookingData);
        const paymentResult = await handleRazorpayPayment(orderData, bookingData);
        
        setBookingSuccess(true);
        setTimeout(() => {
          window.location.href = '/profile';
        }, 2000);
      } else {
        // Handle cash payment
        const response = await createCashBooking(bookingData);
        setBookingSuccess(true);
        setTimeout(() => {
          window.location.href = '/profile';
        }, 2000);
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsBooking(false);
      setIsProcessingPayment(false);
    }
  };

  // Handle Razorpay payment
  const handleRazorpayPayment = async (orderData, bookingData) => {
    const isScriptLoaded = await loadRazorpayScript();
    
    if (!isScriptLoaded) {
      throw new Error('Failed to load payment gateway');
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: 'rzp_test_LRcf9QsPNG7mdZ', // Add this to your .env file
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Smart Services',
        description: `Payment for ${service.title}`,
        order_id: orderData.id,
        handler: async (response) => {
          try {
            // Verify payment on backend
            const token = localStorage.getItem('token');
            const verifyResponse = await fetch(`${BASE_URL}/api/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingData: bookingData
              })
            });

            const verifyData = await verifyResponse.json();
            if (verifyResponse.ok) {
              resolve(verifyData);
            } else {
              reject(new Error(verifyData.message || 'Payment verification failed'));
            }
          } catch (error) {
            reject(error);
          }
        },
        prefill: {
          name: '', // Will be filled from user data
          email: '', // Will be filled from user data
          contact: '' // Will be filled from user data
        },
        theme: {
          color: '#007bff'
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment cancelled by user'));
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  // Add portal root validation
  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) {
    console.error('Portal root element not found. Make sure you have a div with id="portal-root" in your HTML.');
    return null;
  }

  return ReactDOM.createPortal(
    <div className="booking-overlay" onClick={() => setShowBookingForm(false)}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        {/* <button className="close-btn" onClick={() => setShowBookingForm(false)}>×</button> */}
        
        <div className="booking-modal-header">
          <h3>Book This Service</h3>
        </div>
        
        {bookingSuccess ? (
          <div className="booking-success">
            <p>✓ Booking successful! Redirecting to your bookings...</p>
          </div>
        ) : (
          <>
            <div className="service-summary">
              <img
                src="https://placehold.co/400x300.png?text=Service+Image&font=roboto" 
                alt={service?.title || 'Service'} 
                className="service-thumbnail"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = '/default-service.jpg';
                }}
              />
              <div className="service-info">
                <h4>{service?.title || 'Service'}</h4>
                <div className="service-details">
                  <p className="provider-name">By {service?.provider_name || 'Provider'}</p>
                  <p className="service-price">₹{service?.base_price || 0}</p>
                  <p className="service-duration">{service?.duration_minutes || 0} mins</p>
                </div>
              </div>
            </div>
          
            {bookingError && <div className="error-message">{bookingError}</div>}
            
            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label htmlFor="booking-date">Date & Time*</label>
                <input
                  id="booking-date"
                  type="datetime-local"
                  value={bookingDate || ''}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={getMinDateTime()}
                  required
                />
                <small>Please select a date and time for your service</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="service-address">Service Address*</label>
                <input
                  id="service-address"
                  type="text"
                  value={address || ''}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Balanagar,Hyderabad (Where should the service be performed?)"
                  required
                />
                <small>Provide the complete address where you need this service</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="special-requests">Special Requests</label>
                <textarea
                  id="special-requests"
                  value={specialRequests || ''}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special instructions for the provider"
                  rows={4}
                />
                <small>Optional: Provide any specific requirements or details</small>
              </div>

              {/* Payment Method Selection */}
              <div className="form-group">
                <label>Payment Method*</label>
                <div className="payment-methods">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Pay Online (UPI, Card, Wallet)</span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Cash on Service</span>
                  </label>
                </div>
              </div>
              
              <div className="booking-summary">
                <h4>Booking Summary</h4>
                <div className="summary-row">
                  <span>Service Fee:</span>
                  <span>₹{service?.base_price || 0}</span>
                </div>
                {paymentMethod === 'online' && (
                  <div className="summary-row">
                    <span>Convenience Fee:</span>
                    <span>₹0</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>₹{service?.base_price || 0}</span>
                </div>
                <div className="payment-info">
                  {paymentMethod === 'online' ? (
                    <small>💳 Secure payment via Razorpay</small>
                  ) : (
                    <small>💵 Pay in cash when service is completed</small>
                  )}
                </div>
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBooking || isProcessingPayment}
                  className="confirm-btn"
                >
                  {isProcessingPayment 
                    ? 'Processing Payment...' 
                    : isBooking 
                    ? 'Processing...' 
                    : paymentMethod === 'online' 
                    ? 'Pay & Book' 
                    : 'Confirm Booking'
                  }
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>,
    portalRoot
  );
};

export default Booking;