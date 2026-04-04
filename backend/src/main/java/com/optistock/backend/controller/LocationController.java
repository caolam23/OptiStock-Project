package com.optistock.backend.controller;

import com.optistock.backend.model.Location;
import com.optistock.backend.service.LocationService;
import com.optistock.backend.service.LocationService.LocationTreeNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * LocationController - API điểm cuối cho quản lý Sơ đồ Kho
 * 
 * Base path: /api/v1/workspaces/{tenantId}/locations
 */
@RestController
@RequestMapping("/api/v1/workspaces/{tenantId}/locations")
@RequiredArgsConstructor
public class LocationController {
    
    private final LocationService locationService;
    
    /**
     * API: Lấy sơ đồ kho dạng cây (Tree Structure)
     * 
     * GET /api/v1/workspaces/{tenantId}/locations/tree?industryType=ELECTRONICS
     * 
     * @param tenantId - ID workspace
     * @param industryType - ELECTRONICS hoặc GROCERY
     * @return List<LocationTreeNode> - Cây location theo cấu trúc ZONE -> RACK -> BIN
     */
    @GetMapping("/tree")
    public ResponseEntity<Map<String, Object>> getLocationTree(
            @PathVariable String tenantId,
            @RequestParam(required = false) String industryType) {
        
        // Nếu không truyền industryType, mặc định là ELECTRONICS
        if (industryType == null || industryType.trim().isEmpty()) {
            industryType = "ELECTRONICS";
        }
        
        // Gọi service để build tree (O(n))
        List<LocationTreeNode> treeData = locationService.buildLocationTree(tenantId, industryType);
        
        // Trả về response
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", treeData,
                "industryType", industryType,
                "message", "Lấy sơ đồ kho thành công"
        ));
    }
    
    /**
     * API: Lấy danh sách Location theo industryType (flat list)
     * 
     * GET /api/v1/workspaces/{tenantId}/locations?industryType=ELECTRONICS
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getLocations(
            @PathVariable String tenantId,
            @RequestParam(required = false) String industryType) {
        
        List<Location> locations;
        
        if (industryType == null || industryType.trim().isEmpty()) {
            locations = locationService.getLocationsByIndustryType(tenantId, "ELECTRONICS");
        } else {
            locations = locationService.getLocationsByIndustryType(tenantId, industryType);
        }
        
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", locations,
                "count", locations.size()
        ));
    }
    
    /**
     * API: Lấy chi tiết Location theo Code (dùng cho barcode scan / location lookup)
     * 
     * GET /api/v1/workspaces/{tenantId}/locations/code/{code}
     * 
     * VD: /api/v1/workspaces/abc/locations/code/ZONE-A
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<Map<String, Object>> getLocationByCode(
            @PathVariable String tenantId,
            @PathVariable String code) {
        
        Location location = locationService.getLocationByCode(tenantId, code);
        
        if (location == null) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Vị trí không tồn tại: " + code
            ));
        }
        
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", location,
                "message", "Lấy vị trí thành công"
        ));
    }

    /**
     * API: Lấy chi tiết Location theo ID
     * 
     * GET /api/v1/workspaces/{tenantId}/locations/{locationId}
     */
    @GetMapping("/{locationId}")
    public ResponseEntity<Map<String, Object>> getLocationById(
            @PathVariable String tenantId,
            @PathVariable String locationId) {
        
        Location location = locationService.getLocationById(locationId);
        
        if (location == null) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Vị trí không tồn tại"
            ));
        }
        
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", location
        ));
    }
    
    /**
     * API: Lấy danh sách Location con
     * 
     * GET /api/v1/workspaces/{tenantId}/locations/{parentId}/children
     */
    @GetMapping("/{parentId}/children")
    public ResponseEntity<Map<String, Object>> getChildLocations(
            @PathVariable String tenantId,
            @PathVariable String parentId) {
        
        List<Location> children = locationService.getChildLocations(parentId);
        
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", children,
                "count", children.size()
        ));
    }
    
    /**
     * API: Tạo Location mới
     * 
     * POST /api/v1/workspaces/{tenantId}/locations
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createLocation(
            @PathVariable String tenantId,
            @RequestBody Location location) {
        
        location.setTenantId(tenantId);
        Location created = locationService.createLocation(location);
        
        return ResponseEntity.status(201).body(Map.of(
                "success", true,
                "data", created,
                "message", "Tạo vị trí thành công"
        ));
    }
    
    /**
     * API: Cập nhật Location
     * 
     * PUT /api/v1/workspaces/{tenantId}/locations/{locationId}
     */
    @PutMapping("/{locationId}")
    public ResponseEntity<Map<String, Object>> updateLocation(
            @PathVariable String tenantId,
            @PathVariable String locationId,
            @RequestBody Location locationUpdates) {
        
        Location updated = locationService.updateLocation(locationId, locationUpdates);
        
        if (updated == null) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Vị trí không tồn tại"
            ));
        }
        
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", updated,
                "message", "Cập nhật vị trí thành công"
        ));
    }
    
    /**
     * API: Xóa Location
     * 
     * DELETE /api/v1/workspaces/{tenantId}/locations/{locationId}
     */
    @DeleteMapping("/{locationId}")
    public ResponseEntity<Map<String, Object>> deleteLocation(
            @PathVariable String tenantId,
            @PathVariable String locationId) {
        
        locationService.deleteLocation(locationId);
        
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Xóa vị trí thành công"
        ));
    }
    
    /**
     * API: Lấy danh sách Location BIN (leaf nodes)
     * Dùng cho TreeSelect trong CreateVoucherModal
     * 
     * GET /api/v1/workspaces/{tenantId}/locations/bins?industryType=ELECTRONICS
     */
    @GetMapping("/bins/list")
    public ResponseEntity<Map<String, Object>> getBinLocations(
            @PathVariable String tenantId,
            @RequestParam(required = false) String industryType) {
        
        if (industryType == null || industryType.trim().isEmpty()) {
            industryType = "ELECTRONICS";
        }
        
        List<Location> bins = locationService.getBinLocations(tenantId, industryType);
        
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", bins,
                "count", bins.size()
        ));
    }
}
