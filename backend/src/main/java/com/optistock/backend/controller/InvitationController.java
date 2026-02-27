package com.optistock.backend.controller;

import com.optistock.backend.service.InvitationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * InvitationController: REST endpoints cho invitation flow.
 *
 * GET /api/v1/invitations/info?code=xxx — Public
 * POST /api/v1/invitations/accept — Authenticated
 * POST /api/v1/invitations/reject — Authenticated
 */
@RestController
@RequestMapping("/api/v1/invitations")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class InvitationController {

    private static final Logger log = LoggerFactory.getLogger(InvitationController.class);

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    // ============================================================
    // GET /info — Public
    // ============================================================

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getInvitationInfo(
            @RequestParam("code") String code) {
        try {
            Map<String, Object> info = invitationService.getInvitationInfo(code);
            return ResponseEntity.ok(info);
        } catch (IllegalArgumentException e) {
            return errorResponse(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (IllegalStateException e) {
            return errorResponse(HttpStatus.GONE, e.getMessage());
        } catch (Exception e) {
            log.error("Error getting invitation info", e);
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống.");
        }
    }

    // ============================================================
    // POST /accept — Authenticated
    // ============================================================

    @PostMapping("/accept")
    public ResponseEntity<Map<String, Object>> acceptInvitation(
            @RequestBody Map<String, String> body) {
        try {
            String code = body.get("invitationCode");
            String currentUserEmail = getCurrentUserEmail();
            Map<String, Object> result = invitationService.acceptInvitation(code, currentUserEmail);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return errorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (IllegalStateException e) {
            return errorResponse(HttpStatus.CONFLICT, e.getMessage());
        } catch (Exception e) {
            log.error("Error accepting invitation", e);
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống.");
        }
    }

    // ============================================================
    // POST /reject — Authenticated
    // ============================================================

    @PostMapping("/reject")
    public ResponseEntity<Map<String, Object>> rejectInvitation(
            @RequestBody Map<String, String> body) {
        try {
            String code = body.get("invitationCode");
            String currentUserEmail = getCurrentUserEmail();
            Map<String, Object> result = invitationService.rejectInvitation(code, currentUserEmail);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return errorResponse(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (IllegalStateException e) {
            return errorResponse(HttpStatus.CONFLICT, e.getMessage());
        } catch (Exception e) {
            log.error("Error rejecting invitation", e);
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống.");
        }
    }

    // ============================================================
    // HELPERS
    // ============================================================

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            Object principal = auth.getPrincipal();
            if (principal instanceof UserDetails ud) {
                return ud.getUsername();
            }
            return principal.toString();
        }
        throw new IllegalStateException("Bạn cần đăng nhập để thực hiện thao tác này.");
    }

    private ResponseEntity<Map<String, Object>> errorResponse(HttpStatus status, String message) {
        Map<String, Object> err = new HashMap<>();
        err.put("error", message);
        err.put("status", status.value());
        return ResponseEntity.status(status).body(err);
    }
}
