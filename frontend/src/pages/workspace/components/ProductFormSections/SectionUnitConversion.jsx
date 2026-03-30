import React from 'react';
import { Card, Input, InputNumber, Button, Space, Empty, Table, Tag, Tooltip } from 'antd';
import { DeleteOutlined, PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';

/**
 * SectionUnitConversion: Quản lý Quy đổi đơn vị (GROCERY)
 * 
 * Cho phép nhập:
 * - Tên đơn vị (unitName) - VD: "Thùng", "Lốc", "Lon"
 * - Hệ số quy đổi (conversionRate) - VD: 24 (1 Thùng = 24 Lon)
 * - Mã vạch (barcode) - VD: "8936024000013"
 * 
 * Dữ liệu được lưu trong field "unitConversions" của Product document
 * 
 * Ví dụ:
 * - Đơn vị cơ bản: Lon (Cái)
 * - Quy đổi 1: 1 Lốc = 24 Lon → { unitName: "Lốc", conversionRate: 24, barcode: "..." }
 * - Quy đổi 2: 1 Thùng = 6 Lốc = 144 Lon → { unitName: "Thùng", conversionRate: 144, barcode: "..." }
 */
const SectionUnitConversion = ({ form, industryType, mainUnit }) => {
    // Chỉ hiển thị nếu là ngành Grocery
    if (industryType !== 'GROCERY') {
        return null;
    }

    const unitConversions = form.getFieldValue('unitConversions') || [];

    /**
     * Xóa một quy đổi khỏi danh sách
     */
    const handleRemoveConversion = (index) => {
        const updatedConversions = unitConversions.filter((_, i) => i !== index);
        form.setFieldValue('unitConversions', updatedConversions);
    };

    /**
     * Tính toán tỉ lệ tích lũy (cascading conversion)
     * VD: Thùng (144) = 6 Lốc (24) = 144 Lon
     */
    const calculateCumulativeRatio = (index) => {
        let cumulativeRatio = 1;
        for (let i = 0; i <= index; i++) {
            if (unitConversions[i]) {
                cumulativeRatio *= unitConversions[i].conversionRate || 1;
            }
        }
        return cumulativeRatio;
    };

    // ==================== COLUMNS CHO TABLE ====================
    const columns = [
        {
            title: 'Đơn Vị',
            dataIndex: 'unitName',
            key: 'unitName',
            width: '15%',
        },
        {
            title: (
                <Tooltip title="Tỉ lệ quy đổi so với đơn vị cơ bản">
                    Quy Đổi <InfoCircleOutlined style={{ marginLeft: '4px' }} />
                </Tooltip>
            ),
            key: 'conversion',
            width: '20%',
            render: (_, record, index) => {
                const conversionRate = record.conversionRate;
                const cumulativeRatio = calculateCumulativeRatio(index);
                return (
                    <div>
                        <div>1 {record.unitName} = {conversionRate} {mainUnit}</div>
                        {index > 0 && (
                            <div style={{ fontSize: '12px', color: '#999' }}>
                                (Tích lũy: 1 {record.unitName} = {cumulativeRatio} {mainUnit})
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Mã Vạch',
            dataIndex: 'barcode',
            key: 'barcode',
            width: '25%',
            render: (barcode) => (
                <Tooltip title={barcode || 'Chưa cập nhật'}>
                    <span>{barcode ? `${barcode.substring(0, 12)}...` : '-'}</span>
                </Tooltip>
            ),
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
                    onClick={() => handleRemoveConversion(index)}
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
                    <span>📊 Quy Đổi Đơn Vị</span>
                    <Tooltip title={`Đơn vị cơ bản: ${mainUnit}`}>
                        <Tag color="blue">{mainUnit}</Tag>
                    </Tooltip>
                </div>
            }
            style={{ marginTop: '20px' }}
            variant="borderless"
            className="section-card"
        >
            {/* Hướng dẫn */}
            <div
                style={{
                    padding: '12px',
                    marginBottom: '16px',
                    backgroundColor: '#e6f7ff',
                    border: '1px solid #91d5ff',
                    borderRadius: '4px',
                    fontSize: '12px',
                }}
            >
                <strong>💡 Cách sử dụng:</strong> Nhập các đơn vị lớn hơn đơn vị cơ bản ({mainUnit}). VD: Thùng (1 Thùng = 24
                Lon), Lốc (1 Lốc = 6 Lon).
            </div>

            {/* Danh sách Quy đổi hiện tại */}
            {unitConversions && unitConversions.length > 0 ? (
                <Table
                    dataSource={unitConversions.map((conv, idx) => ({ ...conv, key: idx }))}
                    columns={columns}
                    pagination={false}
                    size="small"
                    style={{ marginBottom: '20px' }}
                />
            ) : (
                <Empty description="Chưa có quy đổi nào" style={{ margin: '20px 0' }} />
            )}

            {/* Form thêm quy đổi mới */}
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <div style={{ marginBottom: '15px', fontWeight: '500' }}>Thêm Quy Đổi Mới</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                    {/* Tên Đơn Vị */}
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>
                            Tên Đơn Vị <span style={{ color: 'red' }}>*</span>
                        </label>
                        <Input id="unitName" placeholder="VD: Thùng, Lốc, Hộp" style={{ height: '32px' }} />
                    </div>

                    {/* Hệ số quy đổi */}
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>
                            Quy Đổi (1 = ? {mainUnit})
                            <span style={{ color: 'red' }}>*</span>
                        </label>
                        <InputNumber
                            id="conversionRate"
                            min={1}
                            placeholder="VD: 24"
                            style={{ width: '100%', height: '32px' }}
                        />
                    </div>

                    {/* Mã Vạch */}
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px', display: 'block' }}>
                            Mã Vạch
                        </label>
                        <Input
                            id="barcode"
                            placeholder="VD: 893602400..."
                            maxLength={13}
                            style={{ height: '32px' }}
                        />
                    </div>

                    {/* Button Thêm */}
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            const unitName = document.getElementById('unitName')?.value;
                            const conversionRate = document.getElementById('conversionRate')?.value;
                            const barcode = document.getElementById('barcode')?.value || '';

                            if (!unitName || !conversionRate) {
                                alert('Vui lòng nhập Tên Đơn Vị và Hệ số quy đổi');
                                return;
                            }

                            // Kiểm tra xem đơn vị này đã tồn tại chưa
                            if (unitConversions.some((u) => u.unitName.toLowerCase() === unitName.toLowerCase())) {
                                alert('Đơn vị này đã tồn tại, vui lòng nhập tên khác');
                                return;
                            }

                            const newConversion = {
                                unitName,
                                conversionRate: parseInt(conversionRate),
                                barcode,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            };

                            form.setFieldValue('unitConversions', [...unitConversions, newConversion]);

                            // Reset form fields
                            document.getElementById('unitName').value = '';
                            document.getElementById('conversionRate').value = '';
                            document.getElementById('barcode').value = '';
                        }}
                    >
                        Thêm
                    </Button>
                </div>
            </div>

            {/* Ghi chú */}
            <div
                style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#fafafa',
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    fontSize: '12px',
                    lineHeight: '1.6',
                }}
            >
                <strong>📌 Ghi chú:</strong>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                    <li>Mã vạch phải là chuỗi số 13 chữ số (EAN-13)</li>
                    <li>Hệ số quy đổi phải là số dương, không có số thập phân</li>
                    <li>Tên đơn vị không được trùng nhau</li>
                    <li>Quy đổi sẽ được tính tích lũy (cascading) từ trên xuống dưới</li>
                </ul>
            </div>
        </Card>
    );
};

export default SectionUnitConversion;
