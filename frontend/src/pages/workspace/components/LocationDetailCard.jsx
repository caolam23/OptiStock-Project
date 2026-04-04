import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Select,
    Checkbox,
    Button,
    Space,
    Table,
    Empty,
    Spin,
    message,
    Divider,
} from 'antd';
import { SaveOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import { updateLocation, getChildLocations, deleteLocation, createLocation } from '../../../api/locationApi';
import { getPropertiesForLevel, formDataToProperties, LOCATION_LEVELS } from '../../../utils/LocationConfigs';
import { getProducts } from '../../../api/productApi';
import styles from './LocationDetailCard.module.css';

/**
 * LocationDetailCard - Component chi tiết vị trí (bên phải)
 * 
 * Tính năng:
 * 1. Render form thông tin location theo selectedNode
 * 2. Conditional rendering theo industryType + level
 * 3. Hiển thị danh sách location con bên dưới form
 */
const LocationDetailCard = ({
    tenantId,
    selectedNode = null,
    industryType = 'ELECTRONICS',
    onUpdated = null,
    onDeleted = null,
    isCreateMode = false,
    parentNodeForCreate = null,
    onCreateCancel = null,
}) => {
    console.log('🎯 [LocationDetailCard] Component rendered with:', {
        selectedNode: selectedNode?.title || null,
        isCreateMode,
        industryType,
        tenantId: tenantId?.substring(0, 8) + '...' || 'null'
    });
    
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [childrenLoading, setChildrenLoading] = useState(false);
    const [children, setChildren] = useState([]);
    const [propertiesConfig, setPropertiesConfig] = useState([]);
    const [productList, setProductList] = useState([]);
    const [productLoading, setProductLoading] = useState(false);

    /**
     * Get current level for editing/creating
     */
    const getCurrentLevel = () => {
        if (selectedNode && !isCreateMode) {
            return selectedNode.level;
        }
        if (isCreateMode && parentNodeForCreate) {
            const parent = parentNodeForCreate;
            if (parent.level === 'ZONE') return 'RACK';
            if (parent.level === 'RACK') return 'BIN';
            return 'BIN';
        }
        return isCreateMode ? 'ZONE' : selectedNode?.level;
    };

    /**
     * Lấy tên sản phẩm theo ID
     */
    const getProductName = (productId) => {
        if (!productId) return null;
        const product = productList.find(p => p.id === productId);
        return product ? `${product.productCode} - ${product.productName}` : null;
    };

    /**
     * Update properties config based on current level
     */
    useEffect(() => {
        const level = getCurrentLevel();
        if (level) {
            const config = getPropertiesForLevel(industryType, level);
            setPropertiesConfig(config);
        }
    }, [isCreateMode, industryType, selectedNode, parentNodeForCreate]);

    /**
     * Populate form data when selectedNode changes (edit mode)
     */
    useEffect(() => {
        if (!isCreateMode && selectedNode) {
            const initData = {
                title: selectedNode.title,
                level: selectedNode.level,
                ...selectedNode.properties,
            };
            // Pre-populate productId if exists
            if (selectedNode.productId) {
                initData.productId = selectedNode.productId;
            }
            form.setFieldsValue(initData);
            loadChildren();
        }
    }, [selectedNode, isCreateMode]);

    /**
     * Reset form when entering create mode
     */
    useEffect(() => {
        if (isCreateMode) {
            form.resetFields();
            setChildren([]);
        }
    }, [isCreateMode]);

    /**
     * Load products list từ API
     */
    useEffect(() => {
        if (tenantId && industryType) {
            loadProducts();
        }
    }, [tenantId, industryType]);

    const loadProducts = async () => {
        try {
            setProductLoading(true);
            // Gửi fullList=true + industryType để lấy sản phẩm của kho này thôi
            const response = await getProducts(tenantId, { 
                fullList: true,
                industryType: industryType  // 🔥 Filter by workspace's industryType
            });
            console.log('📦 [LocationDetailCard] API response for industryType:', industryType, response);
            
            // response là direct array (legacy mode) hoặc {data: [...]}
            let products = [];
            
            if (Array.isArray(response)) {
                // Legacy mode: response là direct array
                products = response;
            } else if (response && response.data && Array.isArray(response.data)) {
                // Case: { data: [...] }
                products = response.data;
            } else if (response && response.content && Array.isArray(response.content)) {
                // Case: { content: [...], totalElements: X } (pagination)
                products = response.content;
            }
            
            console.log('✅ [LocationDetailCard] Products loaded for', industryType + ':', products.length, products);
            setProductList(Array.isArray(products) ? products : []);
        } catch (error) {
            console.error('❌ [LocationDetailCard] Error loading products:', error);
            setProductList([]);
        } finally {
            setProductLoading(false);
        }
    };
    const loadChildren = async () => {
        if (!selectedNode || !tenantId) return;

        try {
            setChildrenLoading(true);
            const response = await getChildLocations(tenantId, selectedNode.key);
            if (response.success && response.data) {
                setChildren(response.data);
            }
        } catch (error) {
            console.error('Lỗi tải location con:', error);
            message.error('Không thể tải danh sách location con');
        } finally {
            setChildrenLoading(false);
        }
    };

    /**
     * Tạo location mới
     */
    const handleCreate = async (values) => {
        if (!tenantId) {
            message.error('Không tìm thấy workspace');
            return;
        }

        try {
            setLoading(true);

            // Chuyển đổi form data thành properties
            const propertiesData = formDataToProperties(
                industryType,
                values.level,
                values
            );

            const newLocation = {
                name: values.title,
                code: values.code || `LOC-${Date.now()}`, // Generate code if not provided
                level: values.level,
                industryType: industryType,
                parentId: parentNodeForCreate?.key || null, // Set parentId nếu có parent
                properties: propertiesData,
            };

            // Add productId if selected
            if (values.productId) {
                newLocation.productId = values.productId;
            }

            const response = await createLocation(tenantId, newLocation);

            if (response.success) {
                message.success('Tạo vị trí thành công!');
                form.resetFields();
                if (onUpdated) {
                    onUpdated(); // Reload tree
                }
            } else {
                message.error(response.message || 'Tạo vị trí thất bại');
            }
        } catch (error) {
            console.error('Lỗi tạo location:', error);
            message.error('Lỗi tạo location');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cập nhật location
     */
    const handleUpdate = async (values) => {
        if (!selectedNode || !tenantId) return;

        try {
            setLoading(true);
            
            // Chuyển đổi form data thành properties
            const propertiesData = formDataToProperties(
                industryType,
                selectedNode.level,
                values
            );

            const updateData = {
                name: values.title,
                properties: propertiesData,
            };

            // Add productId if selected
            if (values.productId) {
                updateData.productId = values.productId;
            }

            const response = await updateLocation(tenantId, selectedNode.key, updateData);
            
            if (response.success) {
                message.success('Cập nhật vị trí thành công');
                if (onUpdated) {
                    onUpdated();
                }
            }
        } catch (error) {
            console.error('Lỗi cập nhật location:', error);
            message.error('Cập nhật vị trí thất bại');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Xóa location
     */
    const handleDelete = async () => {
        if (!selectedNode || !tenantId) {
            console.warn('❌ [handleDelete] Missing selectedNode or tenantId', {
                selectedNode: !!selectedNode,
                tenantId: !!tenantId
            });
            return;
        }

        console.log('🗑️ [handleDelete] Attempting to delete:', {
            locationId: selectedNode.key,
            locationTitle: selectedNode.title,
            tenantId: tenantId
        });

        if (window.confirm('Bạn chắc chắn muốn xóa vị trí này?')) {
            try {
                setLoading(true);
                console.log('📤 [handleDelete] Sending DELETE request...');
                
                const response = await deleteLocation(tenantId, selectedNode.key);
                
                console.log('📥 [handleDelete] Response received:', response);
                
                if (response.success) {
                    console.log('✅ [handleDelete] Delete successful!');
                    message.success('Xóa vị trí thành công');
                    form.resetFields();
                    setChildren([]);
                    if (onDeleted) {
                        console.log('🔄 [handleDelete] Calling onDeleted callback');
                        onDeleted();
                    }
                } else {
                    console.warn('⚠️ [handleDelete] Response success=false', {
                        message: response.message
                    });
                    message.error(response.message || 'Xóa vị trí thất bại');
                }
            } catch (error) {
                console.error('❌ [handleDelete] Error deleting location:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                message.error('Xóa vị trí thất bại: ' + error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    // Render create form
    if (isCreateMode) {
        return (
            <div className={styles.container}>
                <Spin spinning={loading}>
                    {/* ========== CREATE FORM HEADER ========== */}
                    <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', marginBottom: '16px' }}>
                        <h3 style={{ marginBottom: '8px' }}>✨ Tạo Vị Trí Mới</h3>
                        <p style={{ marginBottom: 0, color: '#666', fontSize: '12px' }}>
                            {parentNodeForCreate 
                                ? `Parent: ${parentNodeForCreate.title}`
                                : 'Tạo vị trí gốc'}
                        </p>
                    </div>

                    {/* ========== CREATE FORM ========== */}
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleCreate}
                            className={styles.form}
                            initialValues={{ title: '', code: '', level: getCurrentLevel() }}
                        >
                        {/* Title */}
                        <Form.Item
                            label="Tên vị trí"
                            name="title"
                            rules={[
                                { required: true, message: 'Tên vị trí không được để trống' },
                            ]}
                        >
                            <Input placeholder="VD: Khu vực A, Dãy 1, Hộc 1A" autoFocus allowClear />
                        </Form.Item>

                        {/* Code */}
                        <Form.Item
                            label="Mã vị trí"
                            name="code"
                            help="Để trống để tự động sinh mã"
                        >
                            <Input placeholder="VD: ZONE-A, RACK-1" allowClear />
                        </Form.Item>

                        {/* Level (Select) */}
                        <Form.Item
                            label="Cấp độ"
                            name="level"
                            required
                        >
                            <Select
                                options={LOCATION_LEVELS.map(level => ({
                                    value: level.value,
                                    label: `${level.icon} ${level.label}`
                                }))}
                            />
                        </Form.Item>

                        {/* Product Selection */}
                        <Form.Item
                            label="Sản phẩm"
                            name="productId"
                            help="Chọn sản phẩm để gán vị trí này"
                        >
                            <Select
                                placeholder={productLoading ? "Đang tải sản phẩm..." : "Chọn sản phẩm..."}
                                loading={productLoading}
                                allowClear
                                showSearch
                                notFoundContent={productList.length === 0 ? "Không có sản phẩm nào" : null}
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={productList && productList.length > 0 ? productList.map(product => {
                                    if (!product || !product.id) {
                                        console.warn('⚠️ Invalid product:', product);
                                        return null;
                                    }
                                    return {
                                        value: product.id,
                                        label: `${product.productCode || 'N/A'} - ${product.productName || 'Unknown'}`
                                    };
                                }).filter(Boolean) : []}
                            />
                        </Form.Item>

                        {/* Dynamic Properties theo industryType + level */}
                        {propertiesConfig.map((prop) => (
                            <div key={prop.key}>
                                {prop.type === 'input' && (
                                    <Form.Item
                                        label={prop.label}
                                        name={prop.key}
                                        help={prop.help}
                                    >
                                        <Input
                                            placeholder={prop.placeholder}
                                            allowClear
                                        />
                                    </Form.Item>
                                )}

                                {prop.type === 'textarea' && (
                                    <Form.Item
                                        label={prop.label}
                                        name={prop.key}
                                        help={prop.help}
                                    >
                                        <Input.TextArea
                                            placeholder={prop.placeholder}
                                            rows={3}
                                            allowClear
                                        />
                                    </Form.Item>
                                )}

                                {prop.type === 'select' && (
                                    <Form.Item
                                        label={prop.label}
                                        name={prop.key}
                                        help={prop.help}
                                    >
                                        <Select
                                            placeholder={prop.placeholder}
                                            options={prop.options}
                                            allowClear
                                        />
                                    </Form.Item>
                                )}

                                {prop.type === 'checkbox' && (
                                    <Form.Item
                                        name={prop.key}
                                        valuePropName="checked"
                                        help={prop.help}
                                    >
                                        <Checkbox>{prop.label}</Checkbox>
                                    </Form.Item>
                                )}
                            </div>
                        ))}

                        {/* Form Actions */}
                        <Form.Item style={{ marginTop: '24px', marginBottom: 0 }}>
                            <Space>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SaveOutlined />}
                                    loading={loading}
                                >
                                    Tạo
                                </Button>
                                <Button
                                    icon={<CloseOutlined />}
                                    onClick={onCreateCancel}
                                >
                                    Hủy
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Spin>
            </div>
        );
    }

    if (!selectedNode) {
        return (
            <div className={styles.container}>
                <Empty
                    description="Chọn một vị trí để xem chi tiết"
                    style={{ marginTop: '48px' }}
                />
            </div>
        );
    }

    // Cấu hình cột bảng children
    const childrenColumns = [
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            render: (text) => text || '—',
        },
        {
            title: 'Cấp độ',
            dataIndex: 'level',
            key: 'level',
            width: 120,
            render: (text) => text || '—',
        },
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
            width: 100,
            render: (text) => text || '—',
        },
    ];

    return (
        <div className={styles.container}>
            <Spin spinning={loading}>
                {/* ========== FORM ========== */}
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdate}
                    className={styles.form}
                >
                    {/* Location Code & Product Info (Edit Mode) */}
                    {selectedNode && !isCreateMode && (
                        <div className={styles.infoSection}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#999' }}>Mã vị trí</p>
                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                                        {selectedNode.key}
                                    </p>
                                </div>
                                {selectedNode.productId && (
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#999' }}>Sản phẩm được gán</p>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#1890ff', fontWeight: 'bold' }}>
                                            📦 {getProductName(selectedNode.productId)}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <hr style={{ margin: '16px 0' }} />
                        </div>
                    )}

                    {/* Title */}
                    <Form.Item
                        label="Tên vị trí"
                        name="title"
                        rules={[
                            { required: true, message: 'Tên vị trí không được để trống' },
                        ]}
                    >
                        <Input placeholder="VD: Khu vực A, Dãy 1, Hộc 1A" />
                    </Form.Item>

                    {/* Level (Read-only) */}
                    <Form.Item label="Cấp độ">
                        <Input
                            value={selectedNode.level || '—'}
                            disabled
                            className={styles.readonlyInput}
                        />
                    </Form.Item>

                    {/* Product Selection */}
                    <Form.Item
                        label="Sản phẩm"
                        name="productId"
                        help="Chọn sản phẩm để gán vị trí này"
                    >
                        <Select
                            placeholder={productLoading ? "Đang tải sản phẩm..." : "Chọn sản phẩm..."}
                            loading={productLoading}
                            allowClear
                            showSearch
                            notFoundContent={productList.length === 0 ? "Không có sản phẩm nào" : null}
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={productList && productList.length > 0 ? productList.map(product => {
                                if (!product || !product.id) {
                                    console.warn('⚠️ Invalid product:', product);
                                    return null;
                                }
                                return {
                                    value: product.id,
                                    label: `${product.productCode || 'N/A'} - ${product.productName || 'Unknown'}`
                                };
                            }).filter(Boolean) : []}
                        />
                    </Form.Item>

                    {/* Dynamic Properties theo industryType + level */}
                    {propertiesConfig.map((prop) => (
                        <div key={prop.key}>
                            {prop.type === 'input' && (
                                <Form.Item
                                    label={prop.label}
                                    name={prop.key}
                                    help={prop.help}
                                >
                                    <Input
                                        placeholder={prop.placeholder}
                                        allowClear
                                    />
                                </Form.Item>
                            )}

                            {prop.type === 'textarea' && (
                                <Form.Item
                                    label={prop.label}
                                    name={prop.key}
                                    help={prop.help}
                                >
                                    <Input.TextArea
                                        placeholder={prop.placeholder}
                                        rows={3}
                                        allowClear
                                    />
                                </Form.Item>
                            )}

                            {prop.type === 'select' && (
                                <Form.Item
                                    label={prop.label}
                                    name={prop.key}
                                    help={prop.help}
                                >
                                    <Select
                                        placeholder="Chọn..."
                                        options={prop.options || []}
                                        allowClear
                                    />
                                </Form.Item>
                            )}

                            {prop.type === 'checkbox' && (
                                <Form.Item
                                    name={prop.key}
                                    valuePropName="checked"
                                    help={prop.help}
                                >
                                    <Checkbox>{prop.label}</Checkbox>
                                </Form.Item>
                            )}

                            {prop.type === 'number' && (
                                <Form.Item
                                    label={prop.label}
                                    name={prop.key}
                                    help={prop.help}
                                >
                                    <Input
                                        type="number"
                                        placeholder={prop.placeholder}
                                    />
                                </Form.Item>
                            )}
                        </div>
                    ))}

                    {/* Actions */}
                    <Form.Item className={styles.formActions}>
                        <Space size="middle">
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                htmlType="submit"
                                loading={loading}
                            >
                                Lưu thay đổi
                            </Button>
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={handleDelete}
                                loading={loading}
                            >
                                Xóa
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>

                {/* ========== CHILDREN LIST ========== */}
                {children.length > 0 && (
                    <>
                        <Divider className={styles.divider} />
                        <div className={styles.childrenSection}>
                            <h4 className={styles.childrenTitle}>Vị trí con</h4>
                            <Table
                                columns={childrenColumns}
                                dataSource={children}
                                rowKey="id"
                                pagination={false}
                                size="small"
                                loading={childrenLoading}
                                className={styles.childrenTable}
                            />
                        </div>
                    </>
                )}
            </Spin>
        </div>
    );
};

export default LocationDetailCard;
