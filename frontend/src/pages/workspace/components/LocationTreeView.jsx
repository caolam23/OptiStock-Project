import React, { useState, useEffect } from 'react';
import { Tree, Spin, Empty, Button, Space } from 'antd';
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { getLocationTree } from '../../../api/locationApi';
import styles from './LocationTreeView.module.css';

/**
 * LocationTreeView - Component cây Sơ đồ Kho (bên trái)
 * 
 * Tính năng:
 * 1. Fetch API `/tree?industryType={type}`
 * 2. Render Tree component AntD
 * 3. Gọi onSelectNode khi chọn node
 * 4. Auto-reload khi industryType thay đổi
 */
const LocationTreeView = ({
    tenantId,
    industryType = 'ELECTRONICS',
    onSelectNode = null,
    onAddNew = null,
    refreshTrigger = 0,
}) => {
    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState([]);

    /**
     * Gọi API để lấy dữ liệu cây
     */
    const loadTree = async () => {
        try {
            setLoading(true);
            const response = await getLocationTree(tenantId, industryType);
            console.log('📦 [LocationTreeView] API Response:', response);
            if (response.success && response.data) {
                console.log('🌳 [LocationTreeView] Tree data:', JSON.stringify(response.data, null, 2));
                setTreeData(response.data);
                // Tự động expand node đầu tiên
                if (response.data.length > 0) {
                    console.log('🔑 First node key:', response.data[0].key);
                    setExpandedKeys([response.data[0].key]);
                }
            } else {
                console.warn('⚠️ [LocationTreeView] Empty response or success=false');
                setTreeData([]);
            }
        } catch (error) {
            console.error('❌ Lỗi tải cây kho:', error);
            setTreeData([]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Reload tree khi industryType thay đổi hoặc khi refreshTrigger thay đổi
     */
    useEffect(() => {
        if (tenantId) {
            loadTree();
        }
    }, [tenantId, industryType, refreshTrigger]);

    /**
     * Xử lý khi chọn một node
     */
    const handleSelectNode = (keys, info) => {
        console.log('🔍 [LocationTreeView] Node selected:', {
            keys,
            nodeData: info.node,
            nodeTitle: info.node?.title,
            nodeLevel: info.node?.level,
        });
        setSelectedKeys(keys);
        if (onSelectNode && info.node) {
            console.log('📤 [LocationTreeView] Calling onSelectNode with:', info.node);
            onSelectNode(info.node);
        } else {
            console.warn('⚠️ [LocationTreeView] onSelectNode missing or info.node missing', { 
                onSelectNode: !!onSelectNode, 
                node: !!info.node 
            });
        }
    };

    /**
     * Xử lý khi expand/collapse node
     */
    const handleExpand = (keys) => {
        setExpandedKeys(keys);
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h3 className={styles.title}>📊 Sơ đồ Kho</h3>
                <Space size="small">
                    {onAddNew && (
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={onAddNew}
                            className={styles.btnAddNew}
                        >
                            Thêm
                        </Button>
                    )}
                    <Button
                        size="small"
                        icon={<ReloadOutlined />}
                        onClick={loadTree}
                        loading={loading}
                        className={styles.btnReload}
                    >
                        Refresh
                    </Button>
                </Space>
            </div>

            {/* Tree Content */}
            <div className={styles.treeWrapper}>
                {loading ? (
                    <div className={styles.spinContainer}>
                        <Spin tip="Đang tải..." />
                    </div>
                ) : treeData.length > 0 ? (
                    <Tree
                        className={styles.tree}
                        treeData={treeData}
                        selectedKeys={selectedKeys}
                        expandedKeys={expandedKeys}
                        onSelect={handleSelectNode}
                        onExpand={handleExpand}
                        showIcon={false}
                        blockNode
                        selectable={true}
                    />
                ) : (
                    <div className={styles.emptyContainer}>
                        <Empty
                            description="Chưa có vị trí"
                            style={{ marginTop: '24px' }}
                        />
                        {onAddNew && (
                            <Button
                                type="primary"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={onAddNew}
                                style={{ marginTop: '12px' }}
                            >
                                Tạo vị trí đầu tiên
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationTreeView;
