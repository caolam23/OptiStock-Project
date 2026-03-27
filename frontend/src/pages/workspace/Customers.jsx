import React, { useState, useEffect } from 'react';
import { Table, message, Tag, Tooltip, Modal, Form, Input, InputNumber, Space, Popconfirm } from 'antd';
import { PlusOutlined, WarningOutlined, EditOutlined, DeleteOutlined, HistoryOutlined } from '@ant-design/icons';
import customerApi from '../../api/customerApi';
import axiosClient from '../../api/axiosClient';
import styles from './Customers.module.css';
import CustomerHistoryModal from './CustomerHistoryModal';
import CustomerFormModal from './CustomerFormModal';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // State cho Lịch sử mua hàng
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);

  // Hàm tự động quét tìm Role trong LocalStorage với các từ khóa phổ biến
  const getRoleFromStorage = () => {
    let foundRole = localStorage.getItem('workspaceRole') || localStorage.getItem('role') || '';
    try {
      // 1. Quét tìm trong currentWorkspace (Thường được sử dụng nhất)
      const workspaceObj = JSON.parse(localStorage.getItem('currentWorkspace') || '{}');
      if (workspaceObj.role) foundRole = workspaceObj.role;
      else if (workspaceObj.workspaceRole) foundRole = workspaceObj.workspaceRole;
      
      // 2. Nếu vẫn chưa thấy, quét tiếp trong Token (Giành cho hệ thống dùng JWT)
      if (!foundRole) {
        const token = localStorage.getItem('token');
        if (token) {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(decodeURIComponent(window.atob(base64)));
          if (payload.role) foundRole = payload.role;
          else if (payload.workspaceRole) foundRole = payload.workspaceRole;
        }
      }
    } catch (error) {}
    
    return String(foundRole || '').trim().toUpperCase();
  };

  const workspaceRole = getRoleFromStorage(); 

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await customerApi.getCustomers();
      setCustomers(response.data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách khách hàng!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Xử lý khi Submit Form Tạo Khách Hàng
  const handleCreateCustomer = async (values) => {
    setSubmitting(true);
    try {
      if (editingId) {
        await axiosClient.put(`/v1/customers/${editingId}`, values, {
          headers: { 'X-Workspace-Role': workspaceRole }
        });
        message.success('Cập nhật khách hàng thành công!');
      } else {
        await customerApi.createCustomer(values);
        message.success('Tạo khách hàng mới thành công!');
      }
      setIsModalVisible(false);
      setEditingId(null);
      form.resetFields();
      fetchCustomers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi lưu khách hàng!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/v1/customers/${id}`, {
        headers: { 'X-Workspace-Role': workspaceRole }
      });
      message.success('Đã xóa khách hàng');
      fetchCustomers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi xóa khách hàng');
    }
  };

  // Xử lý mở Modal Lịch sử mua hàng
  const handleOpenHistory = async (record) => {
    setSelectedCustomerHistory(record);
    setIsHistoryModalVisible(true);
    setLoadingHistory(true);
    try {
      // Gọi API lấy danh sách đơn hàng. 
      // Lưu ý: Đảm bảo endpoint '/v1/sale/orders' khớp với API getOrders trong hệ thống của bạn
      const response = await axiosClient.get('/v1/sale/orders'); 
      const allOrders = response.data || response;
      
      // Lọc các đơn hàng thuộc về khách hàng này (dựa vào Tên)
      const filteredOrders = allOrders.filter(order => order.customerName === record.name);
      
      // Sắp xếp đơn hàng mới nhất lên đầu
      filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setCustomerOrders(filteredOrders);
    } catch (error) {
      message.error('Lỗi khi tải lịch sử mua hàng! Vui lòng kiểm tra lại endpoint API.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const columns = [
    {
      title: 'Mã KH',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Tên Khách Hàng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Dư Nợ Hiện Tại',
      dataIndex: 'totalDebt',
      key: 'totalDebt',
      render: (debt, record) => {
        const isOverLimit = debt > record.creditLimit;
        return (
          <span style={{ fontWeight: 600, color: isOverLimit ? '#DC2626' : '#475569' }}>
            {formatCurrency(debt)}
            {isOverLimit && (
              <Tooltip title="Nợ vượt hạn mức tín dụng!">
                <WarningOutlined style={{ color: '#DC2626', marginLeft: 8 }} />
              </Tooltip>
            )}
          </span>
        );
      },
    },
    {
      title: 'Hạn Mức Cho Phép',
      dataIndex: 'creditLimit',
      key: 'creditLimit',
      render: (limit) => <span style={{ color: '#059669' }}>{formatCurrency(limit)}</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Lịch sử mua hàng">
            <button type="button" className={`${styles.actionBtn}`} style={{ color: '#0ea5e9' }} onClick={() => handleOpenHistory(record)}>
              <HistoryOutlined />
            </button>
          </Tooltip>
          <button type="button" className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => handleOpenEdit(record)}>
            <EditOutlined />
          </button>
          {['OWNER', 'MANAGER'].includes(workspaceRole) && (
            <Popconfirm title="Bạn có chắc muốn xóa khách hàng này?" onConfirm={() => handleDelete(record.id)} okText="Có" cancelText="Không">
              <button type="button" className={`${styles.actionBtn} ${styles.deleteBtn}`}>
                <DeleteOutlined />
              </button>
            </Popconfirm>
          )}
        </Space>
      ),
    }
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitleWrap}>
            <h2 className={styles.panelTitle}>Danh Sách Khách Hàng</h2>
            <span className={styles.panelSub}>Quản lý thông tin và công nợ khách hàng</span>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.primaryBtn} onClick={() => {
              setEditingId(null);
              form.resetFields();
              setIsModalVisible(true);
            }}>
              <PlusOutlined /> Thêm Khách Hàng
            </button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <Table columns={columns} dataSource={customers} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
        </div>
      </div>

      {/* Modal Tạo Khách Hàng Mới */}
      <CustomerFormModal 
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
        onSubmit={handleCreateCustomer}
        form={form}
        editingId={editingId}
        submitting={submitting}
        workspaceRole={workspaceRole}
      />

      {/* Modal Lịch Sử Mua Hàng */}
      <CustomerHistoryModal
        isOpen={isHistoryModalVisible}
        onClose={() => setIsHistoryModalVisible(false)}
        customer={selectedCustomerHistory}
        orders={customerOrders}
        loading={loadingHistory}
      />
    </div>
  );
};

export default Customers;