package com.optistock.backend.service;

import com.optistock.backend.model.Invitation;
import com.optistock.backend.model.Tenant;
import com.optistock.backend.model.TenantMember;
import com.optistock.backend.model.User;
import com.optistock.backend.repository.InvitationRepository;
import com.optistock.backend.repository.TenantRepository;
import com.optistock.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * InvitationService: Xử lý logic cho accept/reject/info lời mời thành viên.
 */
@Service
public class InvitationService {

    private static final Logger log = LoggerFactory.getLogger(InvitationService.class);

    private final InvitationRepository invitationRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;

    public InvitationService(
            InvitationRepository invitationRepository,
            TenantRepository tenantRepository,
            UserRepository userRepository) {
        this.invitationRepository = invitationRepository;
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
    }

    // ============================================================
    // GET INFO — Public (không cần đăng nhập)
    // ============================================================

    /**
     * Lấy thông tin lời mời theo invitationCode.
     * Không expose invitationCode trong response.
     *
     * @return Map: { tenantName, role, invitedEmail, expiresAt, status }
     */
    public Map<String, Object> getInvitationInfo(String code) {
        Invitation invitation = findAndValidateInvitation(code);

        // Lấy tên tenant để hiển thị
        String tenantName = "Workspace";
        try {
            Tenant tenant = tenantRepository.findById(invitation.getTenantId()).orElse(null);
            if (tenant != null && tenant.getName() != null) {
                tenantName = tenant.getName();
            }
        } catch (Exception e) {
            log.warn("Không lấy được tên tenant: {}", e.getMessage());
        }

        Map<String, Object> info = new HashMap<>();
        info.put("tenantName", tenantName);
        info.put("tenantId", invitation.getTenantId());
        info.put("role", invitation.getRole());
        info.put("invitedEmail", invitation.getInvitedEmail());
        info.put("expiresAt", invitation.getExpiresAt());
        info.put("status", invitation.getStatus());

        return info;
    }

    // ============================================================
    // ACCEPT — Authenticated
    // ============================================================

    /**
     * Chấp nhận lời mời: thêm user vào Tenant.members, cập nhật Invitation.status.
     *
     * @param code             invitationCode từ request
     * @param currentUserEmail email từ JWT token của user đang đăng nhập
     * @return Map: { tenantId, tenantName, role, message }
     */
    @Transactional
    public Map<String, Object> acceptInvitation(String code, String currentUserEmail) {
        // 1. Validate invitation
        Invitation invitation = findAndValidateInvitation(code);

        // 2. Lấy user hiện tại
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy tài khoản: " + currentUserEmail));

        // 3. Lấy tenant
        Tenant tenant = tenantRepository.findById(invitation.getTenantId())
                .orElseThrow(() -> new IllegalStateException("Workspace không còn tồn tại."));

        // 4. Kiểm tra user đã là member chưa
        String userId = currentUser.getId();
        List<TenantMember> members = tenant.getMembers();
        boolean alreadyMember = members.stream()
                .anyMatch(m -> userId.equals(m.getUserId()));
        if (alreadyMember) {
            throw new IllegalStateException("Bạn đã là thành viên của workspace này.");
        }

        // 5. Thêm TenantMember mới
        TenantMember newMember = new TenantMember(
                userId,
                currentUser.getEmail(),
                invitation.getRole(),
                LocalDateTime.now(),
                LocalDateTime.now());
        members.add(newMember);
        tenant.setMembers(members);
        tenantRepository.save(tenant);
        log.info("User {} đã join tenant {} với role {}", currentUserEmail, tenant.getName(), invitation.getRole());

        // 6. Cập nhật trạng thái Invitation
        invitation.setStatus("ACCEPTED");
        invitation.setAcceptedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
        log.info("Invitation {} → ACCEPTED", code);

        // 7. Build response
        Map<String, Object> result = new HashMap<>();
        result.put("tenantId", tenant.getId());
        result.put("tenantName", tenant.getName());
        result.put("role", invitation.getRole());
        result.put("message", "Chào mừng bạn đã tham gia " + tenant.getName() + "!");
        return result;
    }

    // ============================================================
    // REJECT — Authenticated
    // ============================================================

    /**
     * Từ chối lời mời: cập nhật Invitation.status → REJECTED.
     */
    @Transactional
    public Map<String, Object> rejectInvitation(String code, String currentUserEmail) {
        Invitation invitation = findAndValidateInvitation(code);

        invitation.setStatus("REJECTED");
        invitationRepository.save(invitation);
        log.info("User {} đã từ chối invitation {}", currentUserEmail, code);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Đã từ chối lời mời.");
        return result;
    }

    // ============================================================
    // PRIVATE HELPERS
    // ============================================================

    /**
     * Tìm và validate Invitation theo code.
     * Throw exception nếu không tồn tại / đã dùng / đã hết hạn.
     */
    private Invitation findAndValidateInvitation(String code) {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Mã mời không được để trống.");
        }

        Invitation invitation = invitationRepository.findByInvitationCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Mã mời không tồn tại hoặc không hợp lệ."));

        if (!"PENDING".equals(invitation.getStatus())) {
            String msg = switch (invitation.getStatus()) {
                case "ACCEPTED" -> "Lời mời này đã được chấp nhận trước đó.";
                case "REJECTED" -> "Lời mời này đã bị từ chối.";
                case "EXPIRED" -> "Lời mời đã hết hạn.";
                default -> "Lời mời không còn hợp lệ (trạng thái: " + invitation.getStatus() + ").";
            };
            throw new IllegalStateException(msg);
        }

        // Kiểm tra hết hạn theo thời gian thực
        if (invitation.getExpiresAt() != null && LocalDateTime.now().isAfter(invitation.getExpiresAt())) {
            invitation.setStatus("EXPIRED");
            invitationRepository.save(invitation);
            throw new IllegalStateException("Lời mời đã hết hạn (quá " + invitation.getExpiresAt() + ").");
        }

        return invitation;
    }
}
