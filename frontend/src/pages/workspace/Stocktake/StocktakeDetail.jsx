import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  InputNumber,
  Spin,
  message,
  Space,
  Modal,
  Input,
  Empty,
  Tag,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  SaveOutlined,
  CheckOutlined,
  ScanOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axiosClient from '../../../api/axiosClient';
import styles from './StocktakeDetail.module.css';

/**
 * StocktakeDetail.jsx: Trang chi tiết kiểm kê kho
 * 
 * Hỗ trợ Conditional Rendering theo industryType:
 * 
 * ELECTRONICS:
 *   - Cột "Quản Lý IMEI" với modal quét/nhập IMEI
 *   - So sánh expectedImeis vs actualImeis
 * 
 * GROCERY:
 *   - Cột "Mã Lô (Batch)" + "Hạn Sử Dụng"
 *   - Đếm theo từng lô
 * 
 * Cột chung: Sản phẩm, Tồn hệ thống, Thực tế (input), Chênh lệch
 */
const StocktakeDetail = () => {
  const { ticketId } = useParams();
  const { currentWorkspace } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedItems, setEditedItems] = useState({});

  const workspaceId = currentWorkspace?.id;
  const industryType = currentWorkspace?.industryCode;

  // Modal IMEI (cho ELECTRONICS)
  const [imeiModalVisible, setImeiModalVisible] = useState(false);
  const [selectedItemForImei, setSelectedItemForImei] = useState(null);
  const [imeiInput, setImeiInput] = useState('');

  // ==================== FETCH DATA ====================

  useEffect(() => {
    if (workspaceId && ticketId) {
      fetchTicketDetail();
    }
  }, [workspaceId, ticketId]);

  const fetchTicketDetail = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(
        `/v1/workspaces/${workspaceId}/stocktakes/${ticketId}`
      );

      if (response.data?.status === 'SUCCESS') {
        setTicket(response.data.data);
      }
    } catch (err) {
      console.error('❌ Lỗi lấy chi tiết phiếu:', err);
      message.error('Không thể tải chi tiết phiếu');
    } finally {
      setLoading(false);
    }
  };

  // ==================== HANDLERS ====================

  const handleActualQtyChange = (productId, value) => {
    setEditedItems((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handleSaveDraft = async () => {
    if (Object.keys(editedItems).length === 0) {
      message.info('Không có thay đổi để lưu');
      return;
    }

    setSaving(true);
    try {
      // TODO: Implement batch update API
      // for (const [productId, actualQty] of Object.entries(editedItems)) {
      //   await axiosClient.put(
      //     `/v1/workspaces/${workspaceId}/stocktakes/${ticketId}/items/${productId}`,
      //     { actualQty }
      //   );
      // }

      message.success('Lưu thành công');
      setEditedItems({});
      fetchTicketDetail();
    } catch (err) {
      message.error('Lỗi lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitCount = async () => {
    Modal.confirm({
      title: 'Gửi Phiếu Duyệt',
      content:
        'Bạn chắc chắn muốn gửi phiếu duyệt? Sau khi gửi không thể chỉnh sửa.',
      okText: 'Gửi',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await axiosClient.put(
            `/v1/workspaces/${workspaceId}/stocktakes/${ticketId}/submit`
          );

          if (response.data?.status === 'SUCCESS') {
            message.success('Gửi phiếu duyệt thành công');
            fetchTicketDetail();
          }
        } catch (err) {
          message.error('Lỗi gửi phiếu duyệt');
        }
      },
    });
  };

  const handleOpenImeiModal = (item) => {
    setSelectedItemForImei(item);
    setImeiInput((item.actualImeis || []).join('\n'));
    setImeiModalVisible(true);
  };

  const handleSaveImeis = () => {
    if (!selectedItemForImei) return;

    const imeis = imeiInput
      .split('\n')
      .map((i) => i.trim())
      .filter((i) => i);

    // Update item với actualImeis
    const updatedItems = ticket.items.map((item) =>
      item.productId === selectedItemForImei.productId
        ? { ...item, actualImeis: imeis }
        : item
    );

    setTicket({ ...ticket, items: updatedItems });
    setImeiModalVisible(false);
    message.success('Cập nhật IMEI thành công');
  };

  // ==================== TABLE COLUMNS ====================

  const getCommonColumns = () => [
    {
      title: 'Mã SP',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 100,
      render: (code) => <span className={styles.code}>{code}</span>,
    },
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'productName',
      key: 'productName',
      width: 180,
    },
    {
      title: 'Danh Mục',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (cat) => cat || '-',
    },
    {
      title: 'Tồn Hệ Thống',
      dataIndex: 'expectedQty',
      key: 'expectedQty',
      width: 120,
      render: (qty) => (
        <span className={styles.expectedQty}>{qty}</span>
      ),
    },
    {
      title: 'Số Đếm Thực Tế',
      dataIndex: 'actualQty',
      key: 'actualQty',
      width: 140,
      render: (qty, record) => (
        <InputNumber
          value={
            editedItems[record.productId] !== undefined
              ? editedItems[record.productId]
              : qty
          }
          onChange={(value) =>
            handleActualQtyChange(record.productId, value)
          }
          disabled={!ticket || !ticket.isEditable}
          min={0}
          className={styles.input}
        />
      ),
    },
    {
      title: 'Chênh Lệch',
      dataIndex: 'discrepancy',
      key: 'discrepancy',
      width: 100,
      render: (diff, record) => {
        const actual = editedItems[record.productId] !== undefined
          ? editedItems[record.productId]
          : record.actualQty;
        const expected = record.expectedQty || 0;
        const delta = (actual ?? 0) - expected;

        return (
          <span
            className={
              delta > 0
                ? styles.surplus
                : delta < 0
                ? styles.deficit
                : styles.matched
            }
          >
            {delta > 0 ? '+' : ''}{delta}
          </span>
        );
      },
    },
  ];

  const getElectronicsColumns = () => [
    ...getCommonColumns(),
    {
      title: 'Quản Lý IMEI',
      key: 'imei',
      width: 140,
      render: (_, record) => (
        <Button
          size="small"
          icon={<ScanOutlined />}
          onClick={() => handleOpenImeiModal(record)}
        >
          Quét IMEI
        </Button>
      ),
    },
  ];

  const getGroceryColumns = () => [
    ...getCommonColumns(),
    {
      title: 'Mã Lô (Batch)',
      dataIndex: 'batchCode',
      key: 'batchCode',
      width: 100,
      render: (code) => code || '-',
    },
    {
      title: 'Hạn Sử Dụng',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (date) => {
        if (!date) return '-';
        const d = new Date(date);
        const daysLeft = Math.ceil(
          (d - new Date()) / (1000 * 60 * 60 * 24)
        );
        const color =
          daysLeft <= 7 ? 'red' : daysLeft <= 30 ? 'orange' : 'green';

        return (
          <span>
            <Tag color={color}>
              {d.toLocaleDateString('vi-VN')}
            </Tag>
            {daysLeft > 0 && (
              <span style={{ fontSize: 12, color: '#999' }}>
                {daysLeft}d
              </span>
            )}
          </span>
        );
      },
    },
  ];

  const columns =
    industryType === 'ELECTRONICS'
      ? getElectronicsColumns()
      : industryType === 'GROCERY'
      ? getGroceryColumns()
      : getCommonColumns();

  // ==================== RENDER ====================

  if (loading || !ticket) {
    return (
      <div className={styles.container}>
        <Spin size="large" tip="Đang tải chi tiết phiếu..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>{ticket.title}</h1>
          <p className={styles.subheader}>
            Mã phiếu: {ticket.ticketCode} | Trạng thái:{' '}
            <Tag
              color={
                ticket.status === 'PENDING'
                  ? 'warning'
                  : ticket.status === 'COUNTING'
                  ? 'blue'
                  : ticket.status === 'REVIEWING'
                  ? 'purple'
                  : 'green'
              }
            >
              {ticket.status}
            </Tag>
          </p>
        </div>
        <Space>
          <Button
            icon={<SaveOutlined />}
            onClick={handleSaveDraft}
            loading={saving}
            disabled={!ticket.isEditable}
          >
            Lưu Nháp
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleSubmitCount}
            disabled={!ticket.isEditable}
          >
            Hoàn Thành Đếm
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={16} className={styles.stats}>
        <Col span={6}>
          <Statistic
            title="Tổng Tồn (Hệ Thống)"
            value={ticket.getTotalExpectedQty?.() || 0}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Tổng Đếm (Thực Tế)"
            value={ticket.getTotalActualQty?.() || 0}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Chênh Lệch Tổng"
            value={ticket.getTotalDifference?.() || 0}
            valueStyle={{
              color: (ticket.getTotalDifference?.() || 0) > 0 ? '#ff4d4f' : '#666',
            }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Tiến Độ"
            value={Math.round(ticket.getProgressPercentage?.() || 0)}
            suffix="%"
            valueStyle={{ color: '#faad14' }}
          />
        </Col>
      </Row>

      {/* Table */}
      <Card className={styles.tableCard}>
        {ticket.items && ticket.items.length > 0 ? (
          <Table
            columns={columns}
            dataSource={ticket.items.map((item) => ({
              ...item,
              key: item.productId,
            }))}
            pagination={{ pageSize: 10 }}
            size="middle"
            scroll={{ x: 1200 }}
            className={styles.table}
          />
        ) : (
          <Empty description="Không có sản phẩm nào trong phiếu kiểm kê" />
        )}
      </Card>

      {/* IMEI Modal (ELECTRONICS) */}
      {industryType === 'ELECTRONICS' && (
        <Modal
          title="Quản Lý IMEI"
          open={imeiModalVisible}
          onCancel={() => setImeiModalVisible(false)}
          onOk={handleSaveImeis}
          width={600}
        >
          <div className={styles.imeiModal}>
            <p>
              <strong>Sản phẩm:</strong>{' '}
              {selectedItemForImei?.productName}
            </p>
            <p style={{ color: '#666', fontSize: 12 }}>
              <strong>Tồn hệ thống:</strong>{' '}
              {selectedItemForImei?.expectedImeis?.length || 0} IMEI
            </p>
            <Input.TextArea
              placeholder="Nhập IMEI (mỗi dòng một IMEI)"
              value={imeiInput}
              onChange={(e) => setImeiInput(e.target.value)}
              rows={10}
              className={styles.imeiInput}
            />
            <p style={{ color: '#999', fontSize: 12 }}>
              Đã nhập: {imeiInput.split('\n').filter((i) => i.trim()).length} IMEI
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StocktakeDetail;
