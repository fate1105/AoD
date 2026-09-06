# 🕵️ Art of Deduction — Trình Thám Tử Suy Luận (Sherlockian Mystery Engine)

> **"Loại bỏ tất cả những gì không thể, thì những gì còn lại, dù khó tin đến đâu, vẫn phải là sự thật."**  
> — *Sherlock Holmes (Arthur Conan Doyle)*

**Art of Deduction** là trò chơi trinh thám suy luận offline thuần **Vanilla JavaScript & CSS** (0 dependencies), tái hiện chân thực phương pháp tư duy quan sát vi mô, lập luận logic và thẩm vấn tâm lý kinh điển của Thám tử Sherlock Holmes trên nền đồ họa bàn làm việc trinh thám London thế kỷ 19.

---

## 📑 MỤC LỤC
1. [Điểm Nổi Bật & Triết Lý Thiết Kế](#-điểm-nổi-bật--triết-lý-thiết-kế)
2. [Giao Diện Bàn Điều Tra & Thẩm Mỹ Victorian (UI/UX)](#-giao-diện-bàn-điều-tra--thẩm-mỹ-victorian-uiux)
3. [Cơ Chế Gameplay Toàn Diện (10 Core Pillars)](#-cơ-chế-gameplay-toàn-diện-10-core-pillars)
4. [Hồ Sơ Vụ Án Đang Khả Dụng](#-hồ-sơ-vụ-án-đang-khả-dụng)
5. [Cấu Trúc Dự Án & Vai Trò](#-cấu-trúc-dự-án--vai-trò)
6. [Kiến Trúc Dữ Liệu Vụ Án Chuẩn Hóa (`Schema Reference`)](#-kiến-trúc-dữ-liệu-vụ-án-chuẩn-hóa-schema-reference)
7. [Hệ Thống Âm Thanh Victorian WebAudio API](#-hệ-thống-âm-thanh-victorian-webaudio-api)
8. [Hệ Thống Kiểm Thử Tự Động (`Smoke Test` & `Full Audit`)](#-hệ-thống-kiểm-thử-tự-động-smoke-test--full-audit)
9. [Hướng Dẫn Cài Đặt & Trải Nghiệm](#-hướng-dẫn-cài-đặt--trải-nghiệm)
10. [Hướng Dẫn Thiết Kế & Nhân Bản Vụ Án Mới](#-hướng-dẫn-thiết-kế--nhân-bản-vụ-án-mới)

---

## 🌟 ĐIỂM NỔI BẬT & TRIẾT LÝ THIẾT KẾ

* **Không Đoán Mò (Anti-Guessing Engine)**: Mọi hành động chọn sai (đối chất sai, suy luận sai trong Lâu đài tư duy, nghi vấn sai lầm, spam nối dây) đều phải trả giá bằng điểm số, thời gian quý báu hoặc khóa vĩnh viễn nhánh suy luận.
* **Xáo Trộn Trục Thời Gian (Anti-Sequential Timeline)**: Các thẻ sự kiện chưa gán được xáo trộn ngẫu nhiên (`shuffleArray`), ngăn chặn triệt để việc nhìn theo thứ tự tuần tự từ trên xuống dưới. Mốc thời gian trước khi giải đố chỉ mô tả sự kiện quan sát khách quan, không spoil hành vi phạm tội.
* **Phân Tích Bảng Ghim 5 Quan Hệ (Corkboard 5-Relation Synthesis)**: Hỗ trợ 5 loại liên kết logic (*Hỗ trợ `supports`, Bác bỏ `contradicts`, Loại trừ `eliminates`, Giải thích `explains`, Củng cố `corroborates`*). Có modal tra cứu toàn bộ danh sách mối liên hệ đã xác lập và cơ chế chống lặp điểm tuyệt đối.
* **Đối Chất Mâu Thuẫn Từng Mệnh Đề (Split-Screen Statement vs Evidence)**: Người chơi trực tiếp bấm chọn câu nói dối cụ thể trong lời khai nghi phạm và chọn vật chứng phản bác để bẻ gãy sơ hở. Có bộ đệm cooldown 1.2s chống bấm spam và cập nhật trạng thái `✓ ĐÃ HỎI` realtime.
* **Đọc Vị Phân Tầng Độ Sâu (`confidence`)**: Soi diện mạo nhân vật phân biệt 3 tầng tư duy: *Sâu sắc `high` (+5đ)*, *Bề mặt `medium` (+2đ)*, *Thiếu căn cứ `low` (+0đ)*.
* **Cơ Chế Khẩn Cầu Gia Hạn Điều Tra (Borrow Time / Overtime)**: Khi cạn thời gian, người chơi có thể vay thêm `+15 phút` (phạt `-8 điểm Uy Tín`, tối đa 2 lần). Nút vay thời gian phát sáng viền vàng (`emergencyPulse`) chỉ xuất hiện trong vùng nguy hiểm ($\le 25\%$).
* **Giao Diện Buộc Tội Nổi Bật & Ghi Nhớ Tiến Trình**: Khi chọn phương án Buộc Tội (WHO, HOW, WHY), lựa chọn được viền vàng nổi bật (`.sel`), các phương án khác mờ đi (`.dimmed`). Khi quay lại điều tra, hệ thống ghi nhớ đúng bước đang chọn dở (`state.accusationStep`).
* **Chế Độ Chỉ Xem Khi Cạn Giờ (View-Only Mode)**: Khi thời gian về `0 phút`, game khóa toàn bộ các hành động tương tác khám xét/đối chất/nối dây sai, chỉ cho phép tra cứu lại các dữ liệu đã thu thập để bước vào Buộc Tội.
* **100% Offline & Zero Dependencies**: Chạy trực tiếp trên mọi trình duyệt web hiện đại, âm thanh tổng hợp thời gian thực bằng `Web Audio API`.

---

## 🏛️ GIAO DIỆN BÀN ĐIỀU TRA & THẨM MỸ VICTORIAN (UI/UX)

Giao diện được thiết kế theo chủ đề Bàn Làm Việc Trinh Thám Cổ Điển Scotland Yard:

1. **Tủ Tra Cứu Hồ Sơ Mật (Dossier Cabinet - Zero Scroll)**:
   - Thẻ hồ sơ bìa giấy Kraft Manila viền vàng hổ phách, hiển thị số sao, cấp bậc và con dấu kỷ lục mạ vàng (`RECORD 97/100 · BẬC THẦY`).
   - Huy hiệu danh hiệu thu gọn với hệ thống tooltip giấy da cổ điển (`data-tooltip`) khi hover.
   - Nút sáp niêm phong đỏ hoàng gia: Vào thẳng hiện trường vụ án chỉ bằng một cú nhấp chuột.
2. **Hiện Trường Khám Xét & Thẻ Vật Chứng Thống Nhất (`.evidence-unified-card`)**:
   - Thẻ địa điểm có thanh tiến độ thu thập vật chứng trực quan.
   - Gộp dòng tiêu đề vật chứng và nội dung báo cáo pháp y/lời khai chi tiết thành 1 khối thẻ liền mạch, sang trọng.
3. **Phòng Thẩm Vấn Scotland Yard (Chamber of Interrogation)**:
   - Bố cục 3 tầng khoa học:
     - 🥇 **Tầng 1**: Thanh đo tâm lý (`Psychological Truth Meter`), Soi diện mạo, Đặt nghi vấn sơ bộ.
     - 🥈 **Tầng 2**: Vật chứng & Lời khai ban đầu thu thập từ đối tượng.
     - 🥉 **Tầng 3**: Danh sách câu hỏi thẩm vấn & vạch trần mâu thuẫn (`[Q1]`, `[Q2]`, `[Q3]`...).
4. **Tủ Trưng Bày Huân Chương & Danh Hiệu (Victorian Medal Showcase)**:
   - Màn hình kết cục tự động ẩn thanh công cụ điều tra thừa thãi.
   - Huân chương đồng đúc mạ vàng 3D hiển thị theo dạng lưới ô thẻ nhung viền vàng lộng lẫy.
   - Con dấu đỏ mộc Scotland Yard `★ CASE CLOSED ★` khi phá án thành công.

---

## 🎮 CƠ CHẾ GAMEPLAY TOÀN DIỆN (10 CORE PILLARS)

```
                       ┌────────────────────────────────────────┐
                       │   KHÁM XÉT HIỆN TRƯỜNG & VẬT CHỨNG     │
                       └───────────────────┬────────────────────┘
                                           │
              ┌────────────────────────────┴────────────────────────────┐
              ▼                                                         ▼
 ┌─────────────────────────┐                               ┌─────────────────────────┐
 │ SOI DIỆN MẠO & ĐỌC VỊ   │                               │  ĐỐI CHẤT SONG SONG     │
 │ (High/Med/Low Confidence│                               │  (Statement vs Evidence)│
 └────────────┬────────────┘                               └────────────┬────────────┘
              │                                                         │
              └────────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
                       ┌────────────────────────────────────────┐
                       │ ⏱️ PHỤC DỰNG TRỤC THỜI GIAN            │
                       │ (Random Shuffled Reconstruction Board) │
                       └───────────────────┬────────────────────┘
                                           │
                                           ▼
                       ┌────────────────────────────────────────┐
                       │ ⚖️ NGHI VẤN SƠ BỘ & CẢNH GIÁC         │
                       │ (Suspect Guard -50% Impact)            │
                       └───────────────────┬────────────────────┘
                                           │
                                           ▼
                       ┌────────────────────────────────────────┐
                       │ BẢNG GHIM & TỔNG HỢP 5 LOẠI QUAN HỆ    │
                       │ (5-Relation Corkboard Synthesis)       │
                       └───────────────────┬────────────────────┘
                                           │
                                           ▼
                       ┌────────────────────────────────────────┐
                       │ 🧠 LÂU ĐÀI TƯ DUY (MIND PALACE)        │
                       │ (Choice Locking & Red Herring Trap)    │
                       └───────────────────┬────────────────────┘
                                           │
                                           ▼
                       ┌────────────────────────────────────────┐
                       │ ⏱️ GIA HẠN ĐIỀU TRA (BORROW TIME)      │
                       │ (+15 Phút, Phạt -8đ, Tối đa 2 lần)     │
                       └───────────────────┬────────────────────┘
                                           │
                                           ▼
                       ┌────────────────────────────────────────┐
                       │ LOẠI TRỪ & BUỘC TỘI 3 CHIỀU            │
                       │ (Who - How - Why & Điều kiện mở khóa)  │
                       └───────────────────┬────────────────────┘
                                           │
                                           ▼
                       ┌────────────────────────────────────────┐
                       │ BẢNG CHỈ SỐ HOLMES INDEX TỔNG KẾT      │
                       └────────────────────────────────────────┘
```

### 1. Khám Xét Hiện Trường & Quản Lý Thời Gian
* Mỗi vụ án cung cấp một **Quỹ thời gian điều tra** (`timeBudget`: Case 01 = 75 phút, Case 02 = 85 phút).
* Mỗi vật chứng kiểm tra tiêu tốn từ 5 - 10 phút.
* **Manh mối hết hạn (`expiresAt`)**: Một số dấu vết sinh học/hiện trường dễ bị mất theo thời gian (vd: mùi nước hoa, vết bùn). Banner cảnh báo sẽ hiển thị khi sắp hết hạn.

### 2. Soi Diện Mạo & Đọc Vị Nhân Vật (Suspect Profiling)
* Quan sát các đặc điểm ngoại hình, trang phục, biểu cảm của nghi phạm.
* Lựa chọn kết luận suy đoán:
  - **Sâu sắc (`high`)**: Thưởng **+5 điểm**, giảm 10% độ tin cậy đối tượng.
  - **Bề mặt (`medium`)**: Thưởng **+2 điểm**.
  - **Thiếu căn cứ (`low`)**: **+0 điểm**.

### 3. Thẩm Vấn & Đối Chất Song Song (Statement Contradiction)
* Mỗi nghi phạm có hệ thống câu hỏi thẩm vấn nhiều nhánh.
* Khi phát hiện nghi phạm khai man, mở modal **Vạch trần mâu thuẫn**:
  - Chọn chính xác **câu nói dối** trong lời khai.
  - Chọn chính xác **vật chứng** phản bác câu nói đó.
  - *Thành công*: Bẻ gãy mâu thuẫn, làm sụp đổ độ tin cậy của nghi phạm và mở khóa manh mối mới.
  - *Thất bại*: Bị phạt trừ **5 phút** điều tra và áp dụng cooldown 1.2s chống bấm bừa.

### 4. Phục Dựng Trục Thời Gian (Timeline Reconstruction)
* Xếp các sự kiện diễn ra trong vụ án vào đúng các mốc giờ trên trục thời gian.
* Các thẻ sự kiện được **xáo trộn ngẫu nhiên** để người chơi phải suy luận thời điểm dựa vào chứng cứ và lời khai nhân chứng thay vì đoán theo thứ tự.
* Đặt sai vị trí bị phạt **-2 phút** cho mỗi lần thử lại.

### 5. Đặt Nghi Vấn Sơ Bộ (Provisional Suspicion)
* Người chơi có thể công khai nghi vấn 1 đối tượng duy nhất trước khi bước vào phán quyết cuối cùng.
* **Đúng (là hung thủ)**: Thưởng **+15 điểm**, khiến đối tượng hoảng loạn giảm 20% độ tin cậy.
* **Sai (người vô tội)**: Phạt **-15 điểm**, tốn 10 phút quý giá và đối tượng rơi vào trạng thái **Cảnh Giác Cao Độ (Suspect Guard)**, giảm 50% sát thương tâm lý khi đối chất.

### 6. Bảng Ghim Suy Luận & Tổng Hợp 5 Mối Quan Hệ (Corkboard Synthesis)
* Cho phép chọn 2 manh mối bất kỳ và xác lập mối liên hệ logic giữa chúng:
  1. 🟢 **Hỗ trợ (`supports`)**
  2. 🔴 **Bác bỏ (`contradicts`)**
  3. 🟣 **Loại trừ (`eliminates`)**
  4. 🟡 **Giải thích (`explains`)**
  5. 🔵 **Củng cố (`corroborates`)**
* Xác lập chính xác liên kết thưởng **+3 đến +5 điểm**; chọn sai bị phạt **-2 phút**.

### 7. Lâu Đài Tư Duy (Mind Palace Graph)
* Kết nối chuỗi suy luận logic nhiều tầng để giải mã bí ẩn then chốt.
* **Khóa lựa chọn (`locked`)**: Một khi đã chọn nhánh suy luận sai, nhánh đó bị khóa vĩnh viễn kèm án phạt **-10 điểm và -5 phút**, không thể thử lại.

### 8. Lệnh Khẩn Cấp Gia Hạn Thời Gian (Borrow Time / Overtime)
* Khi thời gian rơi vào vùng báo động ($\le 25\%$), xuất hiện nút gia hạn khẩn cấp `+15 phút`.
* Mỗi lần gia hạn bị phạt **-8 điểm Uy Tín** vào Bảng điểm Holmes tổng kết (tối đa 2 lần).

### 9. Loại Trừ Nghi Phạm & Buộc Tội 3 Chiều
* Người chơi dùng chứng cứ ngoại phạm để loại trừ từng nghi phạm vô tội.
* Phán quyết cuối cùng yêu cầu trả lời đúng trọn vẹn 3 câu hỏi:
  - **WHO**: Ai là hung thủ thực sự?
  - **HOW**: Hung thủ đã thực hiện tội ác bằng phương thức nào?
  - **WHY**: Động cơ phạm tội sâu xa là gì?

### 10. Bảng Đánh Giá Chỉ Số Holmes (Holmes Index 100đ)
* Đánh giá hiệu suất phá án dựa trên 7 thang đo chuẩn xác:
  - 👁️ Quan sát & Đọc vị (`observationScore`)
  - 🔍 Thu thập vật chứng (`evidenceScore`)
  - ⚡ Bắt bẻ mâu thuẫn (`contradictionScore`)
  - ⏱️ Phục dựng thời gian (`timelineScore`)
  - 🧠 Suy luận & Mind Palace (`deductionScore`)
  - ⚖️ Phán quyết cuối cùng (`finalAccusationScore`)
  - ⏳ Hiệu quả thời gian (`timeScore`)

---

## 📂 HỒ SƠ VỤ ÁN ĐANG KHẢ DỤNG

| Mã Án | Tên Vụ Án | Độ Khó | Quỹ Thời Gian | Bối Cảnh & Tóm Tắt |
| :--- | :--- | :---: | :---: | :--- |
| **#221B-4** | **Cái Chết Tại Biệt Thự Blackwood** | 🟢 DỄ | 75 phút | Bà Eleanor Blackwood rơi từ giàn hoa nhà kính. 3 nghi phạm: Con trai nợ nần, Người làm vườn, Cháu gái thừa kế. |
| **#221B-5** | **Cái Chết Tại Thư Viện Ravenscroft** | 🟡 TRUNG BÌNH | 85 phút | Huân tước Ravenscroft bị đầu độc trong phòng kín khóa trái. Trà độc, thư đe dọa và bí mật gia tộc. |
| **#221B-6** | **Bản Nhạc Cuối Cùng** *(Sắp ra mắt)* | 🔴 KHÓ | 90 phút | Vụ án mạng tại Nhà hát Kịch Hoàng Gia London với mật mã nốt nhạc bí ẩn. |

---

## 📁 CẤU TRÚC DỰ ÁN & VAI TRÒ

```
ArtOfDeduction/
├── index.html                  # Giao diện khung và nạp tài nguyên
├── css/
│   └── style.css               # Hệ thống Style Victorian hoàn chỉnh (711 rules balanced)
├── js/
│   ├── engine.js               # Động cơ logic cốt lõi, tính điểm, timeline, mind palace
│   ├── cases.js                # Danh mục đăng ký hồ sơ các vụ án
│   ├── cases/
│   │   ├── case01_blackwood.js     # Dữ liệu Vụ án 01: Biệt thự Blackwood
│   │   ├── case02_ravenscroft.js   # Dữ liệu Vụ án 02: Thư viện Ravenscroft
│   │   ├── case03_final_melody.js  # Khung khởi tạo Vụ án 03
│   │   └── case_template.js        # File khuôn mẫu chuẩn để thiết kế vụ án mới
│   ├── ui-core.js              # Khởi tạo theme, thanh thời gian, điều hướng scene & hotkeys
│   ├── ui-modals.js            # Hệ thống modal: Hồ sơ, Sổ manh mối, Đọc vị, Đối chất, Mind Palace
│   ├── ui-timeline.js          # Hệ thống phục dựng trục thời gian (Timeline Puzzle)
│   ├── ui-board.js             # Bảng ghim Corkboard, kéo thả thẻ, dây nối SVG & phân tích 5 quan hệ
│   ├── ui-scenes.js            # Render các scene chính (Case Select, Hub, Location, Decision, Ending)
│   └── main.js                 # Điểm khởi chạy trò chơi
├── test/
│   ├── smoke_test.js           # Bộ test tự động giả lập phá án và kiểm tra rule phạt
│   └── full_audit.js           # Bộ test kiểm tra toàn diện cú pháp JS, CSS và DOM
└── README.md                   # Tài liệu hướng dẫn toàn diện
```

---

## 🔊 HỆ THỐNG ÂM THANH VICTORIAN WEBAUDIO API

Toàn bộ hiệu ứng âm thanh được tổng hợp thời gian thực thông qua `Web Audio API` (không tải file audio ngoài, phản hồi tức thì 0ms latency):

* `sound.click()`: Tiếng gõ bàn phím / công tắc cơ khí thanh thoát.
* `sound.clue()`: Tiếng chuông ngọc thu thập manh mới.
* `sound.contradict()`: Hợp âm trầm bẻ gãy mâu thuẫn nghi phạm.
* `sound.reveal()`: Tiếng mở rương giải mã bí mật.
* `sound.penalty()`: Âm cảnh báo khi chọn sai / thao tác thất bại.
* `sound.startHeartbeat()` / `sound.stopHeartbeat()`: Tiếng gõ nhịp tim đồng hồ đếm ngược dồn dập khi thời gian chạm vùng đỏ ($\le 25\%$).
* **Nút Bật / Tắt Âm Thanh (`⚙️ / 🔊`)**: Tự động lưu trạng thái vào `localStorage`.

---

## 🧪 HỆ THỐNG KIỂM THỬ TỰ ĐỘNG (`Smoke Test` & `Full Audit`)

Dự án tích hợp 2 bộ kiểm thử tự động toàn diện:

### 1. Smoke Test (Kịch Bản Gameplay & Logic Vụ Án):
```bash
node test/smoke_test.js
```
* ✅ **Schema Integrity**: Kiểm tra 100% cấu trúc Case 01 và Case 02.
* ✅ **Perfect Run Playtest**: Giả lập toàn bộ quá trình phá án đạt điểm Master tuyệt đối (97 - 100/100).
* ✅ **Anti-Guessing & Penalties**:
  - Đối chất sai: Trừ chính xác **5 phút** + cooldown 1.2s.
  - Mind Palace chọn sai: Trừ **10 điểm, trừ 5 phút** và khóa nhánh vĩnh viễn.
  - Bảng ghim nối sai: Trừ **2 phút**.
  - Timeline xếp sai: Trừ **2 phút**.
  - Vượt quá `maxHints`: Từ chối cấp gợi ý.
* ✅ **Provisional Suspicion & Suspect Guard**: Kiểm tra đặt cược trực giác đúng/sai và hiệu ứng giảm 50% độ tin cậy.
* ✅ **Profiling Confidence Scoring**: High (+5đ), Medium (+2đ), Low (+0đ).
* ✅ **Time Borrowing / Extension System**: Gia hạn +15 phút, giới hạn tối đa 2 lần, tính đúng điểm phạt `-8đ` / lần trên Holmes Index.

### 2. Full Audit (Cú Pháp JS, Cân Bằng CSS & DOM IDs):
```bash
node test/full_audit.js
```
* ✅ Kiểm tra cú pháp tất cả tệp JavaScript.
* ✅ Kiểm tra cân bằng ngoặc nhọn `{}` và khối chú thích `/* */` trong CSS.
* ✅ Kiểm tra tính toàn vẹn của các DOM ID trong `ui.js`.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & TRẢI NGHIỆM

### Chạy Trực Tiếp (Không cần cài đặt bất kỳ thư viện nào)
Chỉ cần nhấp đúp mở file **`index.html`** trên bất kỳ trình duyệt nào:
* Google Chrome, Microsoft Edge, Mozilla Firefox, Safari, Brave, Opera...

### Chạy qua Local HTTP Server (Tùy chọn)
```bash
# Sử dụng Node.js npx serve
npx serve .

# Hoặc sử dụng Python 3
python -m http.server 5500
```
Truy cập: `http://localhost:5500` hoặc `http://localhost:3000`

---

## ✍️ HƯỚNG DẪN THIẾT KẾ & NHÂN BẢN VỤ ÁN MỚI

1. Sao chép file khuôn mẫu [js/cases/case_template.js](file:///d:/Phuc/Game/ArtOfDeduction/js/cases/case_template.js) thành `js/cases/caseXX_[ten_vu_an].js`.
2. Điền đầy đủ thông tin theo 15 mục đã chú thích chi tiết trong template.
3. Đăng ký vụ án mới trong [js/cases.js](file:///d:/Phuc/Game/ArtOfDeduction/js/cases.js) và thêm thẻ `<script src="js/cases/caseXX_[ten_vu_an].js"></script>` vào [index.html](file:///d:/Phuc/Game/ArtOfDeduction/index.html).
4. Chạy `node test/smoke_test.js` để kiểm thử tự động xác thực tính tương thích của vụ án.
5. Tải lại trang web (`Ctrl + F5`) để trải nghiệm ngay vụ án mới!

---

*Phát triển với niềm đam mê tiểu thuyết trinh thám cổ điển và tư duy suy luận khoa học.* 🔍🎩🎻
