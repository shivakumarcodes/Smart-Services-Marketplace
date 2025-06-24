import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import '../styles/BookingDetailsModal.css';

const BookingDetailsModal = ({ 
  booking, 
  onClose, 
  onConfirm, 
  onReject, 
  onCancel,
  loading = false 
}) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!booking) return null;

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatAmount = (amount) => {
    try {
      return typeof amount === 'number' ? amount.toFixed(2) : '0.00';
    } catch (error) {
      return '0.00';
    }
  };

  const getStatusClassName = (status) => {
    if (!status) return '';
    return status.toLowerCase().replace(/\s+/g, '-');
  };

  const canConfirm = booking.status === 'pending';
  const canReject = booking.status === 'pending';
  const canCancel = ['pending', 'confirmed'].includes(booking.status);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="booking-details-modal" ref={modalRef}>
        <div className="modal-header">
          <h2 id="modal-title">Booking Details</h2>
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label="Close modal"
            disabled={loading}
          >
            ×
          </button>
        </div>
        
        <div className="amodal-content">
          <div className="booking-info">
            <h3 style={{fontSize: '2rem', fontWeight: 'bold'}}>{booking.serviceTitle || 'Service Title Not Available'}</h3>
            <div className="booking-details-grid">
              <p><strong>Booking ID:</strong> {booking.id || 'N/A'}</p>
              <p><strong>Customer:</strong> {booking.customerName || 'N/A'}</p>
              <p><strong>Date:</strong> {formatDate(booking.date)}</p>
              <p>
                <strong>Status:</strong> 
                <span className={`status-badge ${getStatusClassName(booking.status)}`}>
                  {booking.status || 'Unknown'}
                </span>
              </p>
              <p>
                <strong>Payment Status:</strong> 
                <span className={`payment-status ${getStatusClassName(booking.paymentStatus)}`}>
                  {booking.paymentStatus || 'Unknown'}
                </span>
              </p>
              <p><strong>Amount:</strong> ₹{formatAmount(booking.amount)}</p>
            </div>
            
            {booking.address && (
              <div className="booking-address">
                <h4 style={{display: 'flex',justifyContent: 'center'}}>Service Address:</h4>
                <div className="address-details">
                  {(booking.address) && (
                    <p>
                      {booking.address}
                    </p>
                  )}
                </div>
              </div>
            )}

            {booking.notes && (
              <div className="booking-notes">
                <h4>Notes:</h4>
                <p>{booking.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

BookingDetailsModal.propTypes = {
  booking: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    serviceTitle: PropTypes.string,
    customerName: PropTypes.string,
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    status: PropTypes.string,
    paymentStatus: PropTypes.string,
    amount: PropTypes.number,
    address: PropTypes.shape({
      street: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      zipCode: PropTypes.string,
    }),
    notes: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  onReject: PropTypes.func,
  onCancel: PropTypes.func,
  loading: PropTypes.bool,
};

export default BookingDetailsModal;