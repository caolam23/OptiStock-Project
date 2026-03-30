package com.optistock.backend.service;

import com.optistock.backend.enums.WorkspaceRole;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.model.*;
import com.optistock.backend.repository.*;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * PersonnelService — Quản lý thành viên và lời mời trong một Workspace.
 *
 * Phân quyền:
 * OWNER : toàn quyền (mời mọi role, đổi role, kick)
 * MANAGER : mời STAFF/ACCOUNTANT/SALE, đổi role & kick chỉ
 * STAFF/ACCOUNTANT/SALE
 * STAFF : chỉ được xem (không có endpoint cho case này)
 */
@Service
public class PersonnelService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final InvitationRepository invitationRepository;
    private final EmailService emailService;

    public PersonnelService(
            TenantRepository tenantRepository,
            UserRepository userRepository,
            InvitationRepository invitationRepository,
            EmailService emailService) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.invitationRepository = invitationRepository;
        this.emailService = emailService;
    }

    // ─── ROLES MANAGER CAN MANAGE ─────────────────────────────────────────────
    private static final Set<String> MANAGER_MANAGEABLE = Set.of("STAFF", "ACCOUNTANT", "SALE");
    private static final Set<String> MANAGER_INVITABLE = Set.of("STAFF", "ACCOUNTANT", "SALE");

    // ── GET MEMBERS ────────────────────────────────────────────────────────────
    /**
     * Trả về danh sách thành viên hiện tại + thông tin User (fullName, avatar).
     */
    public List<Map<String, Object>> getMembers(String tenantId, String requesterId) {
        Tenant tenant = getTenantOrThrow(tenantId);
        assertMember(tenant, requesterId); // bất kỳ member đều xem được

        @SuppressWarnings("unchecked")
        List<TenantMember> members = (List<TenantMember>) getFieldValue(tenant, "members");
        if (members == null) {
            members = List.of();
        }

        return members.stream().map(m -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("userId", m.getUserId());
            row.put("email", m.getEmail());
            row.put("role", m.getRole());
            row.put("joinedAt", m.getJoinedAt());
            // Enrich với fullName + avatar từ User collection
            userRepository.findById(m.getUserId()).ifPresent(u -> {
                row.put("fullName", u.getFullName());
                row.put("avatar", u.getAvatar());
            });
            return row;
        }).collect(Collectors.toList());
    }

    // ── GET PENDING INVITATIONS ────────────────────────────────────────────────
    public List<Map<String, Object>> getPendingInvitations(String tenantId, String requesterId) {
        Tenant tenant = getTenantOrThrow(tenantId);
        assertMember(tenant, requesterId);

        return invitationRepository.findByTenantIdAndStatus(tenantId, "PENDING")
                .stream().map(inv -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", getFieldValue(inv, "id"));
                    row.put("invitedEmail", getFieldValue(inv, "invitedEmail"));
                    row.put("role", getFieldValue(inv, "role"));
                    row.put("status", getFieldValue(inv, "status"));
                    row.put("expiresAt", getFieldValue(inv, "expiresAt"));
                    row.put("createdAt", getFieldValue(inv, "createdAt"));
                    return row;
                }).collect(Collectors.toList());
    }

    // ── SEND INVITATION ────────────────────────────────────────────────────────
    public Map<String, Object> sendInvitation(String tenantId, String requesterId, String email, String role) {
        Tenant tenant = getTenantOrThrow(tenantId);
        String requesterRole = getMemberRole(tenant, requesterId);

        // Validate requester có quyền mời role đó không
        if ("MANAGER".equals(requesterRole) && !MANAGER_INVITABLE.contains(role)) {
            throw new AuthException("MANAGER chỉ được mời: STAFF, ACCOUNTANT, SALE");
        }
        if (!WorkspaceRole.isValidInvitableRole(role)) {
            throw new AuthException("Role không hợp lệ: " + role);
        }
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new AuthException("Email không hợp lệ");
        }

        // Check email đã là thành viên chưa
        @SuppressWarnings("unchecked")
        List<TenantMember> members = (List<TenantMember>) getFieldValue(tenant, "members");
        if (members == null) {
            members = List.of();
        }
        final List<TenantMember> finalMembers = members;
        boolean alreadyMember = finalMembers.stream().anyMatch(m -> email.equalsIgnoreCase(m.getEmail()));
        if (alreadyMember)
            throw new AuthException("Email này đã là thành viên của kho");

        // Check đã có lời mời PENDING cho email này chưa
        boolean hasPending = invitationRepository.findByTenantIdAndStatus(tenantId, "PENDING")
                .stream().anyMatch(i -> email.equalsIgnoreCase((String) getFieldValue(i, "invitedEmail")));
        if (hasPending)
            throw new AuthException("Đã có lời mời đang chờ cho email này");

        // Tạo invitation
        String code = "INV-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        Invitation inv = new Invitation();
        setFieldValue(inv, "tenantId", tenantId);
        setFieldValue(inv, "invitedEmail", email);
        setFieldValue(inv, "role", role);
        setFieldValue(inv, "invitedByUserId", requesterId);
        setFieldValue(inv, "invitationCode", code);
        setFieldValue(inv, "status", "PENDING");
        setFieldValue(inv, "expiresAt", LocalDateTime.now().plusDays(7));
        Invitation saved = invitationRepository.save(inv);

        // Gửi email
        try {
            sendEmail(email, getString(tenant, "name"), role, code);
        } catch (Exception e) {
            // log nhưng không fail request
            System.err.println("[PersonnelService] Email send failed: " + e.getMessage());
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", getFieldValue(saved, "id"));
        result.put("invitedEmail", getFieldValue(saved, "invitedEmail"));
        result.put("role", getFieldValue(saved, "role"));
        result.put("status", getFieldValue(saved, "status"));
        result.put("expiresAt", getFieldValue(saved, "expiresAt"));
        return result;
    }

    // ── UPDATE MEMBER ROLE ─────────────────────────────────────────────────────
    public void updateMemberRole(String tenantId, String requesterId, String targetUserId, String newRole) {
        Tenant tenant = getTenantOrThrow(tenantId);
        String requesterRole = getMemberRole(tenant, requesterId);

        TenantMember target = getMemberOrThrow(tenant, targetUserId);
        String targetRole = target.getRole();

        // OWNER không thể bị chỉnh sửa
        if ("OWNER".equals(targetRole))
            throw new AuthException("Không thể đổi role của OWNER");
        // MANAGER chỉ chỉnh được STAFF/ACCOUNTANT/SALE
        if ("MANAGER".equals(requesterRole) && !MANAGER_MANAGEABLE.contains(targetRole)) {
            throw new AuthException("MANAGER không có quyền đổi role của " + targetRole);
        }
        if ("MANAGER".equals(requesterRole) && !MANAGER_MANAGEABLE.contains(newRole)) {
            throw new AuthException("MANAGER không thể gán role " + newRole);
        }
        if (!WorkspaceRole.isValidInvitableRole(newRole)) {
            throw new AuthException("Role mới không hợp lệ: " + newRole);
        }

        target.setRole(newRole);
        tenantRepository.save(tenant);
    }

    // ── REMOVE MEMBER ──────────────────────────────────────────────────────────
    public void removeMember(String tenantId, String requesterId, String targetUserId) {
        Tenant tenant = getTenantOrThrow(tenantId);
        String requesterRole = getMemberRole(tenant, requesterId);

        TenantMember target = getMemberOrThrow(tenant, targetUserId);

        if ("OWNER".equals(target.getRole()))
            throw new AuthException("Không thể xóa OWNER khỏi kho");
        if (requesterId.equals(targetUserId))
            throw new AuthException("Không thể tự xóa bản thân khỏi kho");
        if ("MANAGER".equals(requesterRole) && !MANAGER_MANAGEABLE.contains(target.getRole())) {
            throw new AuthException("MANAGER không có quyền xóa " + target.getRole());
        }

        @SuppressWarnings("unchecked")
        List<TenantMember> members = new ArrayList<>(Optional.ofNullable((List<TenantMember>) getFieldValue(tenant, "members")).orElse(List.of()));
        members.removeIf(m -> targetUserId.equals(m.getUserId()));
        setFieldValue(tenant, "members", members);
        tenantRepository.save(tenant);
    }

    // ── CANCEL INVITATION ──────────────────────────────────────────────────────
    public void cancelInvitation(String tenantId, String requesterId, String inviteId) {
        Tenant tenant = getTenantOrThrow(tenantId);
        assertMember(tenant, requesterId); // Bất kỳ member trong kho đều có thể hủy? Thực ra nên chỉ OWNER/MANAGER →
                                           // check role

        String requesterRole = getMemberRole(tenant, requesterId);
        if (!"OWNER".equals(requesterRole) && !"MANAGER".equals(requesterRole)) {
            throw new AuthException("Chỉ OWNER hoặc MANAGER mới có thể hủy lời mời");
        }

        Invitation inv = invitationRepository.findById(inviteId)
                .orElseThrow(() -> new AuthException("Không tìm thấy lời mời"));
        if (!tenantId.equals(getFieldValue(inv, "tenantId")))
            throw new AuthException("Lời mời không thuộc kho này");

        setFieldValue(inv, "status", "EXPIRED");
        invitationRepository.save(inv);
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────

    private Tenant getTenantOrThrow(String tenantId) {
        return tenantRepository.findById(tenantId)
                .orElseThrow(() -> new AuthException("Không tìm thấy kho: " + tenantId));
    }

    private String getMemberRole(Tenant tenant, String userId) {
        @SuppressWarnings("unchecked")
        List<TenantMember> members = (List<TenantMember>) getFieldValue(tenant, "members");
        if (members == null) {
            members = List.of();
        }
        final List<TenantMember> finalMembers = members;
        return finalMembers.stream()
                .filter(m -> userId.equals(m.getUserId()))
                .map(TenantMember::getRole)
                .findFirst()
                .orElseThrow(() -> new AuthException("Bạn không phải thành viên của kho này"));
    }

    private TenantMember getMemberOrThrow(Tenant tenant, String userId) {
        @SuppressWarnings("unchecked")
        List<TenantMember> members = (List<TenantMember>) getFieldValue(tenant, "members");
        if (members == null) {
            members = List.of();
        }
        final List<TenantMember> finalMembers = members;
        return finalMembers.stream()
                .filter(m -> userId.equals(m.getUserId()))
                .findFirst()
                .orElseThrow(() -> new AuthException("Không tìm thấy thành viên: " + userId));
    }

    private void assertMember(Tenant tenant, String userId) {
        getMemberRole(tenant, userId); // throws if not member
    }

    private void sendEmail(String toEmail, String tenantName, String role, String code) {
        String link = "http://localhost:5173/accept-invitation?code=" + code;
        String subject = "📧 Lời mời tham gia " + tenantName + " trên OptiStock";
        String html = String.format(
                """
                        <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0">
                        <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,.1)">
                          <div style="background:#F97316;padding:20px;text-align:center">
                            <h1 style="color:#fff;margin:0">OptiStock</h1>
                          </div>
                          <div style="padding:30px;color:#333">
                            <h2>Bạn được mời tham gia</h2>
                            <p>Lời mời tham gia <strong>%s</strong> với vai trò <strong>%s</strong></p>
                            <div style="text-align:center;margin:30px 0">
                              <a href="%s" style="display:inline-block;background:#F97316;color:#fff;padding:12px 30px;text-decoration:none;border-radius:5px;font-weight:bold">CHẤP NHẬN LỜI MỜI</a>
                            </div>
                            <p>Hoặc nhập code: <strong>%s</strong></p>
                            <p style="color:#666;font-size:12px">Link hết hạn sau 7 ngày</p>
                          </div>
                        </div></body></html>
                        """,
                tenantName, role, link, code);
        emailService.sendInvitationEmail(toEmail, subject, html);
    }

    // ==========================================
    // REFLECTION HELPERS (BYPASS LOMBOK)
    // ==========================================

    private Object getFieldValue(Object obj, String fieldName) {
        if (obj == null)
            return null;
        try {
            Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(obj);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            return null;
        }
    }

    private void setFieldValue(Object obj, String fieldName, Object value) {
        if (obj == null)
            return;
        try {
            Field field = obj.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(obj, value);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            // Ignored silently for bypass
        }
    }

    private String getString(Object obj, String fieldName) {
        Object val = getFieldValue(obj, fieldName);
        return val != null ? val.toString() : null;
    }
}
