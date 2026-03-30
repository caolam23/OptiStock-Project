# Hướng dẫn Template Nhập Sản Phẩm OptiStock

## Cấu trúc Template Chính Xác

Template nhập sản phẩm phải có **9 cột** theo đúng thứ tự dưới đây:

### Header (Dòng 1):

| Cột | Tên Header | Loại Dữ Liệu | Bắt Buộc | Ghi Chú |
|-----|-----------|--------------|---------|---------|
| A | **Mã SKU** | Text | ✓ Có | Không được để trống |
| B | **Tên sản phẩm** | Text | ✓ Có | Không được để trống |
| C | **Danh mục** | Text | | Có thể để trống |
| D | **Giá bán** | Số | ✓ Có | Phải > 0, không được để trống |
| E | **Giá vốn** | Số | | Tùy chọn, có thể trống |
| F | **Đơn vị** | Text | | Mặc định: "Cái" nếu trống |
| G | **Tồn kho tối thiểu** | Số nguyên | | Mặc định: 0 nếu trống |
| H | **Tồn kho tối đa** | Số nguyên | | Mặc định: 1000 nếu trống |
| I | **Nhà cung cấp** | Text | | Tùy chọn |

## Ví dụ Dữ Liệu Đúng:

```
Mã SKU      | Tên sản phẩm      | Danh mục      | Giá bán    | Giá vốn   | Đơn vị | Tồn kho tối thiểu | Tồn kho tối đa | Nhà cung cấp
---|---|---|---|---|---|---|---|---
SKU-001     | Điện thoại         | Điện tử      | 10000000   | 6000000   | Cái    | 5                 | 50             | Samsung
SKU-002     | Nước ngọt          | Đồ uống     | 15000      | 8000      | Chai   | 20                | 100            | CocaCola
SKU-003     | Gạo                | Lương thực   | 20000      | 15000     | kg     | 10                | 200            | ABC
SKU-004     | Sữa chua           | Thực phẩm   | 25000      |           | Hộp    | 15                | 150            | Vinamilk
```

## Yêu Cầu Format:

1. **Ký tự đặc biệt**: Sử dụng tiếng Việt có dấu đầy đủ (ă, ơ, ư, ê, à, á, etc)
2. **Số liệu**: 
   - Giá bán, Giá vốn: Không cần dấu ngàn, viết liền (vd: 10000000 chứ không phải 10,000,000)
   - Tồn kho: Số nguyên dương
3. **Ô trống**: Các cột không bắt buộc có thể để trống
4. **File format**: Excel (.xlsx hoặc .xls) hoặc CSV
5. **Encoding**: UTF-8 (cho file CSV)

## Lỗi Thường Gặp:

❌ **Lỗi**: Để trống Mã SKU  
✓ **Fix**: Nhập mã SKU duy nhất cho mỗi sản phẩm

❌ **Lỗi**: Để trống Giá bán  
✓ **Fix**: Luôn nhập giá bán, phải > 0

❌ **Lỗi**: Giá bán không phải số (vd: "10.000.000" thay vì "10000000")  
✓ **Fix**: Nhập số không có dấu ngàn

❌ **Lỗi**: Tiếng Việt bị lỗi (toàn bộ ký tự kỳ lạ)  
✓ **Fix**: Đảm bảo file Excel được lưu dưới dạng UTF-8

❌ **Lỗi**: Cột không đúng thứ tự  
✓ **Fix**: Tuân thủ đúng thứ tự 9 cột như bảng trên

## Tạo File Template Trong Excel:

1. Mở Excel
2. Tạo dòng header với 9 cột:
   - A1: Mã SKU
   - B1: Tên sản phẩm
   - C1: Danh mục
   - D1: Giá bán
   - E1: Giá vốn
   - F1: Đơn vị
   - G1: Tồn kho tối thiểu
   - H1: Tồn kho tối đa
   - I1: Nhà cung cấp

3. Format header: **Đậm**, **Màu xanh** (tùy chọn)
4. Bắt đầu nhập dữ liệu từ dòng 2
5. **Lưu file dưới dạng .xlsx** (Excel 2007+)

## Quy Trình Import:

1. Chuẩn bị file Excel với đúng định dạng
2. Vào **Quản lý sản phẩm** → **Nhập từ Excel**
3. Chọn file template
4. Hệ thống sẽ hiển thị kết quả:
   - ✓ Số sản phẩm nhập thành công
   - ⚠ Số sản phẩm bỏ qua (có lỗi)
   - Chi tiết lỗi từng dòng (nếu có)

## Lưu Ý Quan Trọng:

⚠️ **Mã SKU phải duy nhất** - Nếu import SKU đã tồn tại, sẽ bị lỗi  
⚠️ **Giá bán phải > 0** - Không được nhập giá âm hoặc 0  
⚠️ **File không được trống** - Phải có ít nhất 1 dòng dữ liệu  
⚠️ **Encoding: UTF-8** - Để tránh lỗi tiếng Việt

---

**Nếu có vấn đề, hãy check lại:**
1. Số lượng cột (phải đúng 9 cột)
2. Thứ tự cột (phải theo thứ tự trên)
3. Dữ liệu các cột bắt buộc không trống
4. Định dạng số không có dấu ngàn
5. Encoding file là UTF-8
