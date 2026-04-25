# IELTS Prep App - Frontend

Frontend cho ứng dụng học tiếng Anh IELTS. Xây dựng với **React + Vite**, UI kit **Chakra UI**.

## Cấu trúc thư mục

```text
ielts_app_fe/
├── public/               # File tĩnh không qua webpack/vite build
├── src/
│   ├── app/              # Cấu hình chung cho app (providers, router config)
│   ├── assets/           # Hình ảnh, icons, biến đổi styles (CSS)
│   ├── components/       # Các UI Component dùng chung (Button, Modal, Navbar, Snippets)
│   │   └── ui/           # Thư viện UI/Snippets tích hợp trực tiếp (vd: Chakra, Shadcn)
│   ├── config/           # Các biến môi trường, thông số cấu hình API
│   ├── constants/        # Các biến hằng số, thông báo lỗi, route paths
│   ├── features/         # Chứa các module/chức năng chính của ứng dụng
│   │   ├── auth/         # Tính năng đăng nhập (vd: Google OAuth)
│   │   ├── words/        # Quản lý từ vựng, tính năng Import từ file
│   │   ├── srs-review/   # Giao diện ôn tập Flashcard (cùng các nút chọn độ khó)
│   │   └── dictation/    # Giao diện nghe chép chính tả (nhập link Youtube / text)
│   ├── layouts/          # Layout bộ khung của web (MainLayout, AuthLayout)
│   ├── services/         # Nơi gọi API giao tiếp với Backend (sử dụng Axios/Fetch)
│   ├── shared/           # Utils/Hooks dùng chung toàn hệ thống
│   ├── stores/           # Global State Management (Zustand hoặc Redux)
│   ├── App.css
│   ├── index.css         # CSS gốc của ứng dụng (có thể chứa Tailwind directives)
│   └── main.jsx          # Entry point của React (Vite)
├── eslint.config.js      # Cấu hình Linter
├── package.json
└── vite.config.js        # Cấu hình Vite Builder
```

### Chú thích kiến trúc Frontend
- **Layout**: Bộ khung cho một nhóm trang (Page). Ví dụ layout có Sidebar, Header.
- **Component**: Các thành phần UI có thể tái sử dụng (Tái hiện các nút, form, table...). Trong `components/ui` thường chứa các "Snippets code mẫu" được bơm thẳng vào dự án.
- **Page**: Một màn hình có Route định tuyến, gọi tới Layout và bao bọc các Feature.
- **Feature**: Một chức năng hoàn chỉnh mang tính độc lập cao, bao gồm cả UI và API Call logic.
- **Snippets UI Component**: (Ví dụ các file như `provider.jsx` cấu hình dark-mode, `drawer.jsx` menu trượt, `tooltips.jsx` cho hover text). 

---

## Business Logic Cốt Lõi

### 1. Thuật toán Flashcard Spaced Repetition System (SRS)
Ở Frontend, tính năng SRS được thực hiện tại thư mục `features/srs-review/`.
- Frontend nhận danh sách từ vựng đến hạn ôn tập từ Backend.
- Mỗi từ vựng (Card) khi được lật, người dùng sẽ được chọn 4 đánh giá để phản hồi:
  - **AGAIN** (Lại từ đầu)
  - **HARD** (Khó)
  - **GOOD** (Tốt)
  - **EASY** (Dễ)
- Backend sẽ xử lý công thức để xếp lịch ôn tập (10 phút, 1 ngày, 3 ngày, 7 ngày, 14 ngày, 30 ngày) và Frontend nhận kết quả trả về để update thống kê tiến độ học (Study Stats & Streak) trong ngày.

### 2. Tính năng Nghe Chép Chính Tả (Dictation)
Được triển khai nhằm giúp rèn luyện phản xạ nghe.

#### Chế độ Text
- Dán văn bản dài → Backend đục lỗ các cụm từ ngữ pháp IELTS → Frontend hiển thị fill-in-the-blank.

#### Chế độ YouTube — Layout 4 Panel (`YoutubeExercise.jsx`)
Khi vào mode YouTube, trang chiếm **toàn bộ viewport** (không padding ngoài), chia thành 4 khu vực:

```
┌──────────────────────────────┬──────────────────────────┐
│  [1] YouTube iframe (55%)   │  [2] Transcript List     │
│       16:9, auto-play       │   Hiển thị đến câu hiện  │
│       Progress bar          │   tại, cuộn được, song   │
├─────────────────────────────│   ngữ EN + "— (bản dịch)"│
│  [3] Input Area             ├──────────────────────────┤
│   Textarea + Replay + Nộp   │  [4] Note Table          │
│   Feedback + Answer reveal  │   2 cột EN | VI          │
│   Keyboard hints            │   + Export CSV button    │
└─────────────────────────────┴──────────────────────────┘
```

- **Panel 1 (top-left)**: YouTube IFrame API, tự động seek+play mỗi câu, poll mỗi 30ms để dừng chính xác tại `end` timestamp.
- **Panel 2 (top-right)**: Danh sách transcript — chỉ render từ câu 0 đến `currentIdx`, tự scroll xuống cuối. Câu hiện tại được highlight viền xanh.
- **Panel 3 (bottom-left)**: Textarea nhập đáp án, scoring ≥75% từ đúng = pass. Nút Replay (Ctrl), Nộp (Enter), Câu tiếp (Enter sau khi nộp).
- **Panel 4 (bottom-right)**: Bảng ghi chú dạng Excel 2 cột (EN/VI), có thể thêm dòng, export ra file `.csv`.

#### Thư Viện Chung (Shared Library) — `InputStep.jsx`
- Khi mở tab YouTube, tự động gọi `GET /dictation/shared-library`.
- Hiển thị grid thumbnail các video đã cache, click vào là load ngay (không cần gọi YouTube API lại).
- Thumbnail lấy từ `https://img.youtube.com/vi/{videoId}/mqdefault.jpg`.
