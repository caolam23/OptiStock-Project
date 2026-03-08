package com.optistock.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * PersonnelEventService — quản lý SSE emitters cho trang Nhân sự.
 *
 * Luồng:
 * 1. Client mở EventSource → PersonnelController tạo SseEmitter và đăng ký tại
 * đây.
 * 2. Khi có event (vd: member mới accept lời mời) → gọi broadcast(tenantId,
 * eventName).
 * 3. Tất cả tab đang xem trang Nhân sự của kho đó sẽ nhận event ngay lập tức.
 */
@Service
public class PersonnelEventService {

    private static final Logger log = LoggerFactory.getLogger(PersonnelEventService.class);

    /** Map<tenantId, Set<SseEmitter>> — một kho có thể có nhiều tab/người xem */
    private final Map<String, Set<SseEmitter>> emitters = new ConcurrentHashMap<>();

    // ── Đăng ký emitter mới ──────────────────────────────────────────
    public SseEmitter subscribe(String tenantId) {
        // Timeout dài (5 phút) — client tự reconnect nếu bị ngắt
        SseEmitter emitter = new SseEmitter(300_000L);

        emitters.computeIfAbsent(tenantId, k -> new CopyOnWriteArraySet<>()).add(emitter);
        log.debug("SSE: client subscribed to tenant={}, total={}", tenantId, emitters.get(tenantId).size());

        // Cleanup khi emitter hoàn thành / timeout / lỗi
        Runnable cleanup = () -> {
            Set<SseEmitter> set = emitters.get(tenantId);
            if (set != null)
                set.remove(emitter);
            log.debug("SSE: emitter removed for tenant={}", tenantId);
        };
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        // Gửi event "connected" ngay để giữ kết nối sống
        try {
            emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (IOException e) {
            cleanup.run();
        }

        return emitter;
    }

    // ── Broadcast event tới tất cả client đang xem tenant này ────────
    public void broadcast(String tenantId, String eventName) {
        Set<SseEmitter> set = emitters.get(tenantId);
        if (set == null || set.isEmpty())
            return;

        log.info("SSE broadcast: event={} → tenant={} ({} clients)", eventName, tenantId, set.size());

        Set<SseEmitter> dead = new CopyOnWriteArraySet<>();
        for (SseEmitter emitter : set) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(tenantId));
            } catch (IOException e) {
                dead.add(emitter);
            }
        }
        set.removeAll(dead);
    }
}
