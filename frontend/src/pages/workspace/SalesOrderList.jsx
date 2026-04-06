import React, { useState, useEffect } from 'react';
import { Table, message, Space, Button, Tag } from 'antd';
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import saleApi from '../../api/saleApi';
import axiosClient from '../../api/axiosClient';
import styles from './SalesOrderList.module.css';

const SalesOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { workspaceId } = useParams();

  // Lấy thông tin role của user an toàn từ nhiều nguồn trong localStorage
  const workspaceData = JSON.parse(localStorage.getItem("currentWorkspace")) || {};
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const currentUserRole = workspaceData.role || userData.workspaceRole || userData.role || "";

  const getUserIdFromStorage = () => {
    try {
      if (userData.userId) return userData.userId;
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(decodeURIComponent(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))));
        if (payload.userId) return payload.userId;
      }
    } catch {
      // Token parse failed, return null
    }
    return null;
  };
  const currentUserId = getUserIdFromStorage();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await saleApi.getSalesOrders();
      // API trả về response hoặc response.data tuỳ thuộc vào cấu hình interceptor
      const data = response.data || response;
      setOrders(data);
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi tải danh sách đơn hàng!');
    } finally {
      setLoading(false);
    }
  };

  // Tự động gọi API khi vừa mở màn hình
  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axiosClient.patch(`/v1/sale/orders/${id}/status`, { status }, {
        headers: { 'X-Workspace-Role': currentUserRole }
      });
      message.success('Cập nhật trạng thái thành công');
      fetchOrders();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const expandedRowRender = (record) => {
    const itemColumns = [
      { title: 'Mã Sản Phẩm', dataIndex: 'productId', key: 'productId' },
      { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
      { title: 'Đơn giá', dataIndex: 'unitPrice', key: 'unitPrice', render: val => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) },
      { title: 'Thành tiền', key: 'total', render: (_, item) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.quantity * item.unitPrice) }
    ];
    return <Table columns={itemColumns} dataSource={record.items || []} pagination={false} rowKey="productId" />;
  };

  const columns = [
    {
      title: 'Mã Đơn Hàng',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Khách Hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <span style={{ color: '#059669', fontWeight: 600 }}>
          {amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount) : '0 ₫'}
        </span>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        let text = status;
        if (status === 'COMPLETED') { color = 'green'; text = 'Hoàn thành'; }
        else if (status === 'PROCESSING') { color = 'blue'; text = 'Đang xử lý'; }
        else if (status === 'PENDING_APPROVAL') { color = 'gold'; text = 'Chờ duyệt'; }
        else if (status === 'REJECTED') { color = 'red'; text = 'Từ chối'; }
        else if (status === 'CANCELLED') { color = 'default'; text = 'Đã hủy'; }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Nhân Viên Phụ Trách',
      key: 'createdByName',
      render: (_, record) => {
        const creatorName = record.createdByName || record.createdBy || 'Hệ thống';
        return <span style={{ fontWeight: 500, color: '#0284c7' }}>{creatorName}</span>;
      }
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleString('vi-VN') : 'N/A',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => {
        const canApprove = record.status === 'PENDING_APPROVAL' && (currentUserRole === 'OWNER' || currentUserRole === 'MANAGER');
        const isMyOrder = record.createdBy === currentUserId || record.userId === currentUserId;

        // Sale chỉ hủy được khi đang chờ và phải là đơn của mình. Quản lý/Owner có thể hủy đơn miễn là chưa Hoàn thành/Hủy/Từ chối.
        const canCancel = 
          (currentUserRole === 'SALE' && record.status === 'PENDING_APPROVAL' && isMyOrder) ||
          (currentUserRole !== 'SALE' && !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(record.status));

        // Cho phép Sale sửa đơn khi bị Từ chối hoặc đang Chờ duyệt và phải là đơn do chính Sale đó tạo
        const canEdit = currentUserRole === 'SALE' && ['REJECTED', 'PENDING_APPROVAL'].includes(record.status) && isMyOrder;

        return (
          <Space>
            {canEdit && (
              <Button size="small" onClick={() => navigate(`/workspace/${workspaceId}/sales/edit/${record.id}`)}>Sửa</Button>
            )}
            {canApprove && (
              <>
                <Button size="small" type="primary" onClick={() => handleUpdateStatus(record.id, 'PROCESSING')}>Duyệt</Button>
                <Button size="small" danger onClick={() => handleUpdateStatus(record.id, 'REJECTED')}>Từ chối</Button>
              </>
            )}
            {canCancel && (
              <Button size="small" danger onClick={() => handleUpdateStatus(record.id, 'CANCELLED')}>Hủy đơn</Button>
            )}
          </Space>
        );
      },
    }
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitleWrap}>
            <h2 className={styles.panelTitle}>Danh Sách Đơn Hàng</h2>
            <span className={styles.panelSub}>Quản lý và theo dõi các đơn hàng bán của bạn</span>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.secondaryBtn} onClick={fetchOrders}>
              <ReloadOutlined /> Làm mới
            </button>
            <button className={styles.primaryBtn} onClick={() => navigate(`/workspace/${workspaceId}/sales/create`)}>
              <PlusOutlined /> Tạo Đơn Hàng Mới
            </button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <Table 
            columns={columns} 
            dataSource={orders} 
            rowKey="id" 
            loading={loading}
            pagination={{ pageSize: 10 }}
            expandable={{ expandedRowRender }}
          />
        </div>
      </div>
    </div>
  );
};

export default SalesOrderList;