import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/ProfileInfo.css';

/**
 * ProfileInfo component - Hiển thị thông tin user và role
 */
const ProfileInfo = () => {
  const { user, userId, tenantId, roles, avatar, isSuperAdmin, isTenantAdmin, isStaff, isAccountant } = useAuth();

  return (
    <div className="profile-info-container">
      <div className="profile-header">
        {avatar && (
          <img src={avatar} alt="Avatar" className="profile-avatar" />
        )}
        <div className="profile-details">
          <h2>{user?.fullName || 'User'}</h2>
          <p className="email">{user?.email}</p>
        </div>
      </div>

      <div className="user-info-section">
        <h3>Thông tin người dùng</h3>
        <div className="info-row">
          <span className="label">User ID:</span>
          <span className="value">{userId}</span>
        </div>
        <div className="info-row">
          <span className="label">Tenant ID:</span>
          <span className="value">{tenantId || 'N/A'}</span>
        </div>
      </div>

      <div className="roles-section">
        <h3>Quyền hạn</h3>
        <div className="roles-list">
          {roles && roles.length > 0 ? (
            roles.map((role) => (
              <span key={role} className="role-badge">
                {role.replace('ROLE_', '')}
              </span>
            ))
          ) : (
            <p>Không có role nào</p>
          )}
        </div>
      </div>

      <div className="role-checks">
        <h3>Role Checks</h3>
        <ul>
          <li>Super Admin: <strong>{isSuperAdmin() ? '✓ Yes' : '✗ No'}</strong></li>
          <li>Tenant Admin: <strong>{isTenantAdmin() ? '✓ Yes' : '✗ No'}</strong></li>
          <li>Staff: <strong>{isStaff() ? '✓ Yes' : '✗ No'}</strong></li>
          <li>Accountant: <strong>{isAccountant() ? '✓ Yes' : '✗ No'}</strong></li>
        </ul>
      </div>
    </div>
  );
};

export default ProfileInfo;
