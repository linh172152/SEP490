# Yêu Cầu Phát Triển Backend API Bổ Sung (Role Admin)

Trong quá trình phát triển Frontend (FE) cho role `Admin` dựa vào các nghiệp vụ đề ra nhằm quản lý nền tảng chăm sóc, một số module đã có thể hoạt động tốt với các REST API hiện tại. Tuy nhiên, để hoàn thiện đồng bộ dữ liệu và bảo đảm UI hoạt động đúng chức năng 100%, Backend (BE) cần phát triển thêm một số APIs sau:

## 1. Account Management (Quản lý Tài Khoản)
Hiện tại Backend chỉ mới hỗ trợ `AuthenticationAPI` (Đăng ký, Đăng nhập). Tuy nhiên Admin cần quản lý các người dùng (Doctor, Caregiver, Elderly, Family).
* **Missing APIs:**
  - `GET /api/accounts` (Trả về danh sách Accounts kèm role)
  - `GET /api/accounts/{id}`
  - `PUT /api/accounts/{id}` (Để sửa thông tin, cập nhật role, khóa/mở khóa)
  - `DELETE /api/accounts/{id}`

> **Ghi chú FE:** Hiện tại mục "Accounts" trong Admin Dashboard đang sử dụng mock data để hiển thị.

## 2. Dashboard Statistics Overlay (Thống kê Tổng Quan)
Tại trang `/dashboard/admin` cần hiển thị thông tin thống kê real-time mà nếu FE tự gọi qua nhiều API thì sẽ tốn nhiều resource và rất nặng.
* **Missing APIs:** 
  - `GET /api/dashboard/admin/stats`
    - Trả về: `totalUsers`, `activeRobots`, `totalServicePackages`, `systemUptime`, v.v...
  
> **Ghi chú FE:** Hiện tại chỉ số Admin Dashboard được tính toán (calculate) trực tiếp ở Frontend thông qua việc fetch toàn bộ danh sách `GetAll` rồi run logic JS. Với data lớn, điều này sẽ tạo gánh nặng tải cho FE.

## 3. Robot Assignment Automation Endpoints
Hiện tại để gán một Robot cho người dùng, FE tạo request thay đổi trạng thái và `assignedElderlyId`. Việc này khá rủi ro và thiếu constraints.
* **Missing APIs (Hoặc logic cần update):**
  - `POST /api/robots/{id}/assign` (Body chứa `userId`)
  - `POST /api/robots/{id}/unassign`

## 4. Xóa Ràng Buộc Khóa Ngoại (Foreign Key Handling)
Khi thực hiện xóa (Delete) Robot hoặc Service Packages, FE thường xuyên nhận lỗi 500 do BE không có xử lý cascade delete hoặc không trả về ErrorMessage chuẩn khi item đó đang bị ràng buộc bởi `UserPackage` hoặc `RobotAssignment`.
* **Required action:** 
  - Cập nhật chuẩn hóa Response Handling khi khóa/xóa các Service Package/Robot đang có người sử dụng. Trả về mã lỗi 400 Bad Request kèm theo thông báo rõ ràng: *"Không thể xóa gói dịch vụ đang được sử dụng"*.

## 6. Profile Management (Quản lý Hồ Sơ Cá Nhân)
Để người dùng có thể tự xem và cập nhật thông tin cá nhân của mình trong trang Settings.
* **Missing APIs:**
  - `GET /api/me`: Trả về thông tin chi tiết của tài khoản đang đăng nhập (dựa trên Token). 
    - Response: `{ id, fullName, email, phone, gender, role, createdAt }`
  - `PUT /api/profile`: Cập nhật thông tin cơ bản.
    - Request Body: `{ fullName, phone, gender }`

> **Ghi chú FE:** Hiện tại thông tin này đang được lấy từ `authStore` khi login, nhưng cần một Endpoint độc lập để refresh dữ liệu sau khi cập nhật.

## 7. Security & Password (Bảo Mật & Mật Khẩu)
* **Missing APIs:**
  - `POST /api/auth/change-password`: Thực hiện đổi mật khẩu cho người dùng hiện tại (đã có logic trong `AuthenticationService` nhưng thiếu Endpoint trong `AuthenticationAPI`).
    - Request Body: `{ currentPassword, newPassword, confirmPassword }`

---
## 8. CRITICAL BUG: NullPointerException in SystemLog Mapping
Hiện tại API `GET /api/system-logs` đang trả về lỗi **400 Bad Request** khi gặp bản ghi không có thông tin Account liên kết.
* **Error Message:** `Cannot invoke "org.example.entity.Account.getId()" because the return value of "org.example.entity.SystemLog.getAccount()" is null`
* **Nguyên nhân:** Trong file `SystemLogService.java`, hàm `mapToResponse` đang gọi `log.getAccount().getId()` mà không check null.
* **Yêu cầu:** Bổ sung kiểm tra null hoặc sử dụng `Optional` để xử lý trường hợp log không có account (có thể hiển thị ID mặc định hoặc bỏ qua).

---
Mong team Backend cập nhật sớm để phía Frontend có thể loại bỏ mock data!
