/* =========================================================================
   CẤU HÌNH DỮ LIỆU & LƯU TRỮ (LOCAL STORAGE)
   ========================================================================= */
let schedulerData = JSON.parse(localStorage.getItem('schedulerData')) || [];
let bookData = JSON.parse(localStorage.getItem('bookData')) || [];

// Tự động chuyển đổi dữ liệu cũ (theo ngày) sang cấu trúc mới (danh sách tổng) nếu cần
if (schedulerData.length > 0 && schedulerData[0].tasks !== undefined) {
    let newData = [];
    schedulerData.forEach(day => {
        day.tasks.forEach(task => {
            let parts = day.date.split('/');
            let formattedDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : "";
            newData.push({
                content: task.content,
                progress: task.progress,
                isDone: task.isDone,
                deadline: formattedDate
            });
        });
    });
    schedulerData = newData;
    saveData();
}

function saveData() { localStorage.setItem('schedulerData', JSON.stringify(schedulerData)); }
function saveBookData() { localStorage.setItem('bookData', JSON.stringify(bookData)); }

/* =========================================================================
   TÍNH NĂNG JOB (CÔNG VIỆC) - ĐÃ ĐƠN GIẢN HÓA
   ========================================================================= */
function addTask() {
    schedulerData.push({ content: "", deadline: "", progress: 0, isDone: false });
    saveData();     
    renderBoards(); 
}

function updateTask(index, field, value) {
    schedulerData[index][field] = value;
    if(field === 'progress') schedulerData[index].isDone = (value == 100);
    if(field === 'isDone') schedulerData[index].progress = value ? 100 : 0;
    saveData();     
    renderBoards(); 
}

function deleteTask(index) {
    if(confirm("Xóa công việc này?")) {
        schedulerData.splice(index, 1);
        saveData();
        renderBoards();
    }
}

function renderBoards() {
    const container = document.getElementById('boards-area');
    if (schedulerData.length === 0) {
        container.innerHTML = `<div class="day-container" style="text-align: center; color: #6b7280; padding: 40px;">Chưa có công việc nào.</div>`;
        return;
    }

    let rowsHtml = ''; 
    schedulerData.forEach((task, index) => {
        rowsHtml += `
            <tr>
                <td><input type="text" value="${task.content}" onchange="updateTask(${index}, 'content', this.value)" placeholder="Nhập tên công việc..."></td>
                <td><input type="date" class="date-picker" style="width: 100%;" value="${task.deadline}" onchange="updateTask(${index}, 'deadline', this.value)"></td>
                <td>
                    <div class="progress-wrapper">
                        <input type="range" min="0" max="100" value="${task.progress}" style="flex-grow: 1; --val: ${task.progress}%;"
                        oninput="this.style.setProperty('--val', this.value + '%'); document.getElementById('span-job-${index}').innerText = this.value + '%';" 
                        onchange="updateTask(${index}, 'progress', this.value)">
                        <span class="percentage-text" id="span-job-${index}">${task.progress}%</span>
                    </div>
                </td>
                <td style="text-align:center;"><input type="checkbox" ${task.isDone ? 'checked' : ''} onchange="updateTask(${index}, 'isDone', this.checked)"></td>
                <td style="text-align:center;"><button class="btn-action-delete" onclick="deleteTask(${index})">🗑️</button></td>
            </tr>`;
    });

    container.innerHTML = `
        <div class="day-container">
            <h2 style="margin-bottom: 20px;">🎯 Danh Sách Công Việc</h2>
            <table>
                <thead>
                    <tr>
                        <th style="width: 40%">Nội dung</th>
                        <th style="width: 15%; text-align: center;">Deadline</th>
                        <th style="width: 25%; text-align: center;">Tiến độ (%)</th>
                        <th style="width: 10%; text-align: center;">Xong</th>
                        <th style="width: 10%; text-align: center;">Xóa</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
            </table>
        </div>`;
}

/* =========================================================================
   TÍNH NĂNG BOOK (SÁCH) - TINH GỌN (KHÔNG LINK)
   ========================================================================= */
function addBook() {
    bookData.push({ title: "", readPages: 0, totalPages: 0, isLocked: false });
    saveBookData();
    renderBooks();
}

function updateBook(index, field, value) {
    if (field === 'totalPages' || field === 'readPages') value = parseInt(value) || 0;
    bookData[index][field] = value;
    if (field === 'readPages' && bookData[index].totalPages > 0 && bookData[index].readPages > bookData[index].totalPages) {
        bookData[index].readPages = bookData[index].totalPages;
    }
    saveBookData();
    renderBooks();
}

