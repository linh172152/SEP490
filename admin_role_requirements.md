# Yêu cầu Phát triển Frontend - Role Admin

**Dự án:** Robot thông minh dành cho người già ở viện dưỡng lão.

## Lưu ý Tiên Quyết
- **Ưu tiên:** Phát triển Frontend (FE) cho role `admin`.
- **Giới hạn chỉnh sửa:** 
  - KHÔNG chỉnh sửa những role khác.
  - KHÔNG chỉnh sửa thư mục `SEP-BE` (backend).
- **Tình trạng hiện tại:** FE role admin đang chưa hoàn thiện logic và nghiệp vụ, các giao diện hiện tại chỉ làm tạm để hiển thị UI. Cần được phát triển song hành để hoàn thiện cả logic nghiệp vụ.
- **Hành động yêu cầu:** Đọc file Backend (BE) và thực hiện gọi API (call API) cho role admin.

## Tổng Quan Chức Năng Dự Án (6.1 Major Features)

### FE-01: Elderly Voice Interaction
- Initiate conversation using natural voice commands 
- Receive spoken responses in simple and friendly language 
- Request daily information such as date, time, and weather 
- Receive simplified information summaries 
- Ask everyday questions via voice input 
- Receive elderly-appropriate answers 

### FE-02: Medication and Routine Reminder
- Proactive scheduled voice reminders 
- Voice-based confirmation of reminder completion 
- Caregiver schedule configuration 
- Caregiver reminder content updates

### FE-03: Emotional Interaction and Activity Guidance
- Casual companionship conversations 
- Supportive and positive verbal feedback 
- Voice-guided light activity instructions 
- Simple movement demonstrations by the robot 

### FE-04: Robot Voice Processing and Conversation Control
- Speech-to-text conversion 
- Text-to-speech generation 
- Short-term conversation context maintenance 
- Safe and elderly-appropriate response filtering 

### FE-05: Proactive Interaction and Logging
- Scheduled reminder triggering 
- Low engagement interaction initiation 
- Interaction timestamp logging 
- Basic usage data storage 

### FE-06: Caregiver Management
- Configure medication and routine schedules 
- Update reminder timing and content 
- View interaction summaries 
- Receive abnormal interaction alerts 

### FE-07: Family Member Monitoring
- View basic elderly interaction summaries 
- Receive notification alerts for abnormal interaction patterns 

### FE-08: Manager Platform Control *(Related to Admin)*
- Register and assign robots to users 
- Monitor robot status and connectivity
- Define service packages 
- Assign service packages to users 
- View aggregated usage statistics 
- Evaluate service effectiveness 

### FE-09: System Administration *(Related to Admin)*
- Manage platform configurations
- Control role-based access permissions
- Manage robot firmware and updates
- Enable or disable robot features
- Manage data storage policies
- Ensure system security and privacy compliance
