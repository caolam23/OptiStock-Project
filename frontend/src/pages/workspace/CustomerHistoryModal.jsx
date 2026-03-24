import React from 'react';
import { Modal, Table, Tag } from 'antd';

const CustomerHistoryModal = ({ isOpen, onClose, customer, orders, loading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const columns = [
    {
      title: 'Mã Đơn',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleString('vi-VN') : 'N/A',
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => formatCurrency(amount || 0),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'blue';
        let text = status;
        if (status === 'COMPLETED') { color = 'green'; text = 'Hoàn thành'; }
        else if (status === 'PROCESSING') { color = 'blue'; text = 'Đang xử lý'; }
        else if (status === 'PENDING_APPROVAL') { color = 'gold'; text = 'Chờ duyệt'; }
        else if (status === 'REJECTED') { color = 'red'; text = 'Từ chối'; }
        else if (status === 'CANCELLED') { color = 'default'; text = 'Đã hủy'; }
        return <Tag color={color}>{text}</Tag>;
      }
    }
  ];

  // Hàm render chi tiết các mặt hàng trong đơn hàng
  const expandedRowRender = (record) => {
    const itemColumns = [
      { title: 'Mã / ID Sản Phẩm', dataIndex: 'productId', key: 'productId' },
      { title: 'Số Lượng', dataIndex: 'quantity', key: 'quantity' },
      { 
        title: 'Đơn Giá', 
        dataIndex: 'unitPrice', 
        key: 'unitPrice',
        render: (price) => formatCurrency(price || 0)
      },
      { 
        title: 'Thành Tiền', 
        key: 'lineTotal',
        render: (_, item) => formatCurrency((item.quantity || 0) * (item.unitPrice || 0))
      },
    ];

    return (
      <Table 
        columns={itemColumns} 
        dataSource={record.items || []} 
        pagination={false} 
        size="small" 
        rowKey={(item, index) => item.productId || index}
      />
    );
  };

  return (
    <Modal title={`Lịch Sử Mua Hàng - ${customer?.name || ''}`} open={isOpen} onCancel={onClose} footer={null} width={800} centered>
      <Table columns={columns} dataSource={orders} rowKey="id" loading={loading} pagination={{ pageSize: 5 }} locale={{ emptyText: 'Khách hàng chưa có đơn hàng nào.' }} expandable={{ expandedRowRender }} />
    </Modal>
  );
};

export default CustomerHistoryModal;