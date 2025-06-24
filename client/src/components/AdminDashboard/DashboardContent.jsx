import React from 'react';
import { FiUsers, FiUserCheck, FiCheck, FiXCircle } from 'react-icons/fi';

const DashboardContent = ({ stats, pendingProviders, setActiveTab, approveProvider, rejectProvider }) => {
  return (
    <div style={{marginTop: '1rem'}} className="content-section">
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon users">
            <FiUsers />
          </div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon providers">
            <FiUserCheck />
          </div>
          <div className="stat-info">
            <h3>Providers</h3>
            <p>{stats.totalProviders}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <FiUsers />
          </div>
          <div className="stat-info">
            <h3>Pending Approvals</h3>
            <p>{stats.pendingApprovals}</p>
          </div>
        </div>
      </div>
      
      <div className="recent-activity">
        <div className="section-header">
          <h3>Recent Pending Providers</h3>
          {pendingProviders.length > 0 && (
            <button 
              className="view-all-btn"
              onClick={() => setActiveTab('providers')}
            >
              View All
            </button>
          )}
        </div>
        
        {pendingProviders.length > 0 ? (
          <div className="activity-list">
            {pendingProviders.slice(0, 3).map(provider => (
              <div className="activity-item" key={provider.provider_id}>
                <div className="activity-icon">
                  <FiUserCheck />
                </div>
                <div className="activity-content">
                  <p>
                    <strong>{provider.name}</strong> - {provider.service_type} 
                    {provider.experience_years && ` (${provider.experience_years} years experience)`}
                  </p>
                  <small>Registered on {new Date(provider.created_at).toLocaleDateString()}</small>
                </div>
                <div className="activity-actions">
                  <button 
                    className="action-btn approve"
                    onClick={() => approveProvider(provider.provider_id)}
                  >
                    <FiCheck />
                  </button>
                  <button 
                    className="action-btn reject"
                    onClick={() => rejectProvider(provider.provider_id)}
                  >
                    <FiXCircle />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>No recent pending providers</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardContent;