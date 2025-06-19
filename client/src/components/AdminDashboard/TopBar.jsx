import React from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

const TopBar = ({ activeTab, sidebarOpen, setSidebarOpen }) => {
  const getTitle = () => {
    if (activeTab === 'dashboard') return 'Dashboard';
    if (activeTab === 'providers') return 'Provider Approvals';
    return activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
  };

  return (
    <header className="top-bar">
      <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>
      <h1>{getTitle()}</h1>
      <div className="user-profile">
        <img 
          src="https://res.cloudinary.com/do5aecy6u/image/upload/v1748090371/smart-services-users/af1uegbuurdbnffzu3ie.jpg" 
          alt="Admin"
          onError={(e) => {
            e.target.src = 'https://isobarscience.com/wp-content/uploads/2020/09/default-profile-picture1.jpg';
          }}
        />
        <span>Admin</span>
      </div>
    </header>
  );
};

export default TopBar;