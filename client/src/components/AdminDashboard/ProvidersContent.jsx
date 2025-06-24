import React from 'react';
import { FiCheck, FiXCircle } from 'react-icons/fi';

const ProvidersContent = ({ pendingProviders, approveProvider, rejectProvider }) => {
  return (
    <div style={{marginTop: '1rem'}} className="content-section">
      {pendingProviders.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Provider ID</th>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Service Type</th>
                <th>Experience</th>
                <th>Registered</th>
                <th>Action Buttons</th>
              </tr>
            </thead>
            <tbody>
              {pendingProviders.map(provider => (
                <tr key={provider.provider_id}>
                  <td>{provider.provider_id.substring(0, 8)}...</td>
                  <td>
                    <div className="user-cell">
                      {provider.profile_picture_url && (
                        <img 
                          src={provider.profile_picture_url} 
                          alt={provider.name}
                          onError={(e) => {
                            e.target.src = 'https://isobarscience.com/wp-content/uploads/2020/09/default-profile-picture1.jpg';
                          }}
                        />
                      )}
                      <div>
                        <strong>{provider.name}</strong>
                      </div>
                    </div>
                  </td>
                  <td>{provider.email}</td>
                  <td>{provider.phone_number || 'No phone'}</td>
                  <td>{provider.service_type}</td>
                  <td>{provider.experience_years || 0} years</td>
                  <td>{new Date(provider.created_at).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="action-btn approve"
                      onClick={() => approveProvider(provider.provider_id)}
                    >
                      <FiCheck /> Approve
                    </button>
                    <button 
                      className="action-btn reject"
                      onClick={() => rejectProvider(provider.provider_id)}
                    >
                      <FiXCircle /> Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data">
          <p>No pending provider approvals</p>
        </div>
      )}
    </div>
  );
};

export default ProvidersContent;