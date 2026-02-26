import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import adminApi from '../../api/adminApi';
import ProfileInfo from "../../components/ProfileInfo";
import styles from './AdminDashboard.module.css'; // Sửa import thành CSS Module

const AdminDashboard = () => {
  const { isSuperAdmin } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [myTenant, setMyTenant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (isSuperAdmin()) {
      fetchAllTenants();
      fetchAllUsers();
    } else {
      fetchMyTenant();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllTenants = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllTenants();
      setTenants(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      console.error(err);
      setError('Lỗi tải danh sách công ty: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await adminApi.getAllUsers();
      setUsers(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      console.error(err);
      setError('Lỗi tải danh sách người dùng: ' + (err.response?.data?.message || err.message));
    }
  };

  const fetchMyTenant = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getMyTenant();
      setMyTenant(response.data.data);
    } catch (err) {
      console.error(err);
      setError('Lỗi tải thông tin công ty: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const lockTenant = async (targetTenantId) => {
    if (!window.confirm('Bạn có chắc chắn muốn khóa công ty này?')) return;
    try {
      const response = await adminApi.lockTenant(targetTenantId);
      setError(null);
      alert(response.data.message || 'Đã khóa thành công');
      fetchAllTenants();
    } catch (err) {
      setError('Lỗi khóa công ty: ' + (err.response?.data?.message || err.message));
    }
  };

  const unlockTenant = async (targetTenantId) => {
    if (!window.confirm('Bạn có chắc chắn muốn mở khóa công ty này?')) return;
    try {
      const response = await adminApi.unlockTenant(targetTenantId);
      setError(null);
      alert(response.data.message || 'Đã mở khóa thành công');
      fetchAllTenants();
    } catch (err) {
      setError('Lỗi mở khóa công ty: ' + (err.response?.data?.message || err.message));
    }
  };

  const renewSubscription = async (targetTenantId) => {
    const days = prompt('Nhập số ngày gia hạn:', '30');
    if (!days) return;

    try {
      const response = await adminApi.renewSubscription(targetTenantId, days);
      setError(null);
      alert(response.data.message || 'Gia hạn thành công');
      fetchAllTenants();
    } catch (err) {
      setError('Lỗi gia hạn dịch vụ: ' + (err.response?.data?.message || err.message));
    }
  };

  const deactivateUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn vô hiệu hóa tài khoản này?')) return;
    try {
      const response = await adminApi.deactivateUser(userId);
      setError(null);
      alert(response.data.message || 'Đã vô hiệu hóa thành công');
      fetchAllUsers();
    } catch (err) {
      setError('Lỗi vô hiệu hóa tài khoản: ' + (err.response?.data?.message || err.message));
    }
  };

  const activateUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn kích hoạt tài khoản này?')) return;
    try {
      const response = await adminApi.activateUser(userId);
      setError(null);
      alert(response.data.message || 'Đã kích hoạt thành công');
      fetchAllUsers();
    } catch (err) {
      setError('Lỗi kích hoạt tài khoản: ' + (err.response?.data?.message || err.message));
    }
  };

  const deleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản ${userEmail}? Hành động này không thể hoàn tác!`)) return;
    try {
      const response = await adminApi.deleteUser(userId);
      setError(null);
      alert(response.data.message || 'Đã xóa thành công');
      fetchAllUsers();
    } catch (err) {
      setError('Lỗi xóa tài khoản: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className={styles.adminDashboard}>
      <div className={styles.dashboardHeader}>
        <h1>Admin Dashboard</h1>
        <p>{isSuperAdmin() ? 'Super Admin Panel' : 'Tenant Admin Panel'}</p>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Thông tin cá nhân
        </button>
        {isSuperAdmin() && (
          <>
            <button
              className={`${styles.tabButton} ${activeTab === 'users' ? styles.active : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Quản lý tài khoản ({users.length})
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'tenants' ? styles.active : ''}`}
              onClick={() => setActiveTab('tenants')}
            >
              Quản lý công ty ({tenants.length})
            </button>
          </>
        )}
        {!isSuperAdmin() && (
          <button
            className={`${styles.tabButton} ${activeTab === 'myTenant' ? styles.active : ''}`}
            onClick={() => setActiveTab('myTenant')}
          >
            Thông tin công ty
          </button>
        )}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'profile' && <ProfileInfo />}

        {activeTab === 'users' && isSuperAdmin() && (
          <div className={styles.usersSection}>
            <h2>Quản lý tài khoản người dùng</h2>
            {loading ? (
              <p>Đang tải...</p>
            ) : users.length === 0 ? (
              <p>Không có người dùng nào</p>
            ) : (
              <div className={styles.usersTable}>
                <table>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Avatar</th>
                      <th>Tên người dùng</th>
                      <th>Email</th>
                      <th>Vai trò</th>
                      <th>Công ty (Tenant)</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr key={user.id || idx}>
                        <td>{idx + 1}</td>
                        <td>
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.fullName}
                              className={styles.userAvatar}
                              style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                            />
                          ) : (
                            <div
                              className={styles.userAvatarPlaceholder}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#ddd',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {user.fullName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                        </td>
                        <td>{user.fullName || 'N/A'}</td>
                        <td>{user.email}</td>
                        <td>
                          {/* System role (SUPER_ADMIN) + Workspace roles */}
                          {user.roles?.includes('SUPER_ADMIN') ? (
                            <span style={{ fontSize: '12px', backgroundColor: '#fce4ec', padding: '4px 8px', borderRadius: '4px', color: '#c62828' }}>
                              SUPER_ADMIN
                            </span>
                          ) : user.workspaces?.length > 0 ? (
                            user.workspaces.map((ws, i) => (
                              <span key={i} style={{ fontSize: '12px', backgroundColor: '#e8f5e9', padding: '4px 8px', borderRadius: '4px', marginRight: '4px', color: '#2e7d32' }}>
                                {ws.role}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '12px', color: '#999' }}>Chưa tham gia kho</span>
                          )}
                        </td>
                        <td>
                          {/* Tên kho (Workspace) mà user thuộc */}
                          {user.workspaces?.length > 0 ? (
                            user.workspaces.map((ws, i) => (
                              <span key={i} style={{ fontSize: '12px', display: 'block' }}>
                                {ws.tenantName}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#999' }}>Không có</span>
                          )}
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${user.isActive ? styles.active : styles.inactive}`}>
                            {user.isActive ? 'Hoạt động' : 'Vô hiệu'}
                          </span>
                        </td>
                        <td>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className={styles.actions}>
                          {user.roles?.includes('SUPER_ADMIN') ? (
                            <span style={{ color: '#666', fontSize: '12px' }}>Super Admin</span>
                          ) : (
                            <>
                              {user.isActive ? (
                                <button
                                  className={styles.btnWarning}
                                  onClick={() => deactivateUser(user.id)}
                                  style={{ marginRight: '5px', padding: '4px 8px', fontSize: '12px' }}
                                >
                                  Vô hiệu
                                </button>
                              ) : (
                                <button
                                  className={styles.btnSuccess}
                                  onClick={() => activateUser(user.id)}
                                  style={{ marginRight: '5px', padding: '4px 8px', fontSize: '12px' }}
                                >
                                  Kích hoạt
                                </button>
                              )}
                              <button
                                className={styles.btnDanger}
                                onClick={() => deleteUser(user.id, user.email)}
                                style={{ padding: '4px 8px', fontSize: '12px' }}
                              >
                                Xóa
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tenants' && isSuperAdmin() && (
          <div className={styles.tenantsSection}>
            <h2>Danh sách công ty</h2>
            {loading ? (
              <p>Đang tải...</p>
            ) : tenants.length === 0 ? (
              <p>Không có công ty nào</p>
            ) : (
              <div className={styles.tenantsTable}>
                <table>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên công ty</th>
                      <th>Email chủ</th>
                      <th>Gói dịch vụ</th>
                      <th>Trạng thái</th>
                      <th>Ngày hết hạn</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((tenant, idx) => (
                      <tr key={tenant.tenantId || idx}>
                        <td>{idx + 1}</td>
                        <td>{tenant.companyName}</td>
                        <td>{tenant.ownerEmail}</td>
                        <td>{tenant.subscriptionPlan}</td>
                        <td>
                          {/* Lấy class động dựa trên status trả về từ API */}
                          <span className={`${styles.statusBadge} ${tenant.status ? styles[tenant.status.toLowerCase()] : ''}`}>
                            {tenant.status}
                          </span>
                        </td>
                        <td>
                          {tenant.expiryDate ? new Date(tenant.expiryDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className={styles.actions}>
                          {tenant.status === 'ACTIVE' ? (
                            <button
                              className={styles.btnDanger}
                              onClick={() => lockTenant(tenant.tenantId)}
                            >
                              Khóa
                            </button>
                          ) : (
                            <button
                              className={styles.btnSuccess}
                              onClick={() => unlockTenant(tenant.tenantId)}
                            >
                              Mở khóa
                            </button>
                          )}
                          <button
                            className={styles.btnPrimary}
                            onClick={() => renewSubscription(tenant.tenantId)}
                          >
                            Gia hạn
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'myTenant' && !isSuperAdmin() && (
          <div className={styles.myTenantSection}>
            <h2>Thông tin công ty của tôi</h2>
            {loading ? (
              <p>Đang tải...</p>
            ) : myTenant ? (
              <div className={styles.tenantInfoCard}>
                <div className={styles.infoGroup}>
                  <label>Tên công ty:</label>
                  <p>{myTenant.companyName}</p>
                </div>
                <div className={styles.infoGroup}>
                  <label>Tenant ID:</label>
                  <p>{myTenant.tenantId}</p>
                </div>
                <div className={styles.infoGroup}>
                  <label>Email cửa hàng:</label>
                  <p>{myTenant.ownerEmail}</p>
                </div>
                <div className={styles.infoGroup}>
                  <label>Gói dịch vụ:</label>
                  <p>{myTenant.subscriptionPlan}</p>
                </div>
                <div className={styles.infoGroup}>
                  <label>Trạng thái:</label>
                  <p>
                    <span className={`${styles.statusBadge} ${myTenant.status ? styles[myTenant.status.toLowerCase()] : ''}`}>
                      {myTenant.status}
                    </span>
                  </p>
                </div>
                <div className={styles.infoGroup}>
                  <label>Ngày hết hạn:</label>
                  <p>{myTenant.expiryDate ? new Date(myTenant.expiryDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            ) : (
              <p>Không tìm thấy thông tin công ty</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;