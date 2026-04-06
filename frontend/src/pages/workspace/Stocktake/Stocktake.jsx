import React, { useState, useEffect } from 'react';
import { Table, Tabs, Button, Space, Modal, message, Spin, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import CreateStocktakeModal from './CreateStocktakeModal';
import styles from './Stocktake.module.css';

/**
 * Stocktake.jsx: Trang danh sách phiếu kiểm kê
 * * Hỗ trợ:
 * - Lọc theo trạng thái (Tabs: Tất cả, Chờ xử lý, Đang kiểm kê, Chờ duyệt, Hoàn tất)
 * - Hiển thị danh sách theo industryType của workspace
 * - Nút tạo phiếu, xem chi tiết, duyệt phiếu
 */
const Stocktake = () => {
  const { currentWorkspace } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);

  const workspaceId = currentWorkspace?.id;
  
  // Auto-detect industryType from workspace name
  const getIndustryType = () => {
    const workspaceName = currentWorkspace?.name || '';
    const nameLower = workspaceName.toLowerCase();
    
    if (nameLower.includes('tạp hóa') || nameLower.includes('grocery') || nameLower.includes('hoho')) {
      return 'GROCERY';
    } else if (nameLower.includes('điện tử') || nameLower.includes('electronics')) {
      return 'ELECTRONICS';
    }
    
    return 'ELECTRONICS'; // Default
  };
  
  const industryType = getIndustryType();

  // ==================== FETCH DATA ====================

  const fetchTickets = async (status = null) => {
    if (!workspaceId) return;

    setLoading(true);
    try {
      const params = {
        industryType: industryType,
      };
      if (status && status !== 'all') {
        params.status = status;
      }

      const response = await axiosClient.get(
        `/v1/workspaces/${workspaceId}/stocktakes`,
        { params }
      );

      if (response.data?.status === 'SUCCESS') {
        setTickets(response.data.data || []);
      }
    } catch (err) {
      console.error('❌ Lỗi lấy danh sách phiếu:', err);
      message.error('Không thể tải danh sách phiếu kiểm kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(activeTab === 'all' ? null : activeTab);
  }, [workspaceId, activeTab]);

  // ==================== HANDLERS ====================

  const handleViewDetail = (ticketId) => {
    navigate(`/workspace/${workspaceId}/stocktake/${ticketId}`);
  };

  const handleCreateSuccess = () => {
    setModalVisible(false);
    message.success('Tạo phiếu kiểm kê thành công');
    fetchTickets(activeTab === 'all' ? null : activeTab);
  };

  const handleApprove = async (ticketId) => {
    Modal.confirm({
      title: 'Duyệt phiếu kiểm kê',
      content: 'Bạn chắc chắn muốn duyệt phiếu này?',
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await axiosClient.put(
            `/v1/workspaces/${workspaceId}/stocktakes/${ticketId}/approve`
          );
          if (response.data?.status === 'SUCCESS') {
            message.success('Duyệt phiếu thành công');
            fetchTickets(activeTab === 'all' ? null : activeTab);
          }
        } catch (err) {
          message.error('Lỗi duyệt phiếu');
        }
      },
    });
  };

  // ==================== TABLE COLUMNS ====================

  const columns = [
    {
      title: 'Mã Phiếu',
      dataIndex: 'ticketCode',
      key: 'ticketCode',
      render: (code) => <span className={styles.code}>{code}</span>,
    },
    {
      title: 'Tiêu Đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Vị Trí Kiểm Kê',
      key: 'location',
      render: (_, record) => {
        return record.locationName 
            || record.location?.name 
            || record.location?.locationName 
            || '-';
      },
    },
    {
      title: 'Người Phụ Trách',
      key: 'assignedTo',
      render: (_, record) => {
        return record.assignedToName 
            || record.assignedUser?.fullName 
            || record.assignedUser?.name 
            || record.assignedTo?.fullName
            || '-';
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = {
          PENDING: '#faad14',
          COUNTING: '#1890ff',
          REVIEWING: '#722ed1',
          COMPLETED: '#52c41a',
          CANCELLED: '#d9d9d9',
        }[status] || '#999';

        const label = {
          PENDING: 'Chờ xử lý',
          COUNTING: 'Đang kiểm kê',
          REVIEWING: 'Chờ duyệt',
          COMPLETED: 'Hoàn tất',
          CANCELLED: 'Hủy',
        }[status];

        return (
          <span className={styles.status} style={{ color }}>
            ● {label}
          </span>
        );
      },
    },
    {
      title: 'Tiến Độ',
      dataIndex: 'progressPercentage',
      key: 'progressPercentage',
      render: (progress) => {
        const pct = Math.round(progress || 0);
        return (
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${pct}%` }}
            ></div>
            <span>{pct}%</span>
          </div>
        );
      },
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành Động',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            onClick={() => handleViewDetail(record.id)}
          >
            Xem Chi Tiết
          </Button>
          {record.status === 'REVIEWING' && (
            <Button
              size="small"
              onClick={() => handleApprove(record.id)}
            >
              Duyệt
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // ==================== TABS ====================

  const tabItems = [
    { label: 'Tất Cả', key: 'all' },
    { label: 'Chờ Xử Lý', key: 'PENDING' },
    { label: 'Đang Kiểm Kê', key: 'COUNTING' },
    { label: 'Chờ Duyệt', key: 'REVIEWING' },
    { label: 'Hoàn Tất', key: 'COMPLETED' },
  ];

  // ==================== RENDER ====================

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Kiểm Kê Kho</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          className={styles.createBtn}
        >
          Tạo Phiếu Kiểm Kê
        </Button>
      </div>

      <Spin spinning={loading}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className={styles.tabs}
        />

        {tickets.length > 0 ? (
          <Table
            columns={columns}
            dataSource={tickets.map((t) => ({ ...t, key: t.id }))}
            pagination={{ pageSize: 10 }}
            size="middle"
            className={styles.table}
          />
        ) : (
          <Empty
            description="Chưa có phiếu kiểm kê"
            style={{ marginTop: 48 }}
          />
        )}
      </Spin>

      <CreateStocktakeModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={handleCreateSuccess}
        industryType={industryType}
        workspaceId={workspaceId}
      />
    </div>
  );
};

export default Stocktake;