function toggleLockBook(index) {
    if (bookData[index].totalPages > 0) {
        bookData[index].isLocked = true;
        saveBookData();
        renderBooks();
    } else {
        alert("Vui lòng nhập tổng số trang!");
    }
}

function deleteBook(index) {
    if (confirm("Xóa cuốn sách này?")) {
        bookData.splice(index, 1);
        saveBookData();
        renderBooks();
    }
}

function syncBookProgress(index, percentage, totalPages) {
    if (totalPages === 0) return;
    const slider = document.getElementById(`book-slider-${index}`);
    slider.style.setProperty('--val', percentage + '%');
    document.getElementById(`book-percent-${index}`).innerText = percentage + '%';
    const newReadPages = Math.round((percentage / 100) * totalPages);
    document.getElementById(`read-pages-${index}`).value = newReadPages;
}

function renderBooks() {
    const container = document.getElementById('books-area');
    if (bookData.length === 0) { container.innerHTML = ''; return; }

    let rowsHtml = '';
    bookData.forEach((book, index) => {
        let percentage = book.totalPages > 0 ? Math.round((book.readPages / book.totalPages) * 100) : 0;
        rowsHtml += `
            <tr>
                <td><input type="text" value="${book.title}" onchange="updateBook(${index}, 'title', this.value)" placeholder="Tên sách..."></td>
                <td>
                    <div class="page-input-group">
                        <input type="number" id="read-pages-${index}" value="${book.readPages}" onchange="updateBook(${index}, 'readPages', this.value)" min="0">
                        <span>/</span>
                        <input type="number" value="${book.totalPages}" onchange="updateBook(${index}, 'totalPages', this.value)" min="0" ${book.isLocked ? 'disabled' : ''}>
                        <button class="btn-lock-icon ${book.isLocked ? 'locked' : ''}" onclick="${book.isLocked ? '' : `toggleLockBook(${index})`}" title="Khóa tổng trang">
                            ${book.isLocked ? '🔒' : '🔓'}
                        </button>
                    </div>
                </td>
                <td>
                    <div class="progress-wrapper">
                        <input type="range" id="book-slider-${index}" min="0" max="100" value="${percentage}" style="--val: ${percentage}%;" ${book.totalPages > 0 ? '' : 'disabled'}
                        oninput="syncBookProgress(${index}, this.value, ${book.totalPages})"
                        onchange="updateBook(${index}, 'readPages', document.getElementById('read-pages-${index}').value)">
                        <span class="percentage-text" id="book-percent-${index}">${percentage}%</span>
                    </div>
                </td>
                <td style="text-align:center;"><button class="btn-action-delete" onclick="deleteBook(${index})">🗑️</button></td>
            </tr>`;
    });

    container.innerHTML = `
        <div class="book-container day-container">
            <h3 style="margin-bottom: 15px;">📚 Sách Đang Đọc</h3>
            <table>
                <thead>
                    <tr>
                        <th style="width: 40%">Tên sách</th>
                        <th style="width: 25%; text-align: center;">Trang đã đọc / Tổng</th>
                        <th style="width: 25%; text-align: center;">Tiến độ (%)</th>
                        <th style="width: 10%; text-align: center;">Xóa</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
            </table>
        </div>`;
}

/* =========================================================================
   GIAO DIỆN & ĐIỀU HƯỚNG
   ========================================================================= */
// --- QUẢN LÝ ĐA THEME ---
const currentTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-theme', currentTheme);

const themeSelect = document.getElementById('theme-select');
if (themeSelect) {
    themeSelect.value = currentTheme;
}

function changeTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

function switchView(viewName) {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('boards-area').style.display = viewName === 'job' ? 'block' : 'none';
    document.getElementById('books-area').style.display = viewName === 'book' ? 'block' : 'none';
    document.getElementById('job-actions').style.display = viewName === 'job' ? 'flex' : 'none';
    document.getElementById('book-actions').style.display = viewName === 'book' ? 'flex' : 'none';
    document.getElementById('nav-job').className = viewName === 'job' ? 'active' : '';
    document.getElementById('nav-book').className = viewName === 'book' ? 'active' : '';
    document.getElementById('page-title').innerText = viewName === 'job' ? "Project & Task Scheduler" : "Book Reading Tracker";
    viewName === 'job' ? renderBoards() : renderBooks();
}

// Khởi chạy mặc định
renderBoards();
renderBooks();