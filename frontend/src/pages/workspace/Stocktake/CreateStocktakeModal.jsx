import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  TreeSelect,
  Select,
  Button,
  message,
  Spin,
} from 'antd';
import axiosClient from '../../../api/axiosClient';

/**
 * CreateStocktakeModal.jsx: Modal để tạo phiếu kiểm kê
 * 
 * Hỗ trợ:
 * - Chọn tiêu đề phiếu
 * - Chọn khu vực kiểm kê từ Location Tree
 * - Chọn nhân viên phụ trách
 * - Tự động lọc theo industryType hiện tại
 */
const CreateStocktakeModal = ({
  visible,
  onCancel,
  onSuccess,
  industryType,
  workspaceId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [locationTree, setLocationTree] = useState([]);
  const [locationList, setLocationList] = useState([]); // 🔥 Store flat list for lookup
  const [staffList, setStaffList] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // ==================== FETCH LOCATIONS & STAFF ====================

  useEffect(() => {
    if (visible && workspaceId) {
      fetchLocations();
      fetchStaff();
    }
  }, [visible, workspaceId, industryType]);

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      // 🔥 Add industryType query param
      const response = await axiosClient.get(
        `/v1/workspaces/${workspaceId}/locations`,
        { params: { industryType } }
      );

      if (response.data?.success || response.data?.data) {
        const locations = response.data.data || [];
        console.log('✅ Locations loaded:', locations.length, 'industryType:', industryType);
        
        // 🔥 Store both tree and flat list
        setLocationList(locations); // ← Flat list for lookup
        const tree = convertToTreeData(locations);
        setLocationTree(tree);
        
        console.log('📍 Location tree:', tree);
      }
    } catch (err) {
      console.error('❌ Lỗi lấy danh sách khu vực:', err);
      message.error('Không thể tải danh sách khu vực');
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchStaff = async () => {
    setLoadingStaff(true);
    try {
      // 🔥 Fetch actual staff from API
      const response = await axiosClient.get(
        `/v1/workspaces/${workspaceId}/personnel/members`
      );
      
      console.log('👥 Staff API response:', response.data);
      
      // Handle both response.data.data and response.data being the array
      let staffData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      
      console.log('📋 Raw staff data:', staffData);
      
      if (Array.isArray(staffData)) {
        // 🔥 Filter only STAFF role (Nhân viên kho) - exclude OWNER, MANAGER, ACCOUNTANT, SALE
        const warehouseStaff = staffData.filter(staff => {
          console.log(`  - Staff: ${staff.fullName} (${staff.email}) - Role: ${staff.role}`);
          return staff.role === 'STAFF';
        });
        
        console.log('✅ Warehouse staff filtered:', warehouseStaff.length, 'from', staffData.length);
        
        const mappedStaff = warehouseStaff.map(staff => ({
          id: staff.userId,  // ← Use userId from API response
          name: staff.fullName || 'Unknown',  // ← Use fullName from API response
          email: staff.email || ''
        }));
        
        console.log('🎯 Mapped staff:', mappedStaff);
        setStaffList(mappedStaff);
      } else {
        console.warn('⚠️ Staff data is not an array:', staffData);
        setStaffList([]);
      }
    } catch (err) {
      console.error('❌ Lỗi lấy danh sách nhân viên:', err);
      message.error('Không thể tải danh sách nhân viên');
      setStaffList([]);
    } finally {
      setLoadingStaff(false);
    }
  };

  // ==================== HELPERS ====================

  const convertToTreeData = (locations) => {
    // TODO: Implement proper tree structure conversion
    // For now, return simple flat list format
    return locations.map((loc) => ({
      title: loc.name,
      value: loc.id,
      key: loc.id,
    }));
  };

  // ==================== SUBMIT ====================

  const handleSubmit = async (values) => {
    if (!workspaceId) {
      message.error('Vui lòng chọn kho hàng');
      return;
    }

    setLoading(true);
    try {
      // 🔥 Find location name from flat list
      const selectedLocation = locationList.find(loc => loc.id === values.locationId);
      const locationName = selectedLocation?.name || 'Unknown';

      // 🔥 Find staff name from staffList
      const assignedStaff = staffList.find(s => s.id === values.assignedTo);
      const assignedToName = assignedStaff?.name || 'Unknown';

      const payload = {
        title: values.title,
        industryType: industryType,
        locationId: values.locationId,
        locationName: locationName,
        assignedTo: values.assignedTo,
        assignedToName: assignedToName,
      };

      console.log('📤 Submitting payload:', payload);

      const response = await axiosClient.post(
        `/v1/workspaces/${workspaceId}/stocktakes`,
        payload
      );

      if (response.data?.status === 'SUCCESS') {
        message.success('Tạo phiếu kiểm kê thành công');
        form.resetFields();
        onSuccess();
      }
    } catch (err) {
      console.error('❌ Lỗi tạo phiếu:', err);
      message.error(
        err.response?.data?.error || 'Lỗi tạo phiếu kiểm kê'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <Modal
      title="Tạo Phiếu Kiểm Kê"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Tạo Phiếu
        </Button>,
      ]}
      width={600}
    >
      <Spin spinning={loadingLocations || loadingStaff}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {/* Tiêu đề phiếu */}
          <Form.Item
            label="Tiêu Đề Phiếu"
            name="title"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập tiêu đề phiếu',
              },
            ]}
          >
            <Input
              placeholder="VD: Kiểm kê kho A4"
              maxLength={100}
            />
          </Form.Item>

          {/* Ngành hàng (Read-only) */}
          <Form.Item label="Ngành Hàng">
            <Input
              disabled
              value={
                industryType === 'ELECTRONICS'
                  ? 'Điện tử'
                  : industryType === 'GROCERY'
                  ? 'Tạp hóa'
                  : 'Không xác định'
              }
            />
          </Form.Item>

          {/* Chọn khu vực kiểm kê */}
          <Form.Item
            label="Khu Vực Kiểm Kê"
            name="locationId"
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn khu vực kiểm kê',
              },
            ]}
          >
            <TreeSelect
              placeholder="Chọn khu vực"
              treeData={locationTree}
              loading={loadingLocations}
              showSearch
            />
          </Form.Item>

          {/* Chọn nhân viên phụ trách */}
          <Form.Item
            label="Nhân Viên Phụ Trách"
            name="assignedTo"
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn nhân viên phụ trách',
              },
            ]}
          >
            <Select
              placeholder="Chọn nhân viên"
              loading={loadingStaff}
              options={staffList.map((staff) => ({
                label: `${staff.name}${staff.email ? ` (${staff.email})` : ''}`,
                value: staff.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default CreateStocktakeModal;
