import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../components/ToastContext';
import { BASE_URL } from '../api/axiosInstance';
import BookingDetailsModal from '../components/BookingDetailsModal';
import '../styles/ProviderDashboard.css';

const ProviderDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    provider: null,
    services: [],
    bookings: [],
    stats: {}
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const getProfilePictureUrl = () => {
    if (dashboardData.provider?.profilePicture) {
      return dashboardData.provider.profilePicture.startsWith('http')
        ? dashboardData.provider.profilePicture
        : `${BASE_URL}${dashboardData.provider.profilePicture}`;
    }
    return 'https://isobarscience.com/wp-content/uploads/2020/09/default-profile-picture1.jpg';
  };

  const getServiceImageUrl = (imagePath) => {
    if (!imagePath) return 'https://bluetree.com.au/wp-content/uploads/2016/10/DBlue_Services.png';
    return imagePath.startsWith('http') ? imagePath : `${BASE_URL}${imagePath}`;
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        showToast('Authentication required. Please log in again.', 'error');
        navigate('/login');
        return;
      }

      let endpoint;
      let method = 'PUT';
      let payload = {};

      // Determine the correct endpoint and payload based on action
      switch (action) {
        case 'confirm':
          endpoint = `${BASE_URL}/api/provider/bookings/${bookingId}`;
          payload = { action: 'confirm' };
          break;
        case 'reject':
          endpoint = `${BASE_URL}/api/provider/bookings/${bookingId}`;
          payload = { action: 'cancel' }; // Backend expects 'cancel' for reject
          break;
        case 'cancel':
          endpoint = `${BASE_URL}/api/provider/bookings/${bookingId}`;
          payload = { action: 'cancel' };
          break;
        default:
          throw new Error(`Invalid action: ${action}`);
      }

      const response = await axios({
        method,
        url: endpoint,
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        // Find the booking to reference in toast
        const booking = dashboardData.bookings.find(b => b.id === bookingId);
        
        // Determine new status based on action
        let newStatus;
        switch (action) {
          case 'confirm':
            newStatus = 'confirmed';
            break;
          case 'reject':
          case 'cancel':
            newStatus = 'cancelled';
            break;
          default:
            newStatus = booking?.status;
        }
        
        // Update the local state
        setDashboardData(prev => ({
          ...prev,
          bookings: prev.bookings.map(b => 
            b.id === bookingId 
              ? { ...b, status: newStatus }
              : b
          )
        }));
        
        // Show success toast
        const actionText = action === 'confirm' ? 'confirmed' : 
                          action === 'reject' ? 'rejected' : 'cancelled';
        showToast(
          `Booking for ${booking?.serviceTitle || 'service'} has been ${actionText}!`, 
          'success'
        );
      } else {
        throw new Error(response.data.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      
      let errorMessage = 'Failed to update booking.';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
          localStorage.removeItem('token');
          navigate('/login');
          return;
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (error.response.status === 404) {
          errorMessage = 'Booking not found.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network error. Please check your connection.';
      } else {
        // Something else happened
        errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const handleCloseModal = () => {
    setShowBookingModal(false);
    setSelectedBooking(null);
  };

  const handleConfirmBooking = async (bookingId) => {
    await handleBookingAction(bookingId, 'confirm');
    setShowBookingModal(false);
  };

  const handleRejectBooking = async (bookingId) => {
    await handleBookingAction(bookingId, 'reject');
    setShowBookingModal(false);
  };

  const handleCancelBooking = async (bookingId) => {
    await handleBookingAction(bookingId, 'cancel');
    setShowBookingModal(false);
  };

  // Handle provider approval status notifications
  const checkProviderApprovalStatus = (provider) => {
    try {
      const previousStatus = localStorage.getItem('providerApprovalStatus');
      const currentStatus = provider.isApproved ? 'approved' : 'pending';
      
      localStorage.setItem('providerApprovalStatus', currentStatus);
      
      if (!previousStatus) {
        return;
      }
      
      if (previousStatus === 'pending' && currentStatus === 'approved') {
        showToast(
          'Congratulations! Your provider account has been approved! You can now start offering services.', 
          'success', 
          8000
        );
      }
      
      if (previousStatus === 'approved' && currentStatus === 'pending') {
        showToast(
          'Your provider approval status has been changed. Please contact support for more information.', 
          'warning', 
          8000
        );
      }
    } catch (error) {
      console.error('Error checking provider approval status:', error);
    }
  };

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${BASE_URL}/api/provider/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // console.log('Dashboard data:', response.data);

        const transformedData = {
          provider: {
            ...response.data.provider,
            profilePicture: response.data.provider.profilePicture || 
              "https://isobarscience.com/wp-content/uploads/2020/09/default-profile-picture1.jpg",
          },
          services: (response.data.services || []).map(service => ({
            id: service.id,
            title: service.serviceTitle,
            description: service.description,
            category: service.serviceType,
            price: service.basePrice || 0,
            duration: service.durationMinutes || 0,
            isActive: service.isActive,
            image: service.imageUrl || 
              'https://bluetree.com.au/wp-content/uploads/2016/10/DBlue_Services.png'
          })),
          bookings: (response.data.recentBookings || []).map(booking => ({
            id: booking.id,
            serviceId: booking.serviceId,
            customerId: booking.customerId,
            customerName: booking.customerName,
            serviceTitle: booking.serviceTitle,
            date: new Date(booking.bookingDate),
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            amount: booking.totalAmount || 0,
            address: booking.address,
            notes: booking.notes
          })),
          stats: response.data.stats || {}
        };

        setDashboardData(transformedData);
        checkProviderApprovalStatus(response.data.provider);
        
      } catch (error) {
        console.error('Error fetching provider data:', error);
        
        let errorMessage = 'Failed to load dashboard. Please try again.';
        
        if (error.response?.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
          localStorage.removeItem('token');
          navigate('/login');
          return;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        setError(errorMessage);
        showToast(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, [navigate, showToast]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!dashboardData.provider) {
    return (
      <div className="not-found-container">
        <h2>Provider Not Found</h2>
        <p>We couldn't find your provider information.</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="provider-dashboard">
      <div className="dashboard-content">
        {/* Provider Info Card */}
        <div className="provider-info-card">
          <div className="profile-section">
            <img 
              src={getProfilePictureUrl()} 
              alt="Profile" 
              className="profile-image"
              onError={(e) => {
                e.target.src = 'https://isobarscience.com/wp-content/uploads/2020/09/default-profile-picture1.jpg';
              }}
            />
            <div className="profile-details">
              <h3>{dashboardData.provider.name}</h3>
              <p><strong>Email:</strong> {dashboardData.provider.email}</p>
              <p><strong>Phone:</strong> {dashboardData.provider.phone || 'Not provided'}</p>
              <p><strong>Service Type:</strong> {dashboardData.provider.serviceType}</p>
              <span className={`approval-status ${dashboardData.provider.isApproved ? 'approved' : 'pending'}`}>
                {dashboardData.provider.isApproved ? 'Approved' : 'Pending Approval'}
              </span>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <section className="bookings-section">
          <div className="section-header">
            <h2>Recent Bookings</h2>
            <button 
              className="view-all-btn"
              disabled
              // onClick={() => navigate('/my-bookings')}
            >
              View All
            </button>
          </div>

          {dashboardData.bookings.length > 0 ? (
            <div className="bookings-list">
              {dashboardData.bookings.slice(-6).map(booking => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <h3>{booking.serviceTitle}</h3>
                    <span className={`status-badge ${booking.status?.toLowerCase() || ''}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="booking-details">
                    <p><strong>Customer:</strong> {booking.customerName}</p>
                    <p><strong>Date:</strong> {booking.date.toLocaleString()}</p>
                    <p><strong>Amount:</strong> ${booking.amount.toFixed(2)}</p>
                    <p><strong>Payment:</strong> 
                      <span className={`payment-status ${booking.paymentStatus?.toLowerCase() || ''}`}>
                        {booking.paymentStatus}
                      </span>
                    </p>
                  </div>
                  <div className="booking-actions">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => handleViewDetails(booking)}
                      disabled={actionLoading}
                    >
                      View Details
                    </button>
                    {booking.status === 'pending' && (
                      <>
                        <button 
                          className="action-btn confirm-btn"
                          onClick={() => handleBookingAction(booking.id, 'confirm')}
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Processing...' : 'Confirm'}
                        </button>
                        <button 
                          className="action-btn cancel-btn"
                          onClick={() => handleBookingAction(booking.id, 'cancel')}
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Processing...' : 'Cancel'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-bookings">
              <p>You don't have any bookings yet.</p>
            </div>
          )}
        </section>

        {/* Services Section */}
        <section className="services-section">
          <div className="section-header">
            <h2>Your Services</h2>
            <button 
              className="add-service-btn"
              onClick={() => navigate('/provider/services/new')}
            >
              + Add New Service
            </button>
          </div>

          <div className="services-grid">
            {dashboardData.services.length > 0 ? (
              dashboardData.services.map(service => (
                <div style={{height: '330px'}} key={service.id} className="service-card">
                  <div className="service-image-container">
                    <img 
                      src={getServiceImageUrl(service.image)} 
                      alt={service.title}
                      onError={(e) => {
                        e.target.src = 'https://bluetree.com.au/wp-content/uploads/2016/10/DBlue_Services.png';
                      }}
                    />
                  </div>
                  <div className="service-info">
                    <h3>{service.title}</h3>
                    <p className="service-description">{service.description}</p>
                    <div className="service-meta">
                      <span>₹{service.price.toFixed(2)}</span>
                      <span>{service.duration} mins</span>
                      <span className={`status ${service.isActive ? 'active' : 'inactive'}`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-services">
                <p>You haven't added any services yet.</p>
                <button 
                  className="add-service-btn"
                  onClick={() => navigate('/provider/services/new')}
                >
                  Create Your First Service
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <BookingDetailsModal 
          booking={selectedBooking}
          onClose={handleCloseModal}
          onConfirm={handleConfirmBooking}
          onReject={handleRejectBooking}
          onCancel={handleCancelBooking}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default ProviderDashboard;