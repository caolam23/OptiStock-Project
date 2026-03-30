import React from 'react';
import { Form, Card, DatePicker, InputNumber, Input, Button, Space, Empty, Table, Tag } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

/**
 * SectionBatchManagement: Quản lý Lô hàng & Hạn sử dụng (GROCERY)
 * 
 * Cho phép nhập:
 * - Mã lô hàng (batchCode)
 * - Ngày sản xuất (manufactureDate)
 * - Hạn sử dụng (expiryDate)
 * - Số lượng trong lô (quantity)
 * 
 * Dữ liệu được lưu trong field "batches" của Product document
 */
const SectionBatchManagement = ({ form, industryType }) => {
    // Chỉ hiển thị nếu là ngành Grocery
    if (industryType !== 'GROCERY') {
        return null;
    }

    const batches = form.getFieldValue('batches') || [];

    /**
     * Xóa một lô hàng khỏi danh sách
     */
    const handleRemoveBatch = (index) => {
        const updatedBatches = batches.filter((_, i) => i !== index);
        form.setFieldValue('batches', updatedBatches);
    };

    /**
     * Tính số ngày còn lại đến hạn sử dụng
     */
    const getDaysToExpiry = (expiryDate) => {
        if (!expiryDate) return null;
        const expiry = dayjs(expiryDate);
        const today = dayjs();
        return expiry.diff(today, 'day');
    };

    /**
     * Render status badge cho hạn sử dụng
     */
    const getExpiryStatus = (expiryDate) => {
        const daysLeft = getDaysToExpiry(expiryDate);
        if (!daysLeft) return null;
        if (daysLeft < 0) return <Tag color="red">Đã hết hạn</Tag>;
        if (daysLeft < 30) return <Tag color="orange">Sắp hết hạn ({daysLeft} ngày)</Tag>;
        return <Tag color="green">Còn hạn ({daysLeft} ngày)</Tag>;
    };

    // ==================== COLUMNS CHO TABLE ====================
    const columns = [
        {
            title: 'Mã Lô',
            dataIndex: 'batchCode',
            key: 'batchCode',
            width: '15%',
        },
        {
            title: 'Ngày Sản Xuất',
            dataIndex: 'manufactureDate',
            key: 'manufactureDate',
            width: '15%',
            render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
        },
        {
            title: 'Hạn Sử Dụng',
            dataIndex: 'expiryDate',
            key: 'expiryDate',
            width: '15%',
            render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'expiryDate',
            key: 'status',
            width: '15%',
            render: (expiryDate) => getExpiryStatus(expiryDate),
        },
        {
            title: 'Số Lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: '10%',
            render: (quantity) => <span>{quantity || 0}</span>,
        },
        {
            title: 'Hành Động',
            key: 'action',
            width: '10%',
            render: (_, record, index) => (
                <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveBatch(index)}
                >
                    Xóa
                </Button>
            ),
        },
    ];

    return (
        <Card
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📦 Quản lý Lô hàng & Hạn sử dụng</span>
                </div>
            }
            style={{ marginTop: '20px' }}
            variant="borderless"
            className="section-card"
        >
            {batches && batches.length > 0 ? (
                <Table
                    dataSource={batches.map((batch, idx) => ({ ...batch, key: idx }))}
                    columns={columns}
                    pagination={false}
                    size="small"
                    style={{ marginBottom: '20px' }}
                />
            ) : (
                <Empty description="Chưa có lô hàng nào" style={{ margin: '20px 0' }} />
            )}

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <div style={{ marginBottom: '15px', fontWeight: '500' }}>Thêm Lô Hàng Mới</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    {/* Mã Lô Hàng */}
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>
                            Mã Lô Hàng <span style={{ color: 'red' }}>*</span>
                        </label>
                        <Input
                            id="batchCode"
                            placeholder="VD: CP-20240101-001"
                            style={{ height: '32px' }}
                        />
                    </div>

                    {/* Số Lượng */}
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>
                            Số Lượng <span style={{ color: 'red' }}>*</span>
                        </label>
                        <InputNumber
                            id="batchQuantity"
                            min={1}
                            placeholder="VD: 1000"
                            style={{ width: '100%', height: '32px' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {/* Ngày Sản Xuất */}
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>
                            Ngày Sản Xuất
                        </label>
                        <DatePicker
                            id="batchMfgDate"
                            placeholder="Chọn ngày sản xuất"
                            style={{ width: '100%', height: '32px' }}
                            format="DD/MM/YYYY"
                        />
                    </div>

                    {/* Hạn Sử Dụng */}
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>
                            Hạn Sử Dụng <span style={{ color: 'red' }}>*</span>
                        </label>
                        <DatePicker
                            id="batchExpiryDate"
                            placeholder="Chọn hạn sử dụng"
                            style={{ width: '100%', height: '32px' }}
                            format="DD/MM/YYYY"
                        />
                    </div>
                </div>

                {/* Button Thêm */}
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        const batchCode = document.getElementById('batchCode')?.value;
                        const batchQuantity = document.getElementById('batchQuantity')?.value;
                        const batchMfgDate = document.getElementById('batchMfgDate')?.value;
                        const batchExpiryDate = document.getElementById('batchExpiryDate')?.value;

                        if (!batchCode || !batchQuantity || !batchExpiryDate) {
                            alert('Vui lòng nhập đầy đủ Mã Lô, Số lượng và Hạn sử dụng');
                            return;
                        }

                        const newBatch = {
                            batchCode,
                            quantity: parseInt(batchQuantity),
                            manufactureDate: batchMfgDate ? new Date(batchMfgDate) : null,
                            expiryDate: new Date(batchExpiryDate),
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        };

                        form.setFieldValue('batches', [...batches, newBatch]);

                        // Reset form fields
                        document.getElementById('batchCode').value = '';
                        document.getElementById('batchQuantity').value = '';
                        document.getElementById('batchMfgDate').value = '';
                        document.getElementById('batchExpiryDate').value = '';
                    }}
                    style={{ marginTop: '12px', width: '100%' }}
                >
                    Thêm Lô Hàng
                </Button>
            </div>
        </Card>
    );
};

export default SectionBatchManagement;
