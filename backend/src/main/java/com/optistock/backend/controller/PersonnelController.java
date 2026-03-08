package com.optistock.backend.controller;

import com.optistock.backend.service.PersonnelService;
import com.optistock.backend.service.PersonnelEventService;
import com.optistock.backend.util.JwtUtils;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

/**
 * PersonnelController — REST API cho quản lý nhân sự trong Workspace.
 *
 * Base: /api/v1/workspaces/{tenantId}/personnel
 *
 * Phân quyền:
 * - GET /members → mọi member trong kho
 * - GET /invitations → mọi member
 * - POST /invitations → OWNER + MANAGER
 * - PUT /members/{id} → OWNER (all), MANAGER (STAFF/ACCOUNTANT/SALE only)
 * - DELETE /members/{id} → OWNER (all), MANAGER (STAFF/ACCOUNTANT/SALE only)
 * - DELETE /invitations/{id} → OWNER + MANAGER
 */
@RestController
@RequestMapping("/api/v1/workspaces/{tenantId}/personnel")
@CrossOrigin(origins = "http://localhost:5173")
public class PersonnelController {

    private final PersonnelService personnelService;
    private final PersonnelEventService personnelEventService;
    private final JwtUtils jwtUtils;

    public PersonnelController(PersonnelService personnelService,
            PersonnelEventService personnelEventService,
            JwtUtils jwtUtils) {
        this.personnelService = personnelService;
        this.personnelEventService = personnelEventService;
        this.jwtUtils = jwtUtils;
    }

    // ── SSE SUBSCRIBE ───────────────────────────────────────────────
    /**
     * GET /events — client kết nối để nhận push event realtime.
     * Browser dùng: new
     * EventSource('/api/v1/workspaces/{tenantId}/personnel/events', {
     * withCredentials: true })
     */
    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@PathVariable String tenantId) {
        return personnelEventService.subscribe(tenantId);
    }

    // ── GET MEMBERS ────────────────────────────────────────────────────────────
    @GetMapping("/members")
    public ResponseEntity<?> getMembers(
            @PathVariable String tenantId,
            @RequestHeader("Authorization") String auth) {
        try {
            String userId = extractUserId(auth);
            return ResponseEntity.ok(personnelService.getMembers(tenantId, userId));
        } catch (Exception e) {
            return error(e);
        }
    }

    // ── GET PENDING INVITATIONS ────────────────────────────────────────────────
    @GetMapping("/invitations")
    public ResponseEntity<?> getInvitations(
            @PathVariable String tenantId,
            @RequestHeader("Authorization") String auth) {
        try {
            String userId = extractUserId(auth);
            return ResponseEntity.ok(personnelService.getPendingInvitations(tenantId, userId));
        } catch (Exception e) {
            return error(e);
        }
    }

    // ── SEND INVITATION ────────────────────────────────────────────────────────
    @PostMapping("/invitations")
    public ResponseEntity<?> sendInvitation(
            @PathVariable String tenantId,
            @RequestHeader("Authorization") String auth,
            @RequestBody Map<String, String> body) {
        try {
            String userId = extractUserId(auth);
            String email = body.get("email");
            String role = body.get("role");
            return ResponseEntity.ok(personnelService.sendInvitation(tenantId, userId, email, role));
        } catch (Exception e) {
            return error(e);
        }
    }

    // ── UPDATE MEMBER ROLE ─────────────────────────────────────────────────────
    @PutMapping("/members/{targetUserId}")
    public ResponseEntity<?> updateRole(
            @PathVariable String tenantId,
            @PathVariable String targetUserId,
            @RequestHeader("Authorization") String auth,
            @RequestBody Map<String, String> body) {
        try {
            String userId = extractUserId(auth);
            String newRole = body.get("role");
            personnelService.updateMemberRole(tenantId, userId, targetUserId, newRole);
            return ResponseEntity.ok(Map.of("message", "Cập nhật role thành công"));
        } catch (Exception e) {
            return error(e);
        }
    }

    // ── REMOVE MEMBER ──────────────────────────────────────────────────────────
    @DeleteMapping("/members/{targetUserId}")
    public ResponseEntity<?> removeMember(
            @PathVariable String tenantId,
            @PathVariable String targetUserId,
            @RequestHeader("Authorization") String auth) {
        try {
            String userId = extractUserId(auth);
            personnelService.removeMember(tenantId, userId, targetUserId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa thành viên khỏi kho"));
        } catch (Exception e) {
            return error(e);
        }
    }

    // ── CANCEL INVITATION ──────────────────────────────────────────────────────
    @DeleteMapping("/invitations/{inviteId}")
    public ResponseEntity<?> cancelInvitation(
            @PathVariable String tenantId,
            @PathVariable String inviteId,
            @RequestHeader("Authorization") String auth) {
        try {
            String userId = extractUserId(auth);
            personnelService.cancelInvitation(tenantId, userId, inviteId);
            return ResponseEntity.ok(Map.of("message", "Đã hủy lời mời"));
        } catch (Exception e) {
            return error(e);
        }
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────

    private String extractUserId(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return jwtUtils.getUserIdFromJwtToken(authHeader.substring(7));
        }
        throw new IllegalArgumentException("Missing or invalid Authorization header");
    }

    private ResponseEntity<?> error(Exception e) {
        String msg = e.getMessage() != null ? e.getMessage() : "Lỗi hệ thống";
        return ResponseEntity.badRequest().body(Map.of("message", msg));
    }
}
