package com.optistock.backend.service;

import com.optistock.backend.model.Location;
import com.optistock.backend.repository.LocationRepository;
import com.optistock.backend.enums.LocationLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

/**
 * LocationService - Quản lý sơ đồ kho & vị trí
 * 
 * Tính năng chính:
 * 1. Xây dựng cây Location từ flat list (O(n))
 * 2. Lọc theo industryType (ELECTRONICS / GROCERY)
 * 3. CRUD Location với kiểm tra cha-con
 */
@Service
@RequiredArgsConstructor
public class LocationService {
    
    private final LocationRepository locationRepository;
    
    /**
     * Xây dựng cây Location theo industryType
     * 
     * Thuật toán O(n):
     * 1. Lấy danh sách Location từ DB
     * 2. Group theo parentId bằng Map
     * 3. Duyệt danh sách và gán children vào parent
     * 
     * @param tenantId - ID workspace
     * @param industryType - ELECTRONICS hoặc GROCERY
     * @return List<LocationTreeNode> - Danh sách node gốc với children
     */
    public List<LocationTreeNode> buildLocationTree(String tenantId, String industryType) {
        // 1. Lấy danh sách location từ DB theo tenantId + industryType
        List<Location> allLocations = locationRepository.findByTenantIdAndIndustryType(tenantId, industryType);
        
        // 2. Filter ra những location bị soft delete (deletedAt == null = active)
        List<Location> activeLocations = allLocations.stream()
                .filter(loc -> loc.getDeletedAt() == null)
                .collect(Collectors.toList());
        
        if (activeLocations.isEmpty()) {
            return new ArrayList<>();
        }
        
        // 3. Tạo Map để lưu các node theo id, để truy cập nhanh O(1)
        Map<String, LocationTreeNode> nodeMap = new HashMap<>();
        for (Location loc : activeLocations) {
            LocationTreeNode node = LocationTreeNode.fromLocation(loc);
            nodeMap.put(loc.getId(), node);
        }
        
        // 3. Group children theo parentId để tìm nhanh
        Map<String, List<LocationTreeNode>> childrenByParent = new HashMap<>();
        for (LocationTreeNode node : nodeMap.values()) {
            String parentId = node.getParentId();
            if (parentId != null) {
                childrenByParent.computeIfAbsent(parentId, k -> new ArrayList<>()).add(node);
            }
        }
        
        // 4. Gán children vào parent
        for (String parentId : childrenByParent.keySet()) {
            LocationTreeNode parent = nodeMap.get(parentId);
            if (parent != null) {
                List<LocationTreeNode> children = childrenByParent.get(parentId);
                // Sắp xếp children theo tên để UI hiển thị gọn gàng
                children.sort(Comparator.comparing(LocationTreeNode::getTitle));
                parent.setChildren(children);
            }
        }
        
        // 5. Lấy các node gốc (parentId = null) và trả về
        return nodeMap.values().stream()
                .filter(node -> node.getParentId() == null)
                .sorted(Comparator.comparing(LocationTreeNode::getTitle))
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy tất cả Location theo tenantId + industryType (dạng flat list)
     * Filter soft deleted (deletedAt == null)
     */
    public List<Location> getLocationsByIndustryType(String tenantId, String industryType) {
        return locationRepository.findByTenantIdAndIndustryType(tenantId, industryType).stream()
                .filter(loc -> loc.getDeletedAt() == null)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy Location theo ID
     */
    public Location getLocationById(String id) {
        return locationRepository.findById(id).orElse(null);
    }

    /**
     * Lấy Location theo Code (dùng cho barcode scan)
     * Filter softDelete: deletedAt == null
     */
    public Location getLocationByCode(String tenantId, String code) {
        if (code == null || code.trim().isEmpty()) {
            return null;
        }
        List<Location> allLocations = locationRepository.findByTenantId(tenantId);
        return allLocations.stream()
                .filter(loc -> loc.getDeletedAt() == null)
                .filter(loc -> code.equalsIgnoreCase(loc.getCode()))
                .findFirst()
                .orElse(null);
    }
    
    
    /**
     * Tạo Location mới
     */
    public Location createLocation(Location location) {
        return locationRepository.save(location);
    }
    
    /**
     * Cập nhật Location
     */
    public Location updateLocation(String id, Location locationUpdates) {
        Location existing = locationRepository.findById(id).orElse(null);
        if (existing != null) {
            // Cập nhật các trường được phép thay đổi
            if (locationUpdates.getName() != null) {
                existing.setName(locationUpdates.getName());
            }
            if (locationUpdates.getDescription() != null) {
                existing.setDescription(locationUpdates.getDescription());
            }
            if (locationUpdates.getCapacity() != null) {
                existing.setCapacity(locationUpdates.getCapacity());
            }
            if (locationUpdates.getProperties() != null) {
                existing.setProperties(locationUpdates.getProperties());
            }
            existing.setActive(locationUpdates.isActive());
            return locationRepository.save(existing);
        }
        return null;
    }
    
    /**
     * Xóa Location (soft delete)
     */
    public void deleteLocation(String id) {
        Location location = locationRepository.findById(id).orElse(null);
        if (location != null) {
            location.setDeletedAt(java.time.LocalDateTime.now());
            locationRepository.save(location);
        }
    }
    
    /**
     * Lấy danh sách Location con theo parentId
     * Filter soft deleted (deletedAt == null)
     */
    public List<Location> getChildLocations(String parentId) {
        return locationRepository.findByParentId(parentId).stream()
                .filter(loc -> loc.getDeletedAt() == null)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy danh sách Location BIN (leaf nodes) theo tenantId + industryType
     * Dùng cho TreeSelect trong CreateVoucherModal (chỉ cho phép select BIN)
     * Filter soft deleted (deletedAt == null)
     */
    public List<Location> getBinLocations(String tenantId, String industryType) {
        return locationRepository.findByTenantIdAndIndustryTypeAndLevel(tenantId, industryType, LocationLevel.BIN).stream()
                .filter(loc -> loc.getDeletedAt() == null)
                .collect(Collectors.toList());
    }
    
    /**
     * DTO để build Tree Node
     * Dùng cho API response trả về cho Frontend
     */
    public static class LocationTreeNode {
        private String key;          // Dùng cho Tree component (= id)
        private String title;        // Tên hiển thị
        private String parentId;     // Mã cha
        private LocationLevel level; // Cấp độ
        private Map<String, Object> properties; // Cấu hình động
        private String productId;    // ID sản phẩm được gán
        private List<LocationTreeNode> children = new ArrayList<>();
        private boolean selectable = true; // Có thể select hay không
        private boolean disabled = false;  // Disable hay không
        
        // Constructors
        public LocationTreeNode() {}
        
        public LocationTreeNode(String key, String title, LocationLevel level, String parentId) {
            this.key = key;
            this.title = title;
            this.level = level;
            this.parentId = parentId;
        }
        
        /**
         * Chuyển đổi từ Location entity sang TreeNode
         * 
         * LƯU Ý: Tất cả nodes đều selectable trong Sơ đồ Kho
         * Khi dùng TreeSelect trong CreateVoucherModal, frontend sẽ tự disable ZONE/RACK
         */
        public static LocationTreeNode fromLocation(Location location) {
            LocationTreeNode node = new LocationTreeNode();
            node.setKey(location.getId());
            node.setTitle(location.getName() != null ? location.getName() : location.getCode());
            node.setLevel(location.getLevel());
            node.setParentId(location.getParentId());
            node.setProperties(location.getProperties());
            node.setProductId(location.getProductId()); // Include productId
            
            // Mặc định: Tất cả nodes selectable = true, disabled = false
            // Frontend sẽ xử lý disable logic khi cần (ví dụ: TreeSelect trong voucher)
            node.setSelectable(true);
            node.setDisabled(false);
            
            return node;
        }
        
        // Getters & Setters
        public String getKey() { return key; }
        public void setKey(String key) { this.key = key; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getParentId() { return parentId; }
        public void setParentId(String parentId) { this.parentId = parentId; }
        
        public LocationLevel getLevel() { return level; }
        public void setLevel(LocationLevel level) { this.level = level; }
        
        public Map<String, Object> getProperties() { return properties; }
        public void setProperties(Map<String, Object> properties) { this.properties = properties; }

        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
        
        public List<LocationTreeNode> getChildren() { return children; }
        public void setChildren(List<LocationTreeNode> children) { this.children = children; }
        
        public boolean isSelectable() { return selectable; }
        public void setSelectable(boolean selectable) { this.selectable = selectable; }
        
        public boolean isDisabled() { return disabled; }
        public void setDisabled(boolean disabled) { this.disabled = disabled; }
    }
}
