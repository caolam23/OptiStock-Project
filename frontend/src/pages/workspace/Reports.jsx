import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Space, message, Spin } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import * as reportsApi from '../../api/reportsApi';
import ReportsKPICards from './components/ReportsKPICards';
import OverviewChart from './components/OverviewChart';
import AbcAnalysisTable from './components/AbcAnalysisTable';
import DeadStockTable from './components/DeadStockTable';
import styles from './Reports.module.css';

/**
 * Reports.jsx - Trang Báo cáo & Phân tích dành cho Kế toán
 *
 * 3 Tabs:
 * 1. Tổng quan - Biểu đồ xu hướng 6 tháng
 * 2. Phân tích ABC - Bảng phân loại sản phẩm
 * 3. Cảnh báo Dead Stock - Bảng hàng tồn > 90 ngày
 */
const Reports = () => {
    const { currentWorkspace } = useAuth();
    const workspaceId = currentWorkspace?.id;

    // ==================== States ====================
    const [overviewData, setOverviewData] = useState([]);
    const [abcData, setAbcData] = useState([]);
    const [deadStockData, setDeadStockData] = useState([]);
    const [thresholdDays, setThresholdDays] = useState(90);

    const [loadingOverview, setLoadingOverview] = useState(false);
    const [loadingABC, setLoadingABC] = useState(false);
    const [loadingDeadStock, setLoadingDeadStock] = useState(false);

    const [exporting, setExporting] = useState(false);

    // ==================== Effects ====================
    useEffect(() => {
        if (workspaceId) {
            loadAllData();
        }
    }, [workspaceId]);

    // ==================== Data Loading ====================
    const loadAllData = async () => {
        await Promise.all([
            loadOverviewData(),
            loadABCData(),
            loadDeadStockData(),
        ]);
    };

    const loadOverviewData = async () => {
        setLoadingOverview(true);
        try {
            // Mock data - thay bằng API call thực tế nếu có
            const mockData = reportsApi.getMockOverviewChartData();
            setOverviewData(mockData);
        } catch (error) {
            console.error('Error loading overview data:', error);
            message.error('Lỗi tải dữ liệu tờng quan');
        } finally {
            setLoadingOverview(false);
        }
    };

    const loadABCData = async () => {
        setLoadingABC(true);
        try {
            const data = await reportsApi.fetchABCAnalysisData(workspaceId);
            setAbcData(data);
        } catch (error) {
            console.error('Error loading ABC data:', error);
            message.error('Lỗi tải dữ liệu phân tích ABC');
        } finally {
            setLoadingABC(false);
        }
    };

    const loadDeadStockData = async () => {
        setLoadingDeadStock(true);
        try {
            const data = await reportsApi.fetchDeadStockData(workspaceId, thresholdDays);
            setDeadStockData(data);
        } catch (error) {
            console.error('Error loading dead stock data:', error);
            message.error('Lỗi tải dữ liệu Dead Stock');
        } finally {
            setLoadingDeadStock(false);
        }
    };

    // ==================== Export Handlers ====================
    const handleExportDeadStock = async () => {
        setExporting(true);
        try {
            await reportsApi.downloadDeadStockExcel(workspaceId, thresholdDays);
            message.success('Tải báo cáo Dead Stock thành công!');
        } catch (error) {
            console.error('Export error:', error);
            message.error('Lỗi khi tải báo cáo');
        } finally {
            setExporting(false);
        }
    };

    const handleExportABCAnalysis = async () => {
        setExporting(true);
        try {
            await reportsApi.downloadABCAnalysisExcel(workspaceId);
            message.success('Tải báo cáo ABC Analysis thành công!');
        } catch (error) {
            console.error('Export error:', error);
            message.error('Lỗi khi tải báo cáo');
        } finally {
            setExporting(false);
        }
    };

    // ==================== UI Tab Items ====================
    const tabItems = [
        {
            key: '1',
            label: '📊 Tổng Quan',
            children: (
                <div className={styles.tabsContent}>
                    <OverviewChart data={overviewData} loading={loadingOverview} />
                </div>
            ),
        },
        {
            key: '2',
            label: '📈 Phân Tích ABC',
            children: (
                <div className={styles.tabsContent}>
                    <div style={{ marginBottom: '16px' }}>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={handleExportABCAnalysis}
                            loading={exporting}
                        >
                            Xuất Excel
                        </Button>
                    </div>
                    <AbcAnalysisTable data={abcData} loading={loadingABC} />
                </div>
            ),
        },
        {
            key: '3',
            label: '⚠️ Dead Stock',
            children: (
                <div className={styles.tabsContent}>
                    <div style={{ marginBottom: '16px' }}>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={handleExportDeadStock}
                            loading={exporting}
                        >
                            Xuất Excel
                        </Button>
                    </div>
                    <DeadStockTable data={deadStockData} loading={loadingDeadStock} />
                </div>
            ),
        },
    ];

    // ==================== Render ====================
    return (
        <div className={styles.reportsContainer}>
            {/* Header */}
            <div className={styles.reportsHeader}>
                <div className={styles.reportsHeaderLeft}>
                    <h1 className={styles.reportsTitle}>📊 Báo Cáo & Phân Tích Kho</h1>
                    <p className={styles.reportsSubtitle}>
                        Thống kê tồn kho, phân tích ABC, Dead Stock và xu hướng bán hàng
                    </p>
                </div>
                <div className={styles.reportsHeaderRight}>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={loadAllData}
                        loading={loadingOverview || loadingABC || loadingDeadStock}
                    >
                        Làm Mới
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <Spin spinning={loadingDeadStock}>
                <ReportsKPICards deadStockData={deadStockData} loading={loadingDeadStock} />
            </Spin>

            {/* Main Tabs */}
            <Card className={styles.tabsContainer} variant="filled">
                <Tabs
                    items={tabItems}
                    defaultActiveKey="1"
                    size="large"
                />
            </Card>
        </div>
    );
};

export default Reports;
