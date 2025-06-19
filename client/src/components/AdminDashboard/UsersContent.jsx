import React from 'react';

const UsersContent = ({ users, visibleUsers, showMoreUsers }) => {
  return (
    <div className="content-section">
      <h2 style={{backgroundColor: '#f0f0f0',padding: '12px 16px'}}>User Management</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, visibleUsers).map(user => (
              <tr key={user.user_id}>
                <td>{user.user_id.substring(0, 8)}...</td>
                <td>
                  <div className="user-cell">
                    {user.profile_picture_url && (
                      <img 
                        src={user.profile_picture_url} 
                        alt={user.name}
                        onError={(e) => {
                          e.target.src = 'https://isobarscience.com/wp-content/uploads/2020/09/default-profile-picture1.jpg';
                        }}
                      />
                    )}
                    {user.name}
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.phone || 'N/A'}</td>
                <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                <td>
                  <span className={`status-badge ${user.is_verified ? 'active' : 'inactive'}`}>
                    {user.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length > visibleUsers && (
          <div className="view-more-container">
            <button className="view-more-btn" onClick={showMoreUsers}>
              View More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersContent;