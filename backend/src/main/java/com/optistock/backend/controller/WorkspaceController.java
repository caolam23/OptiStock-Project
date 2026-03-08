package com.optistock.backend.controller;

import com.optistock.backend.dto.WorkspaceResponseDTO;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.service.WorkspaceService;
import com.optistock.backend.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * WorkspaceController: API endpoints for workspace management
 * Handles user's workspace queries and workspace-related operations
 */
@RestController
@RequestMapping("/api/v1/workspaces")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkspaceController {

    @Autowired
    private WorkspaceService workspaceService;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * GET /api/v1/workspaces/my-workspaces
     * 
     * Retrieves all workspaces (tenants) that the current user is a member of
     * Sorted by last access time (most recent first)
     * 
     * Response:
     * [
     * {
     * "id": "tenant_id",
     * "name": "Workspace Name",
     * "industryCode": "fmcg",
     * "role": "MANAGER",
     * "lastAccessed": "2026-02-25T14:30:00Z"
     * }
     * ]
     * 
     * @return List of user's workspaces or empty list if none found
     */
    @GetMapping("/my-workspaces")
    public ResponseEntity<List<WorkspaceResponseDTO>> getUserWorkspaces(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Get user ID from security context
            String userId = getUserIdFromContext(authHeader);

            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(List.of());
            }

            // Get user's workspaces sorted by last access
            List<WorkspaceResponseDTO> workspaces = workspaceService.getUserWorkspaces(userId);

            return ResponseEntity.ok(workspaces);

        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(List.of());
        } catch (Exception e) {
            System.err.println("Error retrieving workspaces: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of());
        }
    }

    /**
     * GET /api/v1/workspaces/{tenantId}
     * 
     * Retrieves a specific workspace by ID
     * 
     * @param tenantId MongoDB ID of the workspace
     * @return Workspace details
     */
    @GetMapping("/{tenantId}")
    public ResponseEntity<?> getWorkspaceById(
            @PathVariable String tenantId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String userId = getUserIdFromContext(authHeader);

            // Note: Add authorization check to ensure user is member of this workspace
            List<WorkspaceResponseDTO> workspaces = workspaceService.getUserWorkspaces(userId);

            WorkspaceResponseDTO workspace = workspaces.stream()
                    .filter(w -> tenantId.equals(w.getId()))
                    .findFirst()
                    .orElse(null);

            if (workspace == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied: You are not a member of this workspace");
            }

            return ResponseEntity.ok(workspace);

        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Not authenticated");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving workspace");
        }
    }

    /**
     * GET /api/v1/workspaces/{tenantId}/delete-summary
     * Lấy thông tin tóm tắt trước khi xóa (số phiếu, thành viên, ...)
     * Chỉ OWNER mới gọi được.
     */
    @GetMapping("/{tenantId}/delete-summary")
    public ResponseEntity<?> getDeleteSummary(
            @PathVariable String tenantId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String userId = getUserIdFromContext(authHeader);
            if (userId == null)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            return ResponseEntity.ok(workspaceService.getDeleteSummary(tenantId, userId));
        } catch (AuthException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    /**
     * DELETE /api/v1/workspaces/{tenantId}
     * Soft-delete workspace. Chỉ OWNER, không có phiếu PROCESSING.
     */
    @DeleteMapping("/{tenantId}")
    public ResponseEntity<?> deleteWorkspace(
            @PathVariable String tenantId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String userId = getUserIdFromContext(authHeader);
            if (userId == null)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            workspaceService.deleteWorkspace(tenantId, userId);
            return ResponseEntity.ok(java.util.Map.of("message", "Xóa kho thành công"));
        } catch (AuthException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Lỗi khi xóa kho: " + e.getMessage()));
        }
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    /**
     * Extract userId from JWT token or security context
     * Tries multiple sources to ensure robustness
     */
    private String getUserIdFromContext(String authHeader) {
        try {
            // Method 1: Try to extract from Authorization header JWT token
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String userId = jwtUtils.getUserIdFromJwtToken(token);
                if (userId != null && !userId.isEmpty()) {
                    return userId;
                }
            }

            return null;

        } catch (Exception e) {
            System.err.println("Error extracting user ID from context: " + e.getMessage());
            return null;
        }
    }
}
