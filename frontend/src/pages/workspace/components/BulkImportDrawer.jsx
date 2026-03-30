import React, { useState } from 'react';
import { Drawer, Upload, Button, message } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import styles from './BulkImportDrawer.module.css';
import { bulkImportProducts, downloadProductTemplate } from '../../../api/productApi';

const BulkImportDrawer = ({ visible = false, tenantId, industryType, onClose, onSuccess }) => {
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    // ========== Xử lý upload file nhập sản phẩm ==========
    const handleBulkImport = async (file) => {
        try {
            setImporting(true);
            setImportResult(null);

            // Validate tenantId
            if (!tenantId) {
                message.error('Workspace chưa được chọn');
                return false;
            }

            // Validate file
            const allowedTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
                'text/csv'
            ];
            if (
                !allowedTypes.includes(file.type) &&
                !file.name.endsWith('.xlsx') &&
                !file.name.endsWith('.xls') &&
                !file.name.endsWith('.csv')
            ) {
                message.error('File phải là Excel (.xlsx, .xls) hoặc CSV');
                setImporting(false);
                return false;
            }

            // Chuẩn bị FormData
            const formData = new FormData();
            formData.append('file', file);
            if (industryType) {
                formData.append('industryType', industryType);  // 🔥 Add industryType
            }

            // Gọi API nhập file
            const response = await bulkImportProducts(tenantId, formData);

            setImportResult(response);

            if (response.success) {
                message.success(`Nhập thành công ${response.imported} sản phẩm`);
                // Đóng drawer sau 2 giây
                setTimeout(() => {
                    onSuccess(); // Callback to parent to reload products and close drawer
                }, 2000);
            } else if (response.imported > 0) {
                message.warning(
                    `Nhập thành công ${response.imported} sản phẩm, ${response.skipped} bỏ qua`
                );
            } else {
                message.error('Không có sản phẩm nào được nhập thành công');
            }

            return false; // Ngăn upload mặc định
        } catch (error) {
            console.error('Lỗi nhập file:', error);
            message.error(
                error.response?.data?.message ||
                error.message ||
                'Lỗi nhập file. Vui lòng thử lại.'
            );
            return false;
        } finally {
            setImporting(false);
        }
    };

    // ========== Download file template ==========
    const handleDownloadTemplate = async () => {
        try {
            // Call API to download template
            const blob = await downloadProductTemplate(tenantId);

            // Create download link
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'product-template.xlsx');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            message.success('Tải file template thành công');
        } catch (error) {
            console.error('Lỗi tải template:', error);
            message.error(
                error.response?.data?.message ||
                error.message ||
                'Lỗi tải file template. Vui lòng thử lại.'
            );
        }
    };

    const handleDrawerClose = () => {
        setImportResult(null);
        onClose();
    };

    return (
        <Drawer
            title="Nhập sản phẩm từ Excel"
            placement="right"
            onClose={handleDrawerClose}
            width={500}
            open={visible}
        >
            <div className={styles.drawerContent}>
                {!importResult ? (
                    <>
                        {/* Upload Area */}
                        <div className={styles.uploadArea}>
                            <div className={styles.uploadIcon}>📁</div>
                            <h3 className={styles.uploadTitle}>Chọn file Excel để nhập</h3>
                            <p className={styles.uploadSubtitle}>
                                Hỗ trợ .xlsx, .xls, .csv (Kéo thả hoặc click để chọn)
                            </p>
                            <Upload
                                beforeUpload={handleBulkImport}
                                accept=".xlsx,.xls,.csv"
                                maxCount={1}
                                showUploadList={false}
                            >
                                <Button
                                    type="primary"
                                    icon={<UploadOutlined />}
                                    loading={importing}
                                    disabled={importing}
                                    style={{ marginTop: '12px' }}
                                >
                                    Chọn file
                                </Button>
                            </Upload>
                        </div>

                        {/* Template Download */}
                        <div className={styles.templateDownload}>
                            <p className={styles.templateDownloadTitle}>📋 File mẫu (Template)</p>
                            <p style={{ fontSize: '13px', color: '#6B7280', margin: '8px 0' }}>
                                Tải file mẫu để xem định dạng đúng:
                            </p>
                            <a
                                href="#"
                                className={styles.templateDownloadLink}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleDownloadTemplate();
                                }}
                            >
                                <DownloadOutlined /> Tải file template
                            </a>
                        </div>

                        {/* Import Instructions */}
                        <div
                            style={{
                                marginTop: '24px',
                                fontSize: '13px',
                                color: '#6B7280',
                                lineHeight: '1.6'
                            }}
                        >
                            <strong style={{ color: '#1F2937' }}>Hướng dẫn:</strong>
                            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                                <li>Dòng 1: Header (tên cột)</li>
                                <li>Dòng 2+: Dữ liệu sản phẩm</li>
                                <li>Cột bắt buộc: productCode, productName, price</li>
                                <li>Nếu có lỗi, các dòng khác vẫn được nhập</li>
                            </ul>
                        </div>
                    </>
                ) : (
                    // Result Summary
                    <div className={styles.importResultContainer}>
                        {/* Summary Cards */}
                        <div className={styles.resultSummary}>
                            <div className={`${styles.resultCard} ${styles.resultCardSuccess}`}>
                                <span className={styles.resultNumber}>{importResult.imported}</span>
                                <span className={styles.resultLabel}>Thành công</span>
                            </div>
                            <div className={`${styles.resultCard} ${styles.resultCardWarning}`}>
                                <span className={styles.resultNumber}>{importResult.skipped}</span>
                                <span className={styles.resultLabel}>Bỏ qua</span>
                            </div>
                            <div className={`${styles.resultCard} ${styles.resultCardError}`}>
                                <span className={styles.resultNumber}>
                                    {importResult.errors?.length || 0}
                                </span>
                                <span className={styles.resultLabel}>Lỗi</span>
                            </div>
                        </div>

                        {/* Error Details */}
                        {importResult.errors && importResult.errors.length > 0 && (
                            <>
                                <h4
                                    style={{
                                        marginTop: '20px',
                                        marginBottom: '12px',
                                        color: '#1F2937'
                                    }}
                                >
                                    Chi tiết lỗi:
                                </h4>
                                <div className={styles.errorTableWrapper}>
                                    <table className={styles.errorTable}>
                                        <thead>
                                            <tr>
                                                <th>Dòng</th>
                                                <th>Lỗi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {importResult.errors.map((err, idx) => (
                                                <tr key={idx} className={styles.errorRow}>
                                                    <td className={styles.rowNumber}>#{err.row}</td>
                                                    <td className={styles.errorMessage}>
                                                        {err.error}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* Action Buttons */}
                        <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
                            <Button
                                onClick={() => {
                                    setImportResult(null);
                                }}
                            >
                                Nhập lại
                            </Button>
                            <Button
                                type="primary"
                                onClick={() => {
                                    setImportResult(null);
                                    onClose();
                                }}
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Drawer>
    );
};

export default BulkImportDrawer;
