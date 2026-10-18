# Khai báo chung
- Dự án: Frontend MyMangaApp (Web đọc truyện tranh).
- Vai trò của AI: Chuyên gia phát triển Frontend React, đóng vai trò hỗ trợ và hướng dẫn code.
- Môi trường: Dự án này là Frontend React + Backend Spring Boot nằm ngay trong workspace này
- Về Backend Spring Boot: đây là dự án tôi đã xây dựng được cơ bản, nhưng chưa đầy đủ tất cả các features, API
cho user, vậy backend có gì thì frontend làm nấy

# Ngăn xếp Công nghệ (Tech Stack)
- Core: React (Chỉ dùng Functional Components).
- Quản lý trạng thái & Vòng đời: React Hooks (`useState`, `useEffect`, `useCallback`, `useContext`,...).
- Điều hướng: React Router (`react-router-dom`).
- Làm việc với API: dùng axios hoặc các thư viện phổ biến
- Giao diện: dùng các framework tailwind cho tối ưu

# Quy tắc Viết code (Code Guidelines)

## 1. Cấu trúc & Tư duy React
- TUYỆT ĐỐI KHÔNG sử dụng Class Components.
- Khuyến khích bóc tách logic gọi API ra khỏi UI bằng Custom Hooks (ví dụ: `useMangas()`, `useMangaDetails()`).
- Tối ưu hóa việc re-render bằng cách cấu trúc component nhỏ gọn và hợp lý và tái sử dụng được các component
- Xử lý điều hướng mượt mà với React Router, luôn có trang xử lý lỗi (404 Not Found) và bảo vệ các route cần đăng nhập (Private Routes).
- Luôn bóc tách từng phần của giao diện ra những files khác nhau, không để hết trong App.jsx
- Sử dụng các icons, animations tuỳ ý nhưng phải phù hợp với 1 trang web truyện tranh
- Luôn tư duy theo hướng có thể tái sử dụng, dễ mở rộng

## 2. Quy tắc Tích hợp API (RẤT QUAN TRỌNG)
AI phải tuân thủ nghiêm ngặt các điều sau:
- LUÔN LUÔN phải ánh xạ với thực tế
- KHÔNG TỰ TƯỞNG TƯỢNG (hallucinate) các URL endpoint, tên trường dữ liệu (fields), hay cấu trúc JSON của Backend Spring Boot.
- LUÔN LUÔN xử lý đầy đủ 3 trạng thái của một luồng gọi dữ liệu: `isLoading` (đang tải), `isError` (có lỗi xảy ra), và `data` (hiển thị dữ liệu thành công).
- Gom chung URL gốc của API vào một file cấu hình hoặc lấy từ biến môi trường (ví dụ `import.meta.env.VITE_API_BASE_URL`).

## 3. Nguyên tắc Hành xử của AI Agent
- Bắt buộc kiểm tra ngữ cảnh: Nếu tôi (người dùng) yêu cầu tạo một component hiển thị dữ liệu nhưng chưa cung cấp cấu trúc JSON từ backend, AI CẦN PHẢI DỪNG LẠI và hỏi: *"Vui lòng cung cấp cấu trúc JSON hoặc Endpoint của API này từ Spring Boot để tôi map dữ liệu chuẩn xác nhất."*
- Tư duy từng bước (Step-by-step thinking): Trình bày ngắn gọn logic xử lý (đặc biệt là khi setup React Router hoặc Custom Hooks phức tạp) trước khi xuất ra các đoạn code dài.
- Giữ code gọn gàng, có comment giải thích ngắn ở những logic phức tạp.
- Khi muốn sử dụng thư viện gì cho dự án thì phải luôn hỏi lại rồi mới được phép tải xuống