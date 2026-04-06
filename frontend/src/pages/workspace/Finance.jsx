import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Modal, Form, Input, InputNumber, Select, Space, message } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import * as financeApi from '../../api/financeApi';
import FinanceDashboardCards from './components/FinanceDashboardCards';
import DebtTable from './components/DebtTable';
import FinanceCharts from './components/FinanceCharts';
import styles from './Finance.module.css';

/**
 * Finance.jsx — Trang Tài chính & Công nợ
 * Quản lý dashboard tài chính, công nợ, và báo cáo COGS
 */
const Finance = () => {
    const { currentWorkspace } = useAuth();
    const workspaceId = currentWorkspace?.id;

    // ==================== State ====================
    const [metrics, setMetrics] = useState(null);
    const [debts, setDebts] = useState([]);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tabsLoading, setTabsLoading] = useState(false);
    
    const [isDebtModalVisible, setIsDebtModalVisible] = useState(false);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [debtForm] = Form.useForm();
    const [paymentForm] = Form.useForm();

    // ==================== Effects ====================
    useEffect(() => {
        if (workspaceId) {
            loadDashboardData();
        }
    }, [workspaceId]);

    // ==================== Data Loading ====================
    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Gọi API metrics
            const metricsResponse = await financeApi.getDashboardMetrics(workspaceId);
            setMetrics(metricsResponse?.data || null);

            // Gọi API báo cáo
            const reportResponse = await financeApi.getLatestReport(workspaceId);
            setReport(reportResponse?.data || null);
        } catch (error) {
            console.error('Lỗi tải dashboard:', error);
            message.error('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const loadDebts = async () => {
        setTabsLoading(true);
        try {
            const response = await financeApi.getAllDebts(workspaceId);
            setDebts(response?.data || []);
        } catch (error) {
            console.error('Lỗi tải công nợ:', error);
            message.error('Không thể tải danh sách công nợ. Vui lòng thử lại.');
        } finally {
            setTabsLoading(false);
        }
    };

    // ==================== Modal Handlers ====================
    const handleOpenDebtModal = () => {
        setSelectedDebt(null);
        debtForm.resetFields();
        setIsDebtModalVisible(true);
    };

    const handleCloseDebtModal = () => {
        setIsDebtModalVisible(false);
        debtForm.resetFields();
    };

    const handleCreateDebt = async (values) => {
        try {
            const debtData = {
                partnerId: values.partnerId,
                partnerName: values.partnerName,
                type: values.type,
                totalDebt: values.totalDebt,
                creditLimit: values.creditLimit,
                notes: values.notes,
                status: 'ACTIVE',
            };

            await financeApi.createDebt(workspaceId, debtData);
            message.success('Tạo công nợ thành công');
            handleCloseDebtModal();
            loadDebts();
            loadDashboardData();
        } catch (error) {
            console.error('Lỗi tạo công nợ:', error);
            message.error(error?.response?.data?.message || 'Không thể tạo công nợ');
        }
    };

    const handleOpenPaymentModal = (debt) => {
        setSelectedDebt(debt);
        paymentForm.resetFields();
        setIsPaymentModalVisible(true);
    };

    const handleClosePaymentModal = () => {
        setIsPaymentModalVisible(false);
        paymentForm.resetFields();
    };

    const handlePayDebt = async (values) => {
        try {
            await financeApi.payDebt(workspaceId, selectedDebt.id, values.amount);
            message.success('Thanh toán công nợ thành công');
            handleClosePaymentModal();
            loadDebts();
            loadDashboardData();
        } catch (error) {
            console.error('Lỗi thanh toán công nợ:', error);
            message.error(error?.response?.data?.message || 'Không thể thanh toán');
        }
    };

    const handleDeleteDebt = async (debtId) => {
        try {
            await financeApi.deleteDebt(workspaceId, debtId);
            message.success('Xóa công nợ thành công');
            loadDebts();
            loadDashboardData();
        } catch (error) {
            console.error('Lỗi xóa công nợ:', error);
            message.error(error?.response?.data?.message || 'Không thể xóa công nợ');
        }
    };

    // ==================== Tab Change Handler ====================
    const handleTabChange = (key) => {
        if (key === '2') {
            // Tab "Quản lý Công nợ" - load dữ liệu
            loadDebts();
        }
    };

    // ==================== Render ====================
    return (
        <div className={styles.financeContainer}>
            {/* Header */}
            <Card
                title="💰 Tài Chính & Công Nợ"
                extra={
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadDashboardData}
                            loading={loading}
                        >
                            Làm mới
                        </Button>
                    </Space>
                }
                style={{ marginBottom: '16px' }}
            >
                {/* Dashboard Cards */}
                <FinanceDashboardCards metricsData={metrics} loading={loading} />
            </Card>

            {/* Main Content Tabs */}
            <Card>
                <Tabs
                    defaultActiveKey="1"
                    onChange={handleTabChange}
                    items={[
                        {
                            key: '1',
                            label: '📊 Báo Cáo COGS',
                            children: (
                                <FinanceCharts
                                    reportData={report}
                                    loading={loading}
                                />
                            ),
                        },
                        {
                            key: '2',
                            label: '📋 Quản Lý Công Nợ',
                            children: (
                                <div style={{ marginBottom: '16px' }}>
                                    <Space style={{ marginBottom: '16px' }}>
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={handleOpenDebtModal}
                                        >
                                            Tạo Công Nợ Mới
                                        </Button>
                                        <Button
                                            icon={<ReloadOutlined />}
                                            onClick={loadDebts}
                                            loading={tabsLoading}
                                        >
                                            Làm Mới
                                        </Button>
                                    </Space>

                                    <DebtTable
                                        debts={debts}
                                        loading={tabsLoading}
                                        onPayDebt={handleOpenPaymentModal}
                                        onDeleteDebt={handleDeleteDebt}
                                    />
                                </div>
                            ),
                        },
                    ]}
                />
            </Card>

            {/* Modal: Tạo Công Nợ Mới */}
            <Modal
                title="Tạo Công Nợ Mới"
                open={isDebtModalVisible}
                onCancel={handleCloseDebtModal}
                onOk={() => debtForm.submit()}
            >
                <Form
                    form={debtForm}
                    layout="vertical"
                    onFinish={handleCreateDebt}
                >
                    <Form.Item
                        label="Mã Đối Tác"
                        name="partnerId"
                        rules={[{ required: true, message: 'Vui lòng nhập mã đối tác' }]}
                    >
                        <Input placeholder="VD: PARTNER_001" />
                    </Form.Item>

                    <Form.Item
                        label="Tên Đối Tác"
                        name="partnerName"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đối tác' }]}
                    >
                        <Input placeholder="VD: Công ty ABC" />
                    </Form.Item>

                    <Form.Item
                        label="Phân Loại"
                        name="type"
                        rules={[{ required: true, message: 'Vui lòng chọn phân loại' }]}
                    >
                        <Select
                            placeholder="Chọn loại công nợ"
                            options={[
                                { label: 'Nợ Phải Trả (Payable)', value: 'PAYABLE' },
                                { label: 'Nợ Phải Thu (Receivable)', value: 'RECEIVABLE' },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Tổng Nợ (VND)"
                        name="totalDebt"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tổng nợ' },
                            { type: 'number', min: 0, message: 'Giá trị phải ≥ 0' },
                        ]}
                    >
                        <InputNumber
                            placeholder="0"
                            style={{ width: '100%' }}
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        label="Hạn Mức Tín Dụng (VND)"
                        name="creditLimit"
                        rules={[
                            { required: true, message: 'Vui lòng nhập hạn mức tín dụng' },
                            { type: 'number', min: 0, message: 'Giá trị phải ≥ 0' },
                        ]}
                    >
                        <InputNumber
                            placeholder="0"
                            style={{ width: '100%' }}
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            }
                        />
                    </Form.Item>

                    <Form.Item label="Ghi Chú" name="notes">
                        <Input.TextArea rows={3} placeholder="Ghi chú thêm (tùy chọn)" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal: Thanh Toán Công Nợ */}
            <Modal
                title={`Thanh Toán Công Nợ: ${selectedDebt?.partnerName}`}
                open={isPaymentModalVisible}
                onCancel={handleClosePaymentModal}
                onOk={() => paymentForm.submit()}
            >
                <Form
                    form={paymentForm}
                    layout="vertical"
                    onFinish={handlePayDebt}
                >
                    <Form.Item label="Dư Nợ Hiện Tại">
                        <Input
                            disabled
                            value={`${selectedDebt?.balance.toLocaleString('vi-VN')} ₫`}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Số Tiền Thanh Toán (VND)"
                        name="amount"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số tiền thanh toán' },
                            { type: 'number', min: 0, message: 'Giá trị phải > 0' },
                        ]}
                    >
                        <InputNumber
                            placeholder="0"
                            style={{ width: '100%' }}
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            }
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Finance;
