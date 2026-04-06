import React from 'react';
import { Table, Select, InputNumber, Form, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import styles from './CreateSalesOrder.module.css';

const OrderItemsTable = ({ orderItems, handleItemChange, handleDeleteItem, availableProducts = [] }) => {
  const columns = [
    {
      title: 'Sản Phẩm',
      dataIndex: 'productId',
      width: '40%',
      render: (text, record) => (
        <div style={{ marginBottom: '22px' }}>
          <Select 
            className={styles.inputField}
            style={{ width: '100%' }}
            showSearch
            placeholder="Tìm chọn sản phẩm..." 
            value={text || undefined} 
            onChange={(val) => handleItemChange(record.key, 'productId', val)}
            filterOption={(input, option) =>
              (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
            }
            options={availableProducts.map(p => ({
              value: p.productId,
              label: `${p.productName} (Còn: ${p.availableToPromise})`,
              disabled: p.availableToPromise <= 0
            }))}
          />
        </div>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      width: 120,
      render: (value, record) => {
        // Tìm sản phẩm đang được chọn để lấy tồn kho khả dụng làm giới hạn Max
        const selectedProduct = availableProducts.find(p => p.productId === record.productId);
        const maxQty = selectedProduct ? selectedProduct.availableToPromise : 999999;

        return (
          <div style={{ marginBottom: '22px' }}>
            <InputNumber 
              className={styles.inputField}
              min={1} 
              max={maxQty}
              value={value} 
              onChange={(val) => handleItemChange(record.key, 'quantity', val)}
            />
          </div>
        );
      },
    },
    {
  title: 'Đơn giá',
  dataIndex: 'unitPrice',
  key: 'unitPrice',
  render: (text, record) => {
    // Tìm thông tin sản phẩm tương ứng ở dòng hiện tại
    const selectedProd = availableProducts.find(p => p.productId === record.productId);
    const suggestedMinPrice = selectedProd?.suggestedMinPrice || 0;

    // Kiểm tra xem giá hiện tại có bị thấp hơn giá sàn không
    const isBelowMin = selectedProd && record.unitPrice < suggestedMinPrice;

    return (
      <div style={{ position: 'relative', marginBottom: '22px' }}>
        <InputNumber /* Hoặc Input, tùy theo component bạn đang dùng */
          value={record.unitPrice}
          onChange={(val) => handleItemChange(record.key, 'unitPrice', val)}
          status={isBelowMin ? 'error' : ''} /* Đổi viền ô nhập thành màu đỏ nếu vi phạm */
          style={{ width: '100%' }}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        />

        {/* Hiển thị giá sàn ngay dưới ô input */}
        {selectedProd && (
          <span style={{ 
            position: 'absolute',
            left: 0,
            top: '100%',
            fontSize: '12px', 
            marginTop: '2px',
            color: isBelowMin ? '#ff4d4f' : '#8c8c8c', // Báo đỏ nếu vi phạm, xám nếu bình thường
            fontWeight: isBelowMin ? '500' : 'normal',
            whiteSpace: 'nowrap'
          }}>
            Giá sàn: {suggestedMinPrice.toLocaleString()} VND
          </span>
        )}
      </div>
    );
  }
},
    {
      title: 'Thành tiền (VND)',
      dataIndex: 'lineTotal',
      width: 160,
      align: 'right',
      render: (_, record) => {
        const lineTotal = (record.quantity || 0) * (record.unitPrice || 0);
        return (
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>
            {lineTotal.toLocaleString()}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      width: 250,
      render: (_, record) => (
        <Space>
          <button type="button" className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteItem(record.key)}>
            <DeleteOutlined />
          </button>
        </Space>
      ),
    },
  ];

  return <Table dataSource={orderItems} columns={columns} pagination={false} size="small" />;
};

export default OrderItemsTable;