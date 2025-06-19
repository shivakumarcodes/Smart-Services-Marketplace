import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminDashboard.css';
import { useToast } from '../components/ToastContext';
import { BASE_URL } from '../api/axiosInstance';

import Sidebar from '../components/AdminDashboard/Sidebar';
import TopBar from '../components/AdminDashboard/TopBar';
import DashboardContent from '../components/AdminDashboard/DashboardContent';
import UsersContent from '../components/AdminDashboard/UsersContent';
import ProvidersContent from '../components/AdminDashboard/ProvidersContent';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [visibleUsers, setVisibleUsers] = useState(10);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    pendingApprovals: 0,
    totalRevenue: 0
  });

  const [loading, setLoading] = useState({
    dashboard: true,
    users: true,
    providers: true
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch users
      if (activeTab === 'users' || activeTab === 'dashboard') {
        const usersRes = await axios.get(`${BASE_URL}/api/admin/users`, config);
        setUsers(usersRes.data);
        setLoading(prev => ({ ...prev, users: false }));
      }

      // Fetch pending providers
      if (activeTab === 'providers' || activeTab === 'dashboard') {
        const providersRes = await axios.get(`${BASE_URL}/api/admin/providers/pending`, config);
        setPendingProviders(providersRes.data);
        setLoading(prev => ({ ...prev, providers: false }));
      }

      // Calculate stats
      if (activeTab === 'dashboard') {
        const [usersRes, providersRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/admin/users`, config),
          axios.get(`${BASE_URL}/api/admin/providers/pending`, config)
        ]);

        const totalUsers = usersRes.data.length;
        const totalProviders = usersRes.data.filter(u => u.role === 'provider').length;
        const pendingApprovals = providersRes.data.length;

        setStats({
          totalUsers,
          totalProviders,
          pendingApprovals,
          totalRevenue: 0
        });
        setLoading(prev => ({ ...prev, dashboard: false }));
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError(error.response?.data?.message || 'Failed to load data. Please try again.');
      showToast('Failed to load data. Please try again.', 'error');
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const approveProvider = async (providerId) => {
    try {
      const token = localStorage.getItem('token');
      const provider = pendingProviders.find(p => p.provider_id === providerId);
      const providerName = provider ? provider.name : 'Provider';
      
      await axios.put(
        `${BASE_URL}/api/admin/providers/${providerId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showToast(`${providerName} has been approved successfully!`, 'success');
      
      const providersRes = await axios.get(
        `${BASE_URL}/api/admin/providers/pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingProviders(providersRes.data);
      
      setStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1,
        totalProviders: prev.totalProviders + 1
      }));
    } catch (error) {
      console.error('Error approving provider:', error);
      setError(error.response?.data?.message || 'Failed to approve provider.');
      showToast('Failed to approve provider. Please try again.', 'error');
    }
  };

  const rejectProvider = async (providerId) => {
    try {
      const token = localStorage.getItem('token');
      const provider = pendingProviders.find(p => p.provider_id === providerId);
      const providerName = provider ? provider.name : 'Provider';
      
      await axios.delete(
        `${BASE_URL}/api/admin/providers/${providerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showToast(`${providerName} has been rejected.`, 'warning');
      
      const providersRes = await axios.get(
        `${BASE_URL}/api/admin/providers/pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingProviders(providersRes.data);
      
      setStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1
      }));
    } catch (error) {
      console.error('Error rejecting provider:', error);
      setError(error.response?.data?.message || 'Failed to reject provider.');
      showToast('Failed to reject provider. Please try again.', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  const showMoreUsers = () => {
    setVisibleUsers(prev => prev + 10);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const isLoading = () => {
    if (activeTab === 'dashboard') return loading.dashboard;
    if (activeTab === 'users') return loading.users;
    if (activeTab === 'providers') return loading.providers;
    return false;
  };

  if (isLoading()) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading {activeTab} data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => {
          setError(null);
          fetchData();
        }}>Try Again</button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <UsersContent 
            users={users} 
            visibleUsers={visibleUsers} 
            showMoreUsers={showMoreUsers} 
          />
        );
      case 'providers':
        return (
          <ProvidersContent 
            pendingProviders={pendingProviders} 
            approveProvider={approveProvider} 
            rejectProvider={rejectProvider} 
          />
        );
      default:
        return (
          <DashboardContent 
            stats={stats} 
            pendingProviders={pendingProviders} 
            setActiveTab={setActiveTab} 
            approveProvider={approveProvider} 
            rejectProvider={rejectProvider} 
          />
        );
    }
  };

  return (
    <div className="admin-dashboard">
      <TopBar 
        activeTab={activeTab} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        stats={stats} 
        handleLogout={handleLogout} 
      />

      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;