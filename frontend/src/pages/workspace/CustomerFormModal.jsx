import React from 'react';
import { Modal, Form, Input, InputNumber } from 'antd';
import styles from './Customers.module.css';

const CustomerFormModal = ({
  visible,
  onCancel,
  onSubmit,
  form,
  editingId,
  submitting,
  workspaceRole
}) => {
  return (
    <Modal
      title={editingId ? "Cập nhật Khách Hàng" : "Thêm Khách Hàng Mới"}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
    >
      <Form form={form} layout="vertical" onFinish={onSubmit} style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label={<span className={styles.formLabel}>Tên Khách Hàng</span>}
          rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng!' }]}
        >
          <Input className={styles.inputField} placeholder="Nhập tên khách hàng" />
        </Form.Item>
        <Form.Item name="phone" label={<span className={styles.formLabel}>Số Điện Thoại</span>}>
          <Input className={styles.inputField} placeholder="Nhập số điện thoại liên hệ" />
        </Form.Item>
        <Form.Item name="email" label={<span className={styles.formLabel}>Email</span>}>
          <Input className={styles.inputField} placeholder="Nhập địa chỉ email (không bắt buộc)" type="email" />
        </Form.Item>
        <Form.Item name="address" label={<span className={styles.formLabel}>Địa Chỉ</span>}>
          <Input.TextArea className={styles.inputField} placeholder="Nhập địa chỉ khách hàng (không bắt buộc)" rows={2} />
        </Form.Item>
        <Form.Item name="creditLimit" label={<span className={styles.formLabel}>Hạn Mức Tín Dụng (VND)</span>} initialValue={0}>
          <InputNumber 
            className={styles.inputField} 
            style={{ width: '100%' }} 
            min={0} 
            step={1000000} 
            disabled={workspaceRole === 'SALE' && !!editingId} 
          />
        </Form.Item>

        <div className={styles.modalFooter}>
          <button 
            type="button" 
            className={styles.secondaryBtn} 
            onClick={onCancel}
          >
            Hủy
          </button>
          <button type="submit" className={styles.primaryBtn} disabled={submitting}>
            {submitting ? 'Đang xử lý...' : (editingId ? "Cập nhật" : "Lưu Khách Hàng")}
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default CustomerFormModal;