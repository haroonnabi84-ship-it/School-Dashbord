let DB = JSON.parse(localStorage.getItem('proSchoolDB')) || { students: [], teachers: [], fees: [], attendance: {}, results: [] };
let modalType = "";

// LOGIN SYSTEM
document.getElementById('loginBtn').onclick = () => {
    let u = document.getElementById('username').value;
    let p = document.getElementById('password').value;
    if (u === 'admin' && p === '1234') {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('mainApp').style.display = 'flex';
        loadPageData('dashboard');
    } else { document.getElementById('loginError').innerText = "Wrong Username/Password" }
}
document.getElementById('logoutBtn').onclick = () => location.reload();

// NAVIGATION
document.querySelectorAll('.menu-item[data-page]').forEach(item => {
    item.onclick = () => {
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        item.classList.add('active');
        document.getElementById(item.dataset.page).classList.add('active');
        loadPageData(item.dataset.page);
    }
});

// THEME TOGGLE
document.getElementById('themeToggle').onclick = () => {
    document.body.classList.toggle('dark');
}

// MODAL
document.getElementById('openStuModal').onclick = () => openModal('student');
document.getElementById('openTeachModal').onclick = () => openModal('teacher');
function openModal(type) {
    modalType = type;
    document.getElementById('modal').style.display = 'flex';
    document.getElementById('modalTitle').innerText = 'Add ' + type;
    document.getElementById('modalBody').innerHTML = type === 'student' ?
        `<input id="m1" placeholder="Name"><input id="m2" placeholder="Roll No"><input id="m3" placeholder="Class"><input id="m4" placeholder="Phone">` :
        `<input id="m1" placeholder="Teacher Name"><input id="m2" placeholder="Subject"><input id="m3" placeholder="Phone">`;
}
document.getElementById('closeModal').onclick = () => document.getElementById('modal').style.display = 'none';
document.getElementById('modalSave').onclick = () => {
    let [n1, n2, n3, n4] = ['m1', 'm2', 'm3', 'm4'].map(id => document.getElementById(id)?.value);
    if (modalType === 'student') DB.students.push({ id: Date.now(), name: n1, roll: n2, class: n3, phone: n4, feePaid: 0 });
    if (modalType === 'teacher') DB.teachers.push({ id: Date.now(), name: n1, subject: n2, phone: n3 });
    saveDB(); loadPageData(modalType === 'student' ? 'students' : 'teachers'); document.getElementById('modal').style.display = 'none';
}

// SEARCH
document.getElementById('stuSearch').onkeyup = (e) => {
    let val = e.target.value.toLowerCase();
    document.querySelectorAll('#stuTable tr').forEach(tr => { tr.style.display = tr.innerText.toLowerCase().includes(val) ? '' : 'none'; })
}

// FEES
document.getElementById('collectFeeBtn').onclick = () => {
    let stuId = document.getElementById('feeStuSelect').value;
    let amt = Number(document.getElementById('feeAmount').value);
    let stu = DB.students.find(s => s.id == stuId);
    stu.feePaid += amt;
    DB.fees.push({ stuId, amount: amt, date: new Date().toLocaleDateString() });
    saveDB(); loadPageData('fees');
}

// RESULTS
document.getElementById('addResultBtn').onclick = () => {
    let stuId = document.getElementById('resStuSelect').value;
    let marks = document.getElementById('resMarks').value;
    let stu = DB.students.find(s => s.id == stuId);
    let grade = marks > 80 ? 'A' : marks > 60 ? 'B' : 'C';
    document.getElementById('resultCard').innerHTML = `<div class="card"><h2>Result Card</h2><p>Name: ${stu.name}</p><p>Roll: ${stu.roll}</p><p>Marks: ${marks}</p><p>Grade: ${grade}</p></div>`;
}

// LOAD DATA + CHARTS
function loadPageData(page) {
    if (page === 'dashboard') {
        document.getElementById('dashStu').innerText = DB.students.length;
        document.getElementById('dashTeach').innerText = DB.teachers.length;
        let total = DB.fees.reduce((a, b) => a + b.amount, 0);
        document.getElementById('dashFee').innerText = 'Rs ' + total;
        new Chart(document.getElementById('feeChart'), { type: 'bar', data: { labels: ['Jan', 'Feb', 'Mar'], datasets: [{ label: 'Fees', data: [total / 3, total / 2, total] }] } });
    }
    if (page === 'students') {
        document.getElementById('stuTable').innerHTML = DB.students.map(s => `<tr><td>${s.roll}</td><td>${s.name}</td><td>${s.class}</td><td>${s.phone}</td><td>${s.feePaid > 0 ? 'Paid' : 'Due'}</td><td><button onclick="delStu(${s.id})">Delete</button></td></tr>`).join('');
    }
    if (page === 'teachers') {
        document.getElementById('teachGrid').innerHTML = DB.teachers.map(t => `<div class="card"><h4>${t.name}</h4><p>${t.subject}</p></div>`).join('');
    }
    // Fill dropdowns
    let stuOptions = DB.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    document.getElementById('feeStuSelect').innerHTML = stuOptions;
    document.getElementById('resStuSelect').innerHTML = stuOptions;
    document.getElementById('attClass').innerHTML = [...new Set(DB.students.map(s => s.class))].map(c => `<option>${c}</option>`).join('');
}

function delStu(id) { DB.students = DB.students.filter(s => s.id != id); saveDB(); loadPageData('students'); }
function saveDB() { localStorage.setItem('proSchoolDB', JSON.stringify(DB)); }