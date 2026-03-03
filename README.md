**client/
├── src/
│   ├── assets/           # Hình ảnh, icons, styles chung
│   ├── components/       # Các UI Component dùng chung (Button, Modal, Navbar)
│   ├── features/         # Chứa các module chức năng chính
│   │   ├── auth/         # LoginPage bằng Google
│   │   ├── words/        # Component import Excel, danh sách từ
│   │   └── srs-review/   # Giao diện flashcard, các nút đánh giá (Dễ, Khó...)
│   ├── hooks/            # Custom hooks (vd: useAuth, useSRS)
│   ├── layouts/          # Layout chính của web (MainLayout, AuthLayout)
│   ├── pages/            # Chứa các trang kết nối components lại
│   │   ├── Dashboard.jsx # Hiển thị số từ cần ôn tập hôm nay
│   │   ├── StudyPage.jsx     # Trang thực hành SRS
│   │   └── Import.jsx    # Trang upload file
│   ├── services/         # Cấu hình Axios, định nghĩa các API calls
│   │   └── api.js
│   ├── store/            # Global state (Zustand/Redux)
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js        # Giả sử bạn dùng Vite

Layout là 1 bộ khung cho 1 nhóm page
Component là các thành phần UI có the dùng lại
Page là một màn hình có route, sẽ gọi tới layout hoặc gọi thẳng vào feature
Feature là 1 chức nang hoàn chỉnh.(có cả UI và gọi api, trong feature sẽ là UI nhiều nhat)

----------------------------------------------------------------------------------------------------------------------**
Những file trọng components/ui được gọi là Snippets code mẫu. Bơm thẳng mã nguồn source code các component nen tảng vào 
thẳng dự án. 
-provider.jsx: Trái tim của hệ thống theme, khởi tạo chakra va tích hợp chung với dark mode. 
-color-mode.jsx: Chứa logic tắt bật của icon dark-mode
-drawer.jsx: Là khung Menu trượt từ cạnh màn hình bật mở cái sidebar
-close-button.jsx: Nút X góc trên cùng.
-tooltips.jsx: Cấu hình cho nhãn hien ra khi hover vài một icon
