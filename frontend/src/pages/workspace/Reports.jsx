import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Space, message, Spin } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as reportsApi from '../../api/reportsApi';
import ReportsKPICards from './components/ReportsKPICards';
import OverviewChart from './components/OverviewChart';
import AbcAnalysisTable from './components/AbcAnalysisTable';
import DeadStockTable from './components/DeadStockTable';
import ReportInventoryValue from './Reports/ReportInventoryValue';
import ReportAbcAnalysis from './Reports/ReportAbcAnalysis';
import ReportIndustrySpecific from './Reports/ReportIndustrySpecific';
import styles from './Reports.module.css';
import reportsStyles from './Reports/Reports.module.css';

/**
 * Reports.jsx - Trang Báo cáo & Phân tích dành cho Kế toán (Hợp nhất)
 *
 * Gồm các Tabs:
 * 1. Tổng quan - Biểu đồ xu hướng 6 tháng
 * 2. Phân tích ABC - Bảng phân loại sản phẩm
 * 3. Cảnh báo Dead Stock - Bảng hàng tồn
 * 4. Báo cáo Chi Tiết (Custom Grid layout từ lam-thanh)
 */

// Map industryCode (from workspace) to industryType (for API)
const mapIndustryCodeToType = (code) => {
    if (!code) return 'ELECTRONICS'; // Default

    const upperCode = code.toUpperCase();
    if (['ELECTRONICS', 'TECH', 'FASHION', 'APPLIANCES'].includes(upperCode)) {
        return 'ELECTRONICS';
    }
    if (['FMCG', 'GROCERY', 'FNB', 'PHARMACY', 'F&B'].includes(upperCode)) {
        return 'GROCERY';
    }
    return 'ELECTRONICS';
};

const Reports = () => {
    const { workspaceId: paramWorkspaceId } = useParams();
    const { currentWorkspace } = useAuth();

    const workspaceId = paramWorkspaceId || currentWorkspace?.id;
    const industryType = mapIndustryCodeToType(currentWorkspace?.industryCode);

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
            const mockData = reportsApi.getMockOverviewChartData();
            setOverviewData(mockData);
        } catch (error) {
            console.error('Error loading overview data:', error);
            message.error('Lỗi tải dữ liệu tổng quan');
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

    if (!workspaceId) {
        return <div>Không tìm thấy workspace</div>;
    }

    // ==================== Custom Reports Grid ====================
    const CustomReportsGrid = () => (
        <div className={reportsStyles.reportsGrid}>
            <div className={reportsStyles.reportCard}>
                <ReportInventoryValue tenantId={workspaceId} industryType={industryType} />
            </div>
            <div className={reportsStyles.reportCard}>
                <ReportAbcAnalysis tenantId={workspaceId} industryType={industryType} />
            </div>
            <div className={reportsStyles.reportCard}>
                <ReportIndustrySpecific tenantId={workspaceId} industryType={industryType} />
            </div>
        </div>
    );

    // ==================== UI Tab Items ====================
    const tabItems = [
        {
            key: '1',
            label: '📊 Tổng Quan (Sales)',
            children: (
                <div className={styles.tabsContent}>
                    <OverviewChart data={overviewData} loading={loadingOverview} />
                </div>
            ),
        },
        {
            key: '2',
            label: '📈 Phân Tích ABC (Sales)',
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
            label: '⚠️ Dead Stock (Bán Hàng)',
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
        {
            key: '4',
            label: '📋 Báo Cáo Chuyên Sâu (Ngành Hàng)',
            children: (
                <div className={styles.tabsContent}>
                    <CustomReportsGrid />
                </div>
            ),
        }
    ];

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
