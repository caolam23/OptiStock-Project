import React, { useState, useEffect } from 'react';
import { Table, Input, Select, Tag, message, Space } from 'antd';
import { SearchOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import saleApi from '../../api/saleApi';
import styles from './AvailableStock.module.css';

const AvailableStock = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const response = await saleApi.getAllProductsAvailability();
      const data = response.data || response;
      setProducts(data);
      setFilteredProducts(data);
      setSearchText('');
      setSelectedCategory(null);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu Tồn kho khả dụng!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  // Trích xuất danh sách các Danh mục duy nhất từ dữ liệu sản phẩm
  const categories = [...new Set(products.map(p => p.category || 'Chưa phân loại'))];

  // Hàm áp dụng cả 2 bộ lọc (Tìm kiếm + Danh mục)
  const applyFilters = (search, category) => {
    let filtered = products;
    if (search) {
      filtered = filtered.filter(product => 
        (product.productName && product.productName.toLowerCase().includes(search)) ||
        (product.productCode && product.productCode.toLowerCase().includes(search)) ||
        (product.productId && product.productId.toLowerCase().includes(search))
      );
    }
    if (category) {
      filtered = filtered.filter(product => (product.category || 'Chưa phân loại') === category);
    }
    setFilteredProducts(filtered);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    applyFilters(value, selectedCategory);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    applyFilters(searchText, value);
  };

  // Giao diện thả xuống (Dropdown) hiển thị thông tin chi tiết
  const expandedRowRender = (record) => {
    return (
      <div style={{ padding: '12px 24px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', marginLeft: '48px' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
          <span style={{ color: '#475569' }}>ID Sản Phẩm: </span>
          <span style={{ color: '#64748B', fontFamily: 'monospace' }}>{record.productId}</span>
        </p>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
          <span style={{ color: '#475569' }}>Chiết khấu tối đa cho phép: </span>
          <strong style={{ color: '#059669' }}>{record.maxDiscountPercent || 0}%</strong>
        </p>
        <p style={{ margin: 0, fontSize: '14px' }}>
          <span style={{ color: '#475569' }}>Giá sàn đề xuất: </span>
          <strong style={{ color: '#DC2626' }}>{formatCurrency(record.suggestedMinPrice)}</strong>
        </p>
      </div>
    );
  };

  const columns = [
    {
      title: 'Mã Sản Phẩm',
      dataIndex: 'productCode',
      key: 'productCode',
      width: '20%',
      render: (text) => <strong>{text || 'N/A'}</strong>,
    },
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
      width: '20%',
    },
    {
      title: 'Danh Mục',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <Tag color="#F97316" style={{ fontSize: '14px', padding: '4px 12px', borderRadius: '6px', fontWeight: '600' }}>{text || 'Chưa phân loại'}</Tag>,
    },
    {
      title: 'Giá Bán (VND)',
      dataIndex: 'price',
      key: 'price',
      render: (val) => formatCurrency(val),
    },
    {
      title: 'Tồn Kho Khả Dụng',
      dataIndex: 'availableToPromise',
      key: 'availableToPromise',
      align: 'center',
      render: (atp) => <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{atp}</span>,
    },
    {
      title: 'Trạng Thái',
      key: 'status',
      align: 'center',
      width: '15%',
      render: (_, record) => {
        const atp = record.availableToPromise;
        let statusClass = styles.statusRed;
        let text = '🔴 Hết hàng';
        if (atp > 10) { statusClass = styles.statusGreen; text = '🟢 Còn hàng'; }
        else if (atp > 0 && atp <= 10) { statusClass = styles.statusOrange; text = '🟡 Sắp hết'; }
        return <span className={`${styles.statusTag} ${statusClass}`}>{text}</span>;
      }
    }
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitleWrap}>
            <h2 className={styles.panelTitle}>Tra Cứu Tồn Kho Khả Dụng</h2>
            <span className={styles.panelSub}>Công cụ hỗ trợ Sale kiểm tra hàng hóa trước khi báo giá khách</span>
          </div>
          <div className={styles.headerActions}>
            <Select
              placeholder={<span><FilterOutlined /> Chọn danh mục</span>}
              style={{ width: 180 }}
              allowClear
              onChange={handleCategoryChange}
              value={selectedCategory}
            >
              {categories.map(cat => <Select.Option key={cat} value={cat}>{cat}</Select.Option>)}
            </Select>
            <Input placeholder="Tìm theo tên hoặc mã SP..." prefix={<SearchOutlined />} value={searchText} onChange={handleSearch} style={{ width: 250 }} />
            <button className={styles.primaryBtn} onClick={fetchAvailability}>
              <ReloadOutlined /> Làm mới
            </button>
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <Table 
            columns={columns} 
            dataSource={filteredProducts} 
            rowKey="productId" 
            loading={loading} 
            pagination={{ pageSize: 10 }} 
            expandable={{ expandedRowRender }}
          />
        </div>
      </div>
    </div>
  );
};
export default AvailableStock;