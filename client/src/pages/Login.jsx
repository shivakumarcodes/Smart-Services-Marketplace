import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';
import { BASE_URL } from '../api/axiosInstance';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    });
  }, []);

  // Guest login credentials
  const guestCredentials = {
    user: { email: 'user@gmail.com', password: 'password123' },
    provider: { email: 'provider@gmail.com', password: 'password123' },
    admin: { email: 'admin@smartservices.com', password: 'password123' }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors = {};
        
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
        
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const performLogin = async (credentials) => {
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const response = await axios.post(`${BASE_URL}/api/login`, credentials);

      if (response.data.token) {
        login(response.data.token);
        navigate('/profile');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setErrors({ api: err.response.data.message });
      } else {
        setErrors({ api: 'Login failed. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
        
    if (!validate()) return;
        
    await performLogin(formData);
  };

  const handleGuestLogin = async (userType) => {
    setShowGuestModal(false);
    const credentials = guestCredentials[userType];
    await performLogin(credentials);
  };

  return (
    <div className="login-container">
      <div 
        className="login-card"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        <div 
          className="login-header"
          data-aos="fade-in"
          data-aos-delay="300"
        >
          <h2>Welcome Back</h2>
          <p>Log in to access your account</p>
        </div>
                
        {errors.api && (
          <div 
            className="error-message"
            data-aos="fade-in"
            data-aos-delay="400"
          >
            {errors.api}
          </div>
        )}
                
        <form 
          onSubmit={handleSubmit} 
          className="login-form"
          data-aos="fade-in"
          data-aos-delay="500"
        >
          <div 
            className="form-group"
            data-aos="fade-right"
            data-aos-delay="600"
          >
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
                    
          <div 
            className="form-group"
            data-aos="fade-right"
            data-aos-delay="700"
          >
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
                    
          <button 
            type="submit"
            className="guest-login-button"
            style={{backgroundColor: '#4361ee'}}
            disabled={isSubmitting}
            data-aos="fade-in"
            data-aos-delay="300"
          >
            {isSubmitting ? 'Logging In...' : 'Log In'}
          </button>

          <button 
            type="button"
            className="guest-login-button"
            onClick={() => setShowGuestModal(true)}
            disabled={isSubmitting}
            data-aos="fade-in"
            data-aos-delay="300"
          >
            Guest Login
          </button>
        </form>                
        <div 
          className="register-link"
        >
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
      {/* Guest Login Modal */}
        {showGuestModal && (
          <div 
            className="modal-overlay" 
            onClick={() => setShowGuestModal(false)}
            data-aos="fade-in"
          >
            <div 
              className="modal-content" 
              onClick={(e) => e.stopPropagation()}
              data-aos="zoom-in"
            >         
             <div style={{textAlign: 'center',borderRadius: '10px', padding: '1rem'}} className="modal-header">
                <h3 style={{textAlign: 'center'}}>Select Guest Login Type</h3>
                <button 
                  style={{backgroundColor: 'white',color: 'black'}}
                  className="modal-close"
                  onClick={() => setShowGuestModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <button 
                  className="guest-option-button"
                  onClick={() => handleGuestLogin('user')}
                  disabled={isSubmitting}
                  data-aos="fade-up"
                  data-aos-delay="100"
                >
                  Login as User
                </button>
                <button 
                  className="guest-option-button"
                  onClick={() => handleGuestLogin('provider')}
                  disabled={isSubmitting}
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  Login as Provider
                </button>
                <button 
                  className="guest-option-button"
                  onClick={() => handleGuestLogin('admin')}
                  disabled={isSubmitting}
                  data-aos="fade-up"
                  data-aos-delay="300"
                >
                  Login as Admin
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Login;