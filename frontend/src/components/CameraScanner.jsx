import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import styles from './CameraScanner.module.css';

/**
 * CameraScanner — quét barcode/QR bằng webcam laptop.
 *
 * Props:
 *   onScan(code: string) — gọi mỗi khi barcode được detect
 *   onClose()           — đóng camera
 */
const CameraScanner = ({ onScan, onClose }) => {
    const containerId = 'camera-scanner-region';
    const scannerRef = useRef(null);
    const onScanRef = useRef(onScan);
    const [error, setError] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [lastCode, setLastCode] = useState(null);
    const cooldownRef = useRef(false);

    // Giữ onScan ref luôn mới nhất (tránh stale closure)
    useEffect(() => { onScanRef.current = onScan; }, [onScan]);

    useEffect(() => {
        let isMounted = true;

        // Tạo scanner instance
        const scanner = new Html5Qrcode(containerId, /* verbose= */ false);
        scannerRef.current = scanner;

        const startScanner = async () => {
            try {
                await scanner.start(
                    { facingMode: 'user' },  // laptop webcam = camera trước
                    {
                        fps: 10,
                        qrbox: { width: 280, height: 180 },
                        aspectRatio: 1.5,
                        disableFlip: false,
                    },
                    (decodedText) => {
                        // Cooldown 2s — tránh quét trùng liên tục
                        if (cooldownRef.current) return;
                        cooldownRef.current = true;
                        if (isMounted) setLastCode(decodedText);
                        onScanRef.current(decodedText);
                        setTimeout(() => { cooldownRef.current = false; }, 2000);
                    },
                    () => { /* decode error — bình thường, camera đang tìm mã */ }
                );
                if (isMounted) setIsReady(true);
            } catch (err) {
                if (isMounted) {
                    const msg = typeof err === 'string' ? err : err?.message;
                    setError(msg || 'Không thể mở camera.');
                }
            }
        };

        startScanner();

        // Cleanup: chỉ stop nếu scanner thật sự đang chạy
        return () => {
            isMounted = false;
            try {
                const state = scanner.getState();
                if (state === Html5QrcodeScannerState.SCANNING ||
                    state === Html5QrcodeScannerState.PAUSED) {
                    scanner.stop().catch(() => { });
                }
            } catch {
                // getState() có thể throw nếu chưa init đủ — bỏ qua
            }
        };
    }, []); // mount 1 lần duy nhất

    // Đóng camera + cleanup
    const handleClose = useCallback(() => {
        const scanner = scannerRef.current;
        if (scanner) {
            try {
                const state = scanner.getState();
                if (state === Html5QrcodeScannerState.SCANNING ||
                    state === Html5QrcodeScannerState.PAUSED) {
                    scanner.stop().catch(() => { });
                }
            } catch { /* ignore */ }
        }
        onClose();
    }, [onClose]);

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <span className={styles.title}>📷 Quét barcode bằng camera</span>
                    <button className={styles.closeBtn} onClick={handleClose}>✕</button>
                </div>

                {/* Camera view */}
                <div className={styles.cameraWrap}>
                    <div id={containerId} className={styles.cameraContainer} />
                    {!isReady && !error && (
                        <div className={styles.loadingOverlay}>
                            <div className={styles.spinner} />
                            <p>Đang mở camera...</p>
                        </div>
                    )}
                    {error && (
                        <div className={styles.errorBox}>
                            <p>⚠️ {error}</p>
                            <p className={styles.errorSub}>
                                Kiểm tra: Settings → Privacy → Camera → cho phép trình duyệt
                            </p>
                        </div>
                    )}
                </div>

                {/* Last scanned */}
                {lastCode && (
                    <div className={styles.lastScan}>
                        ✅ Vừa quét: <strong>{lastCode}</strong>
                    </div>
                )}

                {/* Hint */}
                <div className={styles.hint}>
                    <p>🎯 Đưa barcode vào khung · Tự động nhận diện khi lấy nét</p>
                    <p className={styles.hintSub}>Click ngoài modal hoặc ✕ để đóng</p>
                </div>
            </div>
        </div>
    );
};

export default CameraScanner;
