let schedulerData = JSON.parse(localStorage.getItem('schedulerData')) || [];

function saveData() {
    localStorage.setItem('schedulerData', JSON.stringify(schedulerData));
}

function addNewDay() {
    // 1. Lấy giá trị từ ô chọn ngày
    const dateInput = document.getElementById('date-picker').value;
    let displayDate = "";

    // 2. Kiểm tra xem người dùng có chọn ngày chưa
    if (dateInput) {
        // Mặc định HTML lấy ngày dạng Năm-Tháng-Ngày (VD: 2026-04-20)
        // Mình sẽ cắt nó ra và ghép lại thành dạng Việt Nam là Ngày/Tháng/Năm
        const parts = dateInput.split('-');
        displayDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    } else {
        // Nếu người dùng lười không chọn ngày mà bấm Thêm luôn, thì tự động lấy ngày hôm nay
        displayDate = new Date().toLocaleDateString('vi-VN');
    }

    // 3. LOGIC XỊN: Kiểm tra xem ngày này đã có bảng chưa?
    // Dùng hàm .some() để dò tìm trong dữ liệu
    const isExist = schedulerData.some(day => day.date === displayDate);
    if (isExist) {
        alert(`Bảng công việc cho ngày ${displayDate} đã tồn tại rồi! Bạn tìm ở bên dưới nhé.`);
        return; // Dừng hàm ngay lập tức, không tạo thêm bảng mới
    }

    // 4. Nếu mọi thứ OK, tạo bảng mới và nhét lên đầu danh sách
    schedulerData.unshift({ date: displayDate, tasks: [] }); 
    saveData();     
    renderBoards(); 
}

function addTask(dayIndex) {
    schedulerData[dayIndex].tasks.push({ content: "", progress: 0, isDone: false });
    saveData();     
    renderBoards(); 
}

function updateTask(dayIndex, taskIndex, field, value) {
    schedulerData[dayIndex].tasks[taskIndex][field] = value;
    
    if(field === 'progress') {
        schedulerData[dayIndex].tasks[taskIndex].isDone = (value == 100);
    }
    if(field === 'isDone') {
         schedulerData[dayIndex].tasks[taskIndex].progress = value ? 100 : 0;
    }

    saveData();     
    renderBoards(); 
}

/* =========================================================================
   [MỚI] THÊM HÀM XÓA NGÀY VÀ XÓA CÔNG VIỆC
   ========================================================================= */

// Hàm xóa một ngày
function deleteDay(dayIndex) {
    // confirm(): Bật lên một hộp thoại hỏi người dùng cho chắc ăn
    if(confirm("Bạn có chắc chắn muốn xóa TOÀN BỘ ngày này không?")) {
        schedulerData.splice(dayIndex, 1); // Xóa 1 phần tử tại vị trí dayIndex
        saveData();
        renderBoards();
    }
}

// Hàm xóa một công việc cụ thể
function deleteTask(dayIndex, taskIndex) {
    if(confirm("Xóa công việc này?")) {
        schedulerData[dayIndex].tasks.splice(taskIndex, 1); // Chui vào tasks và xóa
        saveData();
        renderBoards();
    }
}

/* ========================================================================= */

function renderBoards() {
    schedulerData.sort((a, b) => {
        // Chuyển "18/04/2026" thành "2026-04-18" để máy tính so sánh được
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        
        // Trả về kết quả so sánh (Sắp xếp tăng dần: Ngày gần nhất hiện lên trước)
        return dateA - dateB; 
    });

    const container = document.getElementById('boards-area');
    container.innerHTML = ''; 

    schedulerData.forEach((day, dayIndex) => {
        let rowsHtml = ''; 

        day.tasks.forEach((task, taskIndex) => {
            rowsHtml += `
                <tr>
                    <td>${taskIndex + 1}</td>
                    <td>
                        <input type="text" value="${task.content}" 
                        onchange="updateTask(${dayIndex}, ${taskIndex}, 'content', this.value)" 
                        placeholder="Nhập tên công việc...">
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            
                            <input type="range" min="0" max="100" value="${task.progress}" 
                            id="slider-${dayIndex}-${taskIndex}"
                            style="flex-grow: 1; --val: ${task.progress}%;"
                            oninput="this.style.setProperty('--val', this.value + '%'); document.getElementById('span-${dayIndex}-${taskIndex}').innerText = this.value + '%';" 
                            onchange="updateTask(${dayIndex}, ${taskIndex}, 'progress', this.value)">
                            
                            <span id="span-${dayIndex}-${taskIndex}" style="width: 40px; font-weight: bold;">${task.progress}%</span>
                        </div>
                    </td>
                    <td style="text-align:center;">
                        <input type="checkbox" ${task.isDone ? 'checked' : ''} 
                        onchange="updateTask(${dayIndex}, ${taskIndex}, 'isDone', this.checked)">
                    </td>
                    <td style="text-align:center;">
                        <button class="btn-delete" onclick="deleteTask(${dayIndex}, ${taskIndex})">Xóa</button>
                    </td>
                </tr>
            `;
        });

        // [MỚI] Cập nhật lại phần Đầu Bảng: Thêm nút Xóa Ngày và Thêm Cột "Thao tác"
        container.innerHTML += `
            <div class="day-container">
                <h2>Ngày: ${day.date}</h2>
                
                <div class="day-header-actions">
                    <button class="btn-add-task" onclick="addTask(${dayIndex})">+ Thêm Công Việc</button>
                    <button class="btn-delete" onclick="deleteDay(${dayIndex})">Xóa Ngày Này</button>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 5%">STT</th>
                            <th style="width: 45%">Nội dung công việc</th>
                            <th style="width: 30%">Tiến độ</th>
                            <th style="width: 10%">Hoàn thành</th>
                            <th style="width: 10%">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml} 
                    </tbody>
                </table>
            </div>
        `;
    });
}

renderBoards();
const themeBtn = document.getElementById('theme-btn');

// 1. Vừa mở web lên, kiểm tra xem lần trước người dùng đang xài màu gì
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme'); // Mặc áo tối vào
    themeBtn.innerText = '☀️ Light Mode'; // Đổi chữ gợi ý bấm về màu sáng Mode
}

// 2. Hàm thực thi khi bấm nút đổi giao diện Toggle Theme
function toggleTheme() {
    // toggle(): Nếu thẻ body chưa có class 'dark-theme' thì gắn vào, nếu có rồi thì gỡ ra
    document.body.classList.toggle('dark-theme');
    
    // Kiểm tra xem áo tối đang được mặc hay đã cởi Mode Mode dark-theme
    const isDark = document.body.classList.contains('dark-theme');
    
    // Ghi nhớ lại lựa chọn bằng localStorage update localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light'); 
    
    // Đổi chữ trên nút để gợi ý Mode sáng tối Mode
    themeBtn.innerText = isDark ? '☀️ Light Mode' : '🌙 Dark Mode'; 
}