# 📖 HƯỚNG DẪN DÙNG PROMPT VỚI GEMINI

## 📂 CÓ 2 FILE PROMPT SẢN SÀNG

| File | Dùng Cho | Cách Dùng |
|------|----------|----------|
| **PROMPT_FOR_GEMINI.md** | Chi tiết (500+ lines) | Copy toàn bộ → Dán vào Gemini |
| **PROMPT_SHORT.md** | Rút gọn (80 lines) | Copy nhanh → Dán vào Gemini |

---

## 🎯 CHỌN PROMPT NÀO?

### ✅ Dùng **PROMPT_SHORT.md** nếu:
- Muốn copy-paste nhanh gọn
- Gemini hiểu rõ yêu cầu chung
- Không cần chi tiết quá kỹ lưỡng

### ✅ Dùng **PROMPT_FOR_GEMINI.md** nếu:
- Muốn detail từng file
- Cần hướng dẫn từng phần chi tiết
- Muốn Gemini hiểu rõ từng requirement

---

## 🚀 CÁCH DÙNG BƯỚC THEO BƯỚC

### **BƯỚC 1: Chuẩn Bị**

Tạo một conversation mới với Gemini:
- Vào: https://gemini.google.com
- Click "New chat" (hoặc conversation mới)

### **BƯỚC 2: Copy Prompt**

**Chọn 1 trong 2:**

**Option A (Nhanh):**
```
1. Mở file: PROMPT_SHORT.md
2. Ctrl+A → Ctrl+C (select all, copy)
3. Dán vào Gemini chat box
4. Send
```

**Option B (Chi tiết):**
```
1. Mở file: PROMPT_FOR_GEMINI.md
2. Ctrl+A → Ctrl+C
3. Dán vào Gemini chat box
4. Send
```

### **BƯỚC 3: Gemini Phản Hồi**

Gemini sẽ:
- ✅ Hỏi lại nếu cần rõ ràng
- ✅ Hỏi về cấu trúc dự án
- ✅ Bắt đầu code các files

### **BƯỚC 4: Quản Lý Output**

Gemini sẽ code từng file:
- Backend files → Copy vào `backend/src/main/java/...`
- Frontend files → Copy vào `frontend/src/`
- Config files → Update `pom.xml`, `application.properties`, `package.json`

---

## 💡 CÁC CÂU HỎI ĐỂ HỎI GEMINI

Nếu Gemini chưa hiểu, ask:

```
"Tôi có backend Spring Boot 3.2.2 + MongoDB, 
Frontend React 19 + Vite.

Hiện tại:
- Backend có folder trống: config/, dto/, service/, util/
- Backend có TestController.java (testing only - XÓA ĐI)
- Frontend có folder trống: pages/, routes/

Tôi muốn implement:
1. User Registration + Login (JWT tokens)
2. Forgot Password with OTP Email
3. Google SSO Login
4. Protected Routes
5. Token Management

Hãy code cho tôi chính xác các file cần tạo, 
file nào xóa, dependencies nào thêm vào.

Lưu ý: Chỉ code, không cần giải thích đâu, 
vì tôi sẽ copy-paste vào project."
```

---

## 📋 CHECKLIST TRƯỚC KHI GỬI PROMPT

- [ ] Project của bạn có Spring Boot + React
- [ ] MongoDB đã cài hoặc sẵn sàng
- [ ] Bạn biết Gmail app password setup (cho OTP)
- [ ] Bạn biết Google OAuth setup (cho SSO)
- [ ] VS Code / IDE sẵn sàng để paste code

---

## 🔍 NẾU GEMINI CÓ SAI SÓT

**Nếu code lỗi, hãy:**

1. **Báo lỗi cụ thể:**
   ```
   "File AuthService.java dòng 45 có lỗi: 
   cannot resolve symbol 'userRepository'
   
   Hãy fix lại."
   ```

2. **Báo missing dependencies:**
   ```
   "Khi import io.jsonwebtoken, 
   IDE báo lỗi không tìm class.
   
   Hãy kiểm tra pom.xml có đầy đủ JWT dependencies không?"
   ```

3. **Báo missing files:**
   ```
   "AuthController.java import GoogleLoginRequest 
   nhưng file GoogleLoginRequest.java không được tạo.
   
   Hãy tạo file này."
   ```

---

## 📱 WORKFLOW COMPLETE

**Dự kiến workflow:**

```
1. Copy Prompt → Dán vào Gemini
   ↓
2. Gemini code 20+ files
   ↓
3. Copy files từ Gemini → Paste vào project
   ↓
4. Update pom.xml, package.json, application.properties
   ↓
5. Build Backend: mvn clean install
   Frontend: npm install
   ↓
6. Test Register/Login/OTP/Google SSO
   ↓
7. Done! ✅
```

**Thời gian:** ~30-60 phút (tùy Gemini speed)

---

## 🎯 EXPECTED GEMINI OUTPUT

Gemini sẽ tạo:

```
Backend Files (13 files):
- User.java
- UserRepository.java
- LoginRequest.java (+ 4 other DTOs)
- JwtUtil.java
- EmailService.java
- AuthService.java
- AuthController.java
- SecurityConfig.java
- Update pom.xml
- Update application.properties

Frontend Files (9 files):
- Login.jsx + Login.css
- Register.jsx
- ForgotPassword.jsx
- Dashboard.jsx
- Product.jsx
- authApi.js
- Update axiosClient.js
- AppRouter.jsx
- Update App.jsx
- Update package.json

Plus:
- Hướng dẫn configure Gmail
- Hướng dẫn configure Google OAuth
- Hướng dẫn test từng feature
```

---

## ⚡ TIPS ĐỂ GEMINI CODE TỐT HƠN

**Để Gemini output code sạch hơn, thêm vào prompt:**

```
"Yêu cầu thêm:
1. Code phải có comments (Vietnamese)
2. Mỗi file output riêng biệt rõ ràng
3. Copy-paste ready (no markdown code blocks nếu không cần)
4. Include tất cả imports cần thiết
5. Chỉ code, không cần giải thích)"
```

---

## 🔐 SECURITY REMINDER

**Sau khi Gemini code xong, user PHẢI:**

1. Change JWT secret key (trong `application.properties`)
   ```
   jwt.secret=CHANGE_TO_RANDOM_256_BIT_KEY_HERE
   ```

2. Setup Gmail app password (không dùng password thường)
   - https://myaccount.google.com/apppasswords

3. Setup Google OAuth Client ID
   - https://console.cloud.google.com

4. Kiểm tra CORS config chỉ cho phép localhost:5173

---

## 🎓 LEARNING POINTS

Sau khi hoàn thành:
- ✅ Bạn hiểu JWT authentication
- ✅ Bạn biết cách dùng OTP
- ✅ Bạn biết OAuth2 / SSO
- ✅ Bạn biết Spring Security
- ✅ Bạn biết protected routes

---

## 📞 SAY TỤI NẾU CẦN

Nếu Gemini code k đúng, say:

```
"Rewrite file AuthService.java:
- Phương thức register() phải kiểm tra email tồn tại
- Phương thức login() phải so sánh password với BCrypt
- Phương thức forgotPassword() phải set OTP expiration = 15 phút
- Thank you, code only."
```

---

## ✅ YOU'RE ALL SET!

**Ready để dùng Gemini code Authentication & Authorization!**

---

**Next:** 
1. Copy 1 trong 2 file prompt
2. Dán vào Gemini
3. Done! 🚀
