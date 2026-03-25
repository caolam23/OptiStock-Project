package com.optistock.backend.security.aspect;

import com.optistock.backend.enums.WorkspaceRole;
import com.optistock.backend.exception.AuthException;
import com.optistock.backend.exception.ForbiddenException;
import com.optistock.backend.model.Tenant;
import com.optistock.backend.model.TenantMember;
import com.optistock.backend.repository.TenantRepository;
import com.optistock.backend.security.annotation.RequireWorkspaceRole;
import com.optistock.backend.util.WorkspaceContext;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * AOP Aspect xử lý @RequireWorkspaceRole annotation.
 *
 * Luồng:
 * 1. Đọc X-Workspace-Id từ request header
 * 2. Lấy userId từ SecurityContext (JWT đã xác thực)
 * 3. Tìm TenantMember trong Tenant.members khớp userId
 * 4. So sánh TenantMember.role với danh sách role trong annotation
 * 5. Nếu hợp lệ → set WorkspaceContext → cho phép chạy method
 * 6. Nếu không hợp lệ → throw AuthException (403)
 *
 * Teammates chỉ cần gắn annotation, mọi logic check đã có sẵn.
 */
@Aspect
@Component
public class WorkspaceRoleAspect {

    @Autowired
    private TenantRepository tenantRepository;

    @Around("@annotation(requireWorkspaceRole)")
    public Object checkWorkspaceRole(ProceedingJoinPoint joinPoint,
            RequireWorkspaceRole requireWorkspaceRole) throws Throwable {

        // 1. Authentication check
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AuthException("Vui lòng đăng nhập để truy cập chức năng này");
        }

        // userId lưu trong JWT principal (dạng email hoặc userId tùy cấu hình)
        String userId = authentication.getName();

        // 2. Lấy X-Workspace-Id từ request header
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder
                .currentRequestAttributes()).getRequest();
        String workspaceId = request.getHeader("X-Workspace-Id");

        if (workspaceId == null || workspaceId.isBlank()) {
            throw new AuthException("Thiếu thông tin Workspace. Vui lòng chọn kho trước khi thao tác.");
        }

        // 3. Tìm Tenant và kiểm tra membership
        Optional<Tenant> tenantOpt = tenantRepository.findById(workspaceId);
        if (tenantOpt.isEmpty()) {
            throw new AuthException("Workspace không tồn tại hoặc đã bị xóa");
        }

        Tenant tenant = tenantOpt.get();

        // Kiểm tra workspace còn active
        if (!tenant.isActive()) {
            throw new AuthException("Workspace đã bị khóa hoặc hết hạn subscription");
        }

        // 4. Tìm TenantMember khớp userId hoặc email
        Optional<TenantMember> memberOpt = tenant.getMembers().stream()
                .filter(m -> userId.equals(m.getUserId()) || userId.equals(m.getEmail()))
                .findFirst();

        if (memberOpt.isEmpty()) {
            throw new ForbiddenException("WORKSPACE_ACCESS_DENIED",
                    "Bạn không phải thành viên của workspace này");
        }

        TenantMember member = memberOpt.get();
        String memberRole = member.getRole();

        // 5. Kiểm tra role có nằm trong danh sách được phép không
        Set<String> allowedRoles = Arrays.stream(requireWorkspaceRole.value())
                .map(WorkspaceRole::getCode)
                .collect(Collectors.toSet());

        if (!allowedRoles.contains(memberRole)) {
            throw new ForbiddenException("INSUFFICIENT_ROLE",
                    requireWorkspaceRole.message()
                            + " (Cần: " + allowedRoles + ", Bạn có: " + memberRole + ")");
        }

        // 6. Set workspace context cho service layer sử dụng
        WorkspaceContext.setCurrentWorkspaceId(workspaceId);
        WorkspaceContext.setCurrentTenantId(tenant.getTenantId());
        WorkspaceContext.setCurrentWorkspaceRole(memberRole);
        WorkspaceContext.setCurrentUserId(member.getUserId());

        try {
            return joinPoint.proceed();
        } finally {
            // Cleanup ThreadLocal sau khi xử lý xong
            WorkspaceContext.clear();
        }
    }
}
