import React, { useState, useMemo } from 'react';
import { Row, Col } from 'antd';
import LocationTreeView from './components/LocationTreeView';
import LocationDetailCard from './components/LocationDetailCard';
import styles from './Locations.module.css';

/**
 * Locations (Locations.jsx) - Trang quản lý Sơ đồ Kho
 * 
 * Layout: Split View 2 cột
 * - Trái: Tree View (LocationTreeView)
 * - Phải: Detail Form (LocationDetailCard)
 * 
 * Tính năng:
 * 1. Auto-load tree theo industry type của workspace
 * 2. Không cần chọn industry type (tự động theo workspace)
 */
const Locations = () => {
    const [selectedNode, setSelectedNode] = useState(null);
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [parentNodeForCreate, setParentNodeForCreate] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger tree reload

    // Lấy workspace info từ localStorage
    const getWorkspaceInfo = () => {
        try {
            const workspace = JSON.parse(localStorage.getItem('currentWorkspace'));
            const workspaceName = workspace?.name || '';
            
            // Auto-detect industryType từ workspace name
            let detectedType = 'ELECTRONICS'; // default
            const nameLower = workspaceName.toLowerCase();
            
            if (nameLower.includes('tạp hóa') || nameLower.includes('grocery') || nameLower.includes('hoho')) {
                detectedType = 'GROCERY';
            } else if (nameLower.includes('điện tử') || nameLower.includes('electronics')) {
                detectedType = 'ELECTRONICS';
            }
            
            console.log('🏪 [Locations] Auto-detected industry:', {
                name: workspaceName,
                detectedType,
                tenantId: workspace?.id
            });
            
            return {
                tenantId: workspace?.id || null,
                industryType: detectedType,
                workspaceName: workspace?.name || 'Unknown'
            };
        } catch (_) {
            return {
                tenantId: null,
                industryType: 'ELECTRONICS',
                workspaceName: 'Unknown'
            };
        }
    };

    const { tenantId, industryType, workspaceName } = useMemo(() => getWorkspaceInfo(), []);

    // Map industryType to display label with icon
    const getIndustryLabel = (type) => {
        const map = {
            'ELECTRONICS': '🔌 Điện tử',
            'GROCERY': '🛒 Tạp hóa'
        };
        return map[type] || type;
    };

    // Get page title based on industry type
    const getPageTitle = (type) => {
        const map = {
            'ELECTRONICS': '📦 Sơ đồ Kho Điện tử',
            'GROCERY': '🛒 Sơ đồ Kho Tạp hóa'
        };
        return map[type] || '📊 Sơ đồ Kho & Vị trí';
    };

    // Get page subtitle based on industry type
    const getPageSubtitle = (type) => {
        const map = {
            'ELECTRONICS': 'Quản lý kho điện tử: Khu vực (Zone) → Dãy/Kệ (Rack) → Tầng/Hộc (Bin) - Tối ưu cho thiết bị điện tử',
            'GROCERY': 'Quản lý kho tạp hóa: Khu vực (Zone) → Dãy/Kệ (Rack) → Tầng/Hộc (Bin) - Tối ưu cho hàng tạp hóa'
        };
        return map[type] || 'Quản lý cấu trúc kho: Khu vực (Zone) → Dãy/Kệ (Rack) → Tầng/Hộc (Bin)';
    };

    /**
     * Xử lý khi chọn node trong tree
     */
    const handleSelectNode = (node) => {
        console.log('✅ [Locations] Setting selectedNode:', node);
        setSelectedNode(node);
    };

    /**
     * Trigger reload tree sau khi cập nhật/xóa/tạo thành công
     */
    const handleLocationUpdated = () => {
        setSelectedNode(null);
        setIsCreateMode(false);
        setParentNodeForCreate(null);
        setRefreshTrigger(prev => prev + 1); // Trigger tree reload
    };

    const handleLocationDeleted = () => {
        setSelectedNode(null);
        setIsCreateMode(false);
        setParentNodeForCreate(null);
        setRefreshTrigger(prev => prev + 1); // Trigger tree reload
    };

    /**
     * Xử lý thêm location mới
     * Nếu có selectedNode, tạo child của node đó
     * Nếu không, tạo root node (ZONE)
     */
    const handleAddNew = () => {
        setIsCreateMode(true);
        setParentNodeForCreate(selectedNode || null);
        // Reset selectedNode để form tự động focus
    };

    return (
        <div className={styles.pageContainer}>
            {/* ========== PAGE HEADER ========== */}
            <div className={styles.pageHeader}>
                <div className={styles.pageHeaderLeft}>
                    <h1 className={styles.pageTitle}>{getPageTitle(industryType)}</h1>
                    <p className={styles.pageSubtitle}>
                        {getPageSubtitle(industryType)}
                    </p>
                    <p className={styles.industryTypeLabel}>
                        <strong>Ngành hàng:</strong> {getIndustryLabel(industryType)}
                    </p>
                </div>
            </div>

            {/* ========== SPLIT VIEW: TREE + DETAIL ========== */}
            <div className={styles.splitViewContainer}>
                <Row gutter={16} style={{ height: '100%' }}>
                    {/* LEFT: Tree */}
                    <Col xs={24} sm={24} md={8} lg={8} className={styles.treeColumn}>
                        <LocationTreeView
                            tenantId={tenantId}
                            industryType={industryType}
                            onSelectNode={handleSelectNode}
                            onAddNew={handleAddNew}
                            refreshTrigger={refreshTrigger}
                        />
                    </Col>

                    {/* RIGHT: Detail Form */}
                    <Col xs={24} sm={24} md={16} lg={16} className={styles.detailColumn}>
                        <LocationDetailCard
                            tenantId={tenantId}
                            selectedNode={selectedNode}
                            industryType={industryType}
                            onUpdated={handleLocationUpdated}
                            onDeleted={handleLocationDeleted}
                            isCreateMode={isCreateMode}
                            parentNodeForCreate={parentNodeForCreate}
                            onCreateCancel={() => {
                                setIsCreateMode(false);
                                setParentNodeForCreate(null);
                            }}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Locations;
