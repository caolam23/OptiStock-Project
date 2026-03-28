import React, { useState, useEffect } from 'react';
import { Form, Input, Space, message, Row, Col, Select, Modal, Alert } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import saleApi from '../../api/saleApi';
import customerApi from '../../api/customerApi';
import styles from './CreateSalesOrder.module.css';
import OrderItemsTable from './OrderItemsTable';

const CreateSalesOrder = () => {
  const [form] = Form.useForm();
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  
  // Trạng thái cho tính năng Edit (Sửa đơn)
  const [isEditing, setIsEditing] = useState(false);
  const [initialOrderTotal, setInitialOrderTotal] = useState(0); // Tổng tiền cũ để bù trừ công nợ
  
  const navigate = useNavigate();
  const { workspaceId, orderId } = useParams(); // Lấy thêm orderId từ URL nếu có

  // Lấy thông tin ID và Tên của nhân viên đang đăng nhập để gán vào đơn hàng
  const getCurrentUser = () => {
    let id = null, name = '';
    try {
      const userObj = JSON.parse(localStorage.getItem('user') || localStorage.getItem('userInfo') || '{}');
      id = userObj.userId;
      name = userObj.fullName || userObj.name || '';
      if (!id || !name) {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(decodeURIComponent(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))));
          id = id || payload.userId;
          name = name || payload.fullName || payload.name || '';
        }
      }
    } catch (error) {}
    return { id, name };
  };

  // Hàm lấy Role để phân quyền chặn truy cập URL trái phép
  const getRoleFromStorage = () => {
    let foundRole = localStorage.getItem('workspaceRole') || localStorage.getItem('role') || '';
    try {
      const workspaceObj = JSON.parse(localStorage.getItem('currentWorkspace') || '{}');
      if (workspaceObj.role) foundRole = workspaceObj.role;
      else if (workspaceObj.workspaceRole) foundRole = workspaceObj.workspaceRole;
      if (!foundRole) {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(decodeURIComponent(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))));
          foundRole = payload.role || payload.workspaceRole || foundRole;
        }
      }
    } catch (error) {}
    return String(foundRole || '').toUpperCase();
  };

  // Tự động gọi API lấy Khách hàng và thông tin Đơn hàng (nếu đang Edit)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Lấy danh sách khách hàng
        const custResponse = await customerApi.getCustomers();
        const customersList = custResponse.data || custResponse;
        setCustomers(customersList);

        // 2. Lấy danh sách sản phẩm khả dụng
        const prodResponse = await saleApi.getAllProductsAvailability();
        setAvailableProducts(prodResponse.data || prodResponse);

        // 3. Nếu có orderId, lấy chi tiết đơn hàng để điền vào form
        if (orderId) {
          setIsEditing(true);
          const orderResponse = await saleApi.getSalesOrders();
          const ordersList = orderResponse.data || orderResponse;
          const orderToEdit = ordersList.find(o => o.id === orderId);

          if (orderToEdit) {
            // 🔒 BẢO MẬT FRONTEND: Chặn SALE sửa đơn hàng của người khác nếu cố tình gõ URL
            const currentUser = getCurrentUser();
            const role = getRoleFromStorage();
            const isMyOrder = orderToEdit.createdBy === currentUser.id || orderToEdit.userId === currentUser.id;

            if (role === 'SALE' && !isMyOrder) {
              message.error('Từ chối truy cập: Bạn chỉ có thể xem/sửa đơn hàng do chính mình tạo!');
              navigate(`/workspace/${workspaceId}/sales`);
              return;
            }

            form.setFieldsValue({ customerName: orderToEdit.customerName, customerPhone: orderToEdit.customerPhone });
            
            const matchedCustomer = customersList.find(c => c.name === orderToEdit.customerName);
            setSelectedCustomer(matchedCustomer || null);
            setInitialOrderTotal(orderToEdit.totalAmount || 0);

            const loadedItems = (orderToEdit.items || []).map((item, index) => ({
              key: `loaded_${index}_${Date.now()}`,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice
            }));
            setOrderItems(loadedItems);
          }
        }
      } catch (error) {
        message.error('Không thể tải dữ liệu khởi tạo!');
      }
    };
    fetchData();
  }, [orderId, form]);

  // Hàm thêm một dòng sản phẩm trống vào giỏ hàng
  const handleAddItem = () => {
    setOrderItems([...orderItems, { key: Date.now(), productId: '', quantity: 1, unitPrice: 0 }]);
  };

  // Cập nhật giá trị trực tiếp trên lưới (table)
  const handleItemChange = (key, field, value) => {
    const newItems = orderItems.map(item => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: value };
        
        // Kiểm tra và cảnh báo nếu nhập giá thấp hơn giá sàn
        if (field === 'unitPrice') {
          const selectedProd = availableProducts.find(p => p.productId === item.productId);
          if (selectedProd && value < selectedProd.suggestedMinPrice) {
            message.warning(`Đơn giá không được thấp hơn giá sàn (${selectedProd.suggestedMinPrice.toLocaleString()} VND).`);
          }
        }

        // Tự động điền đơn giá khi chọn sản phẩm
        if (field === 'productId') {
          const selectedProd = availableProducts.find(p => p.productId === value);
          if (selectedProd) {
            updatedItem.unitPrice = selectedProd.price || 0;
            
            // Tự động ép số lượng xuống nếu đang nhập lố so với Tồn kho của SP mới chọn
            if (updatedItem.quantity > selectedProd.availableToPromise) {
              updatedItem.quantity = selectedProd.availableToPromise > 0 ? selectedProd.availableToPromise : 1;
              message.info(`Đã tự động điều chỉnh số lượng theo tồn kho khả dụng.`);
            }
          }
        }
        return updatedItem;
      }
      return item;
    });
    setOrderItems(newItems);
  };

  const handleDeleteItem = (key) => {
    setOrderItems(orderItems.filter(item => item.key !== key));
  };

  // Xử lý Gửi form Tạo đơn hàng
  const onFinish = async (values) => {
    if (orderItems.length === 0) {
      message.warning('Vui lòng thêm ít nhất một sản phẩm vào đơn hàng!');
      return;
    }

    // Validate chặn chốt đơn nếu có sản phẩm bán dưới giá sàn
    const invalidPriceItem = orderItems.find(item => {
      const prod = availableProducts.find(p => p.productId === item.productId);
      return prod && item.unitPrice < prod.suggestedMinPrice;
    });
    if (invalidPriceItem) {
      message.error('Có sản phẩm trong đơn hàng đang có đơn giá thấp hơn mức giá sàn cho phép!');
      return;
    }

    // Validate: Chặn hoàn toàn thao tác chốt đơn nếu vượt hạn mức công nợ
    const currentOrderTotal = orderItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
    const effectiveDebt = selectedCustomer ? Math.max(0, selectedCustomer.totalDebt - initialOrderTotal) : 0;

    if (selectedCustomer && selectedCustomer.creditLimit > 0 && (effectiveDebt + currentOrderTotal > selectedCustomer.creditLimit)) {
      message.error('Khách hàng đã vượt hạn mức công nợ. Không thể chốt đơn!');
      return;
    }

    setLoading(true);
    try {
      const currentUser = getCurrentUser();
      const requestData = {
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        // Cập nhật thuộc tính để lưu vết ai là người tạo/phụ trách đơn hàng
        createdBy: currentUser.id,
        userId: currentUser.id, // Gửi cả 2 trường tùy backend sử dụng tên biến nào
        createdByName: currentUser.name,
        items: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      };

      let response;
      if (isEditing) {
        // Đảm bảo API client của bạn có cấu hình hàm gọi PUT updateOrderDetails
        response = await saleApi.updateOrderDetails(orderId, requestData); 
      } else {
        response = await saleApi.createSalesOrder(requestData);
      }
      const savedOrder = response.data || response;
      
      message.success(isEditing ? 'Cập nhật Đơn Hàng thành công!' : 'Tạo Đơn Hàng thành công!');

      form.resetFields();
      setOrderItems([]);
      // Tự động chuyển về danh sách đơn hàng
      navigate(`/workspace/${workspaceId}/sales`);
    } catch (error) {
      const errorMsg = error.response?.data?.message || '';
      
      Modal.error({
        title: 'Lỗi khi tạo đơn hàng',
        content: errorMsg || 'Đã có lỗi xảy ra, vui lòng thử lại sau!',
        centered: true,
        okText: 'Đóng'
      });
    } finally {
      setLoading(false);
    }
  };

  // Tính tổng tiền đơn hàng hiện tại để so sánh hạn mức
  const currentOrderTotal = orderItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
  
  // Tính toán số nợ thực tế (Nếu đang sửa đơn, phải trừ đi số tiền của đơn cũ đã được tính vào tổng nợ trước đó)
  const effectiveDebt = selectedCustomer ? Math.max(0, selectedCustomer.totalDebt - initialOrderTotal) : 0;
  const isOverLimit = selectedCustomer && selectedCustomer.creditLimit > 0 && (effectiveDebt + currentOrderTotal > selectedCustomer.creditLimit);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitleWrap}>
            <h2 className={styles.panelTitle}>{isEditing ? 'Cập Nhật Đơn Hàng Bán' : 'Tạo Đơn Hàng Bán'}</h2>
            <span className={styles.panelSub}>{isEditing ? 'Chỉnh sửa lại thông tin của đơn hàng' : 'Thêm thông tin khách hàng và sản phẩm mới'}</span>
          </div>
        </div>

        <div className={styles.formContent}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="customerName" label={<span className={styles.formLabel}>Tên Khách Hàng</span>} rules={[{ required: true, message: 'Vui lòng nhập tên KH!' }]}>
                  <Select 
                    className={styles.inputField} 
                    placeholder="Chọn khách hàng"
                    showSearch
                    onChange={(val, option) => {
                      form.setFieldsValue({ customerPhone: option.phone });
                      setSelectedCustomer(option.customer);
                    }}
                  >
                    {customers.map(c => (
                      <Select.Option key={c.id} value={c.name} phone={c.phone} customer={c}>{c.name}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="customerPhone" label={<span className={styles.formLabel}>Số Điện Thoại</span>}>
                  <Input className={styles.inputField} placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Col>
            </Row>

            {/* Cảnh báo đỏ khóa đơn hàng nếu vượt nợ */}
            {isOverLimit && (
              <Alert
                message="Cảnh báo đỏ 🔴: Vượt hạn mức công nợ"
                description={`Khách hàng ${selectedCustomer.name} hiện đang nợ ${effectiveDebt.toLocaleString()} VND. Nếu cộng thêm đơn hàng này (${currentOrderTotal.toLocaleString()} VND), tổng nợ sẽ là ${(effectiveDebt + currentOrderTotal).toLocaleString()} VND, vượt giới hạn cho phép (${selectedCustomer.creditLimit?.toLocaleString()} VND). Chức năng chốt đơn đã tự động bị khóa!`}
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <div style={{ marginBottom: 12, marginTop: 8 }}>
              <span className={styles.sectionTitle}>Danh sách sản phẩm</span>
            </div>
            <OrderItemsTable 
              orderItems={orderItems}
              handleItemChange={handleItemChange}
              handleDeleteItem={handleDeleteItem}
              availableProducts={availableProducts}
            />
            
            <button type="button" className={styles.dashedBtn} onClick={handleAddItem}>
              <PlusOutlined /> Thêm Sản Phẩm
            </button>

            {/* --- HIỂN THỊ TỔNG TIỀN --- */}
            <Row justify="end" style={{ marginTop: 20, paddingRight: 8, marginBottom: 20 }}>
              <Col>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#475569', marginRight: '16px' }}>
                  Tổng cộng:
                </span>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary, #F97316)' }}>
                  {currentOrderTotal.toLocaleString()} VND
                </span>
              </Col>
            </Row>

            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryBtn} disabled={loading || isOverLimit}>
                {loading ? 'Đang xử lý...' : (isEditing ? 'Cập Nhật Đơn Hàng' : 'Lưu & Chốt Đơn Hàng')}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateSalesOrder;