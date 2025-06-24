import React from 'react';
import { 
  FiPieChart, 
  FiUsers, 
  FiUserCheck,
  FiLogOut
} from 'react-icons/fi';

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, stats, handleLogout }) => {
  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Smart Services</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => {
              setActiveTab('dashboard');
              setSidebarOpen(false);
            }}
          >
            <FiPieChart />
            <span>Dashboard</span>
          </li>
          <li 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => {
              setActiveTab('users');
              setSidebarOpen(false);
            }}
          >
            <FiUsers />
            <span>Users</span>
          </li>
          <li 
            className={activeTab === 'providers' ? 'active' : ''} 
            onClick={() => {
              setActiveTab('providers');
              setSidebarOpen(false);
            }}
          >
            <FiUserCheck />
            <span>Provider Approvals</span>
            {stats.pendingApprovals > 0 && (
              <span className="badge">{stats.pendingApprovals}</span>
            )}
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;