# 📑 PROMPT FILES INDEX - AUTHENTICATION & AUTHORIZATION

## 📂 CÓ 3 FILE PROMPT SẴN SÀNG

---

## 1️⃣ **PROMPT_SHORT.md** ⚡ (COPY-PASTE NHANH)

**Size:** ~80 lines  
**Dùng cho:** Dân nhanh, muốn copy-paste liền vào Gemini  
**Nội dung:** 
- Yêu cầu 6 tính năng (Register, Login, OTP, SSO, Protected Routes, Refresh Token)
- Liệt kê dependencies cần thêm
- Files cần tạo (tóm tắt)
- Checklist hoàn thành

**Cách dùng:**
```
1. Mở PROMPT_SHORT.md
2. Ctrl+A → Ctrl+C
3. Dán vào Gemini chat
4. Send
5. Gemini code toàn bộ
```

**Lợi ích:** Nhanh, gọn, đủ thông tin

---

## 2️⃣ **PROMPT_FOR_GEMINI.md** 📖 (CHI TIẾT ĐẦY ĐỦ)

**Size:** ~500+ lines  
**Dùng cho:** Muốn chi tiết từng file, từng method  
**Nội dung:**
- Tóm tắt dự án hiện tại
- Files nào xóa, nào giữ
- Chi tiết từng Backend file (Model, Repository, DTOs, Services, Controller, Config)
- Chi tiết từng Frontend file (Pages, API, Routing)
- Dependencies chính xác
- Config files updates
- Testing instructions
- Checklist chi tiết (30+ items)

**Cách dùng:**
```
1. Mở PROMPT_FOR_GEMINI.md
2. Ctrl+A → Ctrl+C
3. Dán vào Gemini chat
4. Send
5. Gemini code chi tiết từng file
```

**Lợi ích:** Detail, đầy đủ, khó hiểu lầm

---

## 3️⃣ **HOW_TO_USE_PROMPT.md** 🎓 (HƯỚNG DẪN)

**Size:** ~150 lines  
**Nội dung:**
- Chọn prompt nào?
- Bước-by-bước cách dùng
- Checklist trước khi gửi
- Nếu Gemini sai sót, báo gì?
- Workflow complete
- Security tips
- Tips để Gemini code tốt hơn

**Đọc cái này trước khi dùng prompt!**

---

## 🎯 QUICK DECISION TREE

```
Bạn muốn gì?
│
├─ "Copy-paste nhanh vào Gemini ngay"
│  └─→ Dùng: PROMPT_SHORT.md
│
├─ "Chi tiết đủ để không misunderstand"
│  └─→ Dùng: PROMPT_FOR_GEMINI.md
│
└─ "Hướng dẫn cách dùng prompt"
   └─→ Đọc: HOW_TO_USE_PROMPT.md trước
```

---

## 📋 WORKFLOW ĐỀ XUẤT

```
Step 1: Đọc HOW_TO_USE_PROMPT.md (5 phút)
   ↓
Step 2: Chọn 1 prompt (SHORT hay FULL?)
   ↓
Step 3: Copy prompt → Dán vào Gemini
   ↓
Step 4: Gemini code ~20 files
   ↓
Step 5: Copy code → Paste vào project
   ↓
Step 6: Update config files (pom.xml, application.properties, package.json)
   ↓
Step 7: Test tất cả features
   ↓
Done! ✅
```

**Thời gian:** ~1 giờ

---

## 💾 FILE LOCATIONS (IN PROJECT)

```
OptiStock-Project/
├── PROMPT_SHORT.md                    👈 Copy-paste version
├── PROMPT_FOR_GEMINI.md               👈 Chi tiết version
├── HOW_TO_USE_PROMPT.md               👈 Hướng dẫn
├── README_PROMPTS.md                  👈 File này
├── backend/
│   ├── pom.xml                        (Gemini sẽ update)
│   └── src/main/resources/
│       └── application.properties    (Gemini sẽ update)
└── frontend/
    ├── package.json                   (Gemini sẽ update)
    └── src/
```

---

## ✅ CONTENT SUMMARY

| Prompt | Lines | Chi tiết | Copy-Paste | Dùng Cho |
|--------|-------|----------|-----------|----------|
| **SHORT** | 80 | ⭐⭐ | ✅ Nhanh | Dân nhanh |
| **FULL** | 500+ | ⭐⭐⭐⭐⭐ | ✅ Ok | Detail người |
| **GUIDE** | 150 | ⭐⭐⭐ | 📖 Read | Hướng dẫn |

---

## 🎓 ĐỂ GEMINI TỰ CHỌN FILE NÀO?

**Short version is for:**
- People who want quick setup
- People who understand auth well
- Fast implementation

**Full version is for:**
- People with no auth experience
- Need clear file structure
- Want specific method details

**Choose based on YOUR experience level!**

---

## 🚀 LƯU Ý QUAN TRỌNG

✅ **TRƯỚC khi gửi prompt, kiểm tra:**
- [ ] Project folder cấu trúc sạch (không rác files)
- [ ] TestController.java still exists (Gemini sẽ xóa nó)
- [ ] MongoDB sẵn sàng (hoặc Docker)
- [ ] Gmail account ready (cho OTP setup)
- [ ] Google OAuth account ready (cho SSO setup)

❌ **KHÔNG CẦN:**
- Bạn không cần code gì hết, chỉ copy-paste từ Gemini
- Không cần hiểu toàn bộ chi tiết (Gemini giải thích)
- Không cần debug (nếu Gemini code đúng)

---

## 📞 CÁI NÀO KHÔNG HIỂU?

**Nếu còn thắc mắc:**

1. Đọc **HOW_TO_USE_PROMPT.md** (90% câu hỏi được trả lời)
2. Copy **PROMPT_SHORT.md** hoặc **PROMPT_FOR_GEMINI.md** → Dán vào Gemini
3. Hỏi Gemini nếu code sai: "Fix file ABC, line XYZ có vấn đề..."

---

## 🎯 PERFECT FLOW

```
You:
────────────────────────────────
1. Đọc HOW_TO_USE_PROMPT.md (SKIP if bạn nhanh nhẹn)
2. Copy PROMPT_SHORT.md hoặc PROMPT_FOR_GEMINI.md
3. Dán vào Gemini.google.com
4. Click Send
────────────────────────────────

Gemini:
────────────────────────────────
5. Code ~20 files
6. Giải thích từng tính năng
7. Hỏi bạn có cần gì không
────────────────────────────────

You:
────────────────────────────────
8. Copy each file from Gemini
9. Paste vào đúng folder trong project
10. Update pom.xml, application.properties, package.json
11. npm install + mvn clean install
12. Test features
────────────────────────────────

DONE! ✅ Authentication & Authorization ready!
```

---

## 🎓 BẠN LEARN ĐƯỢC GÌ?

Sau khi hoàn thành với Gemini:
- ✅ JWT Token authentication
- ✅ OTP Email verification
- ✅ Google OAuth 2.0 SSO
- ✅ Spring Security basics
- ✅ MongoDB user management
- ✅ React protected routes
- ✅ Axios interceptors

---

## 🏁 READY TO GO!

**Bạn có 3 file sẵn sàng:**

| # | File | Action |
|---|------|--------|
| 1 | 📖 HOW_TO_USE_PROMPT.md | Read first (5 min) |
| 2 | ⚡ PROMPT_SHORT.md | Copy → Gemini (if detail không cần) |
| 3 | 📚 PROMPT_FOR_GEMINI.md | Copy → Gemini (if detail cần) |

**👉 START NOW: Open HOW_TO_USE_PROMPT.md and follow steps!**

---

*Last Updated: 2024-02-08*  
*Status: Ready for Implementation* ✅
