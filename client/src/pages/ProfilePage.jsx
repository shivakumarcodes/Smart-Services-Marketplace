import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../components/ToastContext';
import '../styles/ProfilePage.css';
import { BASE_URL } from '../api/axiosInstance';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../styles/MyBookings.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profilePicture: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please login to access your profile', 'warning');
        navigate('/login');
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setProfile(response.data);
      setProfileImageError(false);
      setFormData({
        name: response.data.name,
        phone: response.data.phone || '',
        profilePicture: null
      });
      
      if (response.data.role === 'provider' && response.data.provider) {
        checkProviderApprovalStatus(response.data.provider);
      }
      
      showToast('Profile loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      const errorMsg = error.response?.data?.message || 'Failed to load profile. Please try again later.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      
      if (error.response?.status === 401) {
        showToast('Session expired. Please login again', 'warning');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const checkProviderApprovalStatus = (provider) => {
    const previousStatus = localStorage.getItem('providerApprovalStatus');
    const currentStatus = provider.is_approved ? 'approved' : 'pending';
    
    localStorage.setItem('providerApprovalStatus', currentStatus);
    
    if (!previousStatus) return;
    
    if (previousStatus === 'pending' && currentStatus === 'approved') {
      showToast('Congratulations! Your provider account has been approved! You can now start offering services.', 'success', 8000);
    }
    
    if (previousStatus === 'approved' && currentStatus === 'pending') {
      showToast('Your provider approval status has been changed. Please contact support for more information.', 'warning', 8000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please login to update your profile', 'warning');
        navigate('/login');
        return;
      }
      
      const formDataToSend = new FormData();
      
      if (formData.name !== profile.name) {
        formDataToSend.append('name', formData.name);
      }
      
      if (formData.phone !== profile.phone) {
        formDataToSend.append('phone', formData.phone);
      }
      
      if (formData.profilePicture) {
        formDataToSend.append('profilePicture', formData.profilePicture);
      }
      
      if (formDataToSend.entries().next().done) {
        setIsEditing(false);
        setPreviewImage(null);
        showToast('No changes were made', 'info');
        return;
      }

      const response = await axios.put(`${BASE_URL}/api/profile`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProfile(response.data);
      setProfileImageError(false);
      setIsEditing(false);
      setPreviewImage(null);
      
      setFormData({
        name: response.data.name,
        phone: response.data.phone || '',
        profilePicture: null
      });
      
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to update profile:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update profile. Please try again later.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getInitial = (name) => {
    if (!name || typeof name !== 'string') return '';
    const trimmedName = name.trim();
    return trimmedName.length > 0 ? trimmedName.charAt(0).toUpperCase() : '';
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Unknown date';
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString || 'Unknown date';
    }
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'status-pending';
    switch (status.toLowerCase()) {
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getProfilePictureUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  const handleProfileImageError = () => {
    setProfileImageError(true);
  };

  if (loading && !profile) {
    return (
      <div className="loading-container" data-aos="fade-in">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container" data-aos="fade-in">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchProfile} className="retry-button">Try Again</button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="not-found-container" data-aos="fade-in">
        <h2>Profile Not Found</h2>
        <p>We couldn't find your profile information.</p>
        <button onClick={() => navigate('/login')} className="login-button">Go to Login</button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="profile-container">
        <h2 data-aos="fade-down">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="edit-profile-form" data-aos="fade-up">
          <div className="form-group" data-aos="fade-right" data-aos-delay="100">
            <label>Name</label>
            <input 
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group" data-aos="fade-right" data-aos-delay="150">
            <label>Phone</label>
            <input 
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          
          <div className="form-group" data-aos="fade-right" data-aos-delay="200">
            <label>Profile Picture</label>
            <div className="image-upload-container">
              {(previewImage || profile.profilePicture) && (
                <img 
                  src={previewImage || getProfilePictureUrl(profile.profilePicture)} 
                  alt="Profile preview" 
                  className="profile-preview"
                />
              )}
              <input 
                type="file"
                name="profilePicture"
                onChange={handleFileChange}
                accept="image/*"
                disabled={loading}
              />
            </div>
          </div>
          
          {error && <div className="form-error">{error}</div>}
          
          <div className="form-actions" data-aos="fade-up" data-aos-delay="250">
            <button 
              type="submit" 
              className="save-button"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => {
                setIsEditing(false);
                setPreviewImage(null);
                setFormData({
                  name: profile.name,
                  phone: profile.phone || '',
                  profilePicture: null
                });
                showToast('Editing cancelled', 'info');
              }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className='div-head'>
        <div className="profile-header" data-aos="fade-down">
        {profile.profilePicture && !profileImageError ? (
          <img
            src={getProfilePictureUrl(profile.profilePicture)}
            alt={profile.name}
            className="profile-avatar"
            onError={handleProfileImageError}
            data-aos="zoom-in"
          />
        ) : (
          <div className="profile-avatar-initial" data-aos="zoom-in">
            {getInitial(profile.name)}
          </div>
        )}
        <h1 data-aos="fade-up" data-aos-delay="100">{profile.name}</h1>
        <p className="user-email" data-aos="fade-up" data-aos-delay="150">{profile.email}</p>
        {profile.phone && <p className="user-phone" data-aos="fade-up" data-aos-delay="200">{profile.phone}</p>}
        <div className="user-status" data-aos="fade-up" data-aos-delay="250">
          <span className={`role-badge ${profile.role}`}>{profile.role}</span>
          {profile.isVerified && <span className="verified-badge">Verified</span>}
        </div>
      </div>
      </div>

      <div className='div-head'>
        {profile.role === 'provider' && profile.provider && (
        <div className="provider-info" data-aos="fade-up" data-aos-delay="300">
          <h2>Provider Information</h2>
          <div className="provider-details">
            <p data-aos="fade-right" data-aos-delay="350"><strong>Service Type:</strong> {profile.provider.service_type || 'Not specified'}</p>
            <p data-aos="fade-right" data-aos-delay="400"><strong>Experience:</strong> {profile.provider.experience_years || 0} years</p>
            <p data-aos="fade-right" data-aos-delay="450"><strong>Rating:</strong> {profile.provider.rating ? `${profile.provider.rating}/5` : 'No ratings yet'}</p>
            <p data-aos="fade-right" data-aos-delay="500"><strong>Status:</strong> {profile.provider.is_approved ? 'Approved' : 'Pending Approval'}</p>
            {profile.provider.description && (
              <div className="provider-description" data-aos="fade-up" data-aos-delay="550">
                <h3>About</h3>
                <p>{profile.provider.description}</p>
              </div>
            )}
          </div>

          {profile.provider.services && profile.provider.services.length > 0 && (
            <div className="provider-services" data-aos="fade-up" data-aos-delay="600">
              <h3>My Services</h3>
              <div className="services-grid">
                {profile.provider.services.map((service, index) => (
                  <div 
                    key={service.service_id} 
                    className="service-card"
                    data-aos="fade-up"
                    data-aos-delay={100 + (index * 100)}
                  >
                    {service.primary_image_url && (
                      <img 
                        src={getProfilePictureUrl(service.primary_image_url)} 
                        alt={service.title}
                        className="service-image"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <h4>{service.title}</h4>
                    <p className="service-category">{service.category}</p>
                    <p className="service-price">₹{service.base_price?.toFixed(2) || '0.00'}</p>
                    {service.duration_minutes && (
                      <p className="service-duration">{service.duration_minutes} minutes</p>
                    )}
                    {service.is_active === false && <span className="inactive-badge">Inactive</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      </div>

      {profile.bookings && profile.bookings.length > 0 && (
          <div style={{padding: '1.5rem'}} className="bookings-grid">
            <h1 style={{textShadow: '2px 2px 8px rgba(0, 0, 0, 0.3)'}} className='popular-categories-title'>My Bookings</h1>
            <div className="bookings-list">
              {profile.bookings.slice(0, showAllBookings ? 9 : 6).map((booking, index) => (
                <div 
                  key={booking.booking_id} 
                  className="booking-card"
                  data-aos="fade-up"
                  data-aos-delay={100}
                >
                  <div className="booking-header">
                    <h3>{booking.service_title || 'Unknown Service'}</h3>
                    <span className={`booking-status ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status || 'pending'}
                    </span>
                  </div>
                  <div className="booking-details">
                    <p><strong>Provider:</strong> {booking.provider_name || 'Unknown Provider'}</p>
                    <p><strong>Date:</strong> {formatDate(booking.booking_date)}</p>
                    <p><strong>Address:</strong> {booking.address || 'Not specified'}</p>
                    <p><strong>Amount:</strong> ₹{booking.total_amount?.toFixed(2) || '0.00'}</p>
                    <p><strong>Payment:</strong> 
                      <span className={`payment-status ${booking.payment_status || 'pending'}`}>
                        {booking.payment_status || 'pending'}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {profile.bookings.length > 4 && (
              <button 
                className="show-all-btn" 
                onClick={() => setShowAllBookings(!showAllBookings)}
              >
                {showAllBookings ? 'Show Less' : 'Show All'}
              </button>
            )}
          </div>
        )}

      <div className="profile-actions">
        <button 
          onClick={() => {
            setIsEditing(true);
            showToast('Editing profile', 'info');
          }} 
          className="edit-button"
          disabled={loading}
        >
          Edit Profile
        </button>
        {profile.role === 'provider' && (
          <button 
            onClick={() => {
              navigate('/services/manage');
              showToast('Navigating to services management', 'info');
            }} 
            className="manage-services-button"
            disabled={loading}
          >
            Manage Services
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;