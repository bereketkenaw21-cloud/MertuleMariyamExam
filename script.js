const ADMIN_PASS = "Mertule Mariyam@2026";
let questions = [];
let currentIdx = 0;
let userAnswers = {};
let timer;
let timeLeft = 3600; // 1 ሰዓት

const subIcons = {
    'English': '📖', 'Maths': '📐', 'Physics': '🔬', 'Chemistry': '🧪', 'IT': '💻',
    'Geography': '🌍', 'History': '🏛️', 'Economics': '📊'
};

function navigateTo(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function askAdminPassword() {
    if (prompt("የአድሚን ፓስወርድ ያስገቡ:") === ADMIN_PASS) navigateTo('admin-page');
    else alert("ስህተት!");
}

function enterAsStudent() { navigateTo('field-page'); }

function showSubjects(field) {
    const container = document.getElementById('subjects-container');
    container.innerHTML = "";
    document.getElementById('field-title').innerText = field === 'natural' ? "Natural Science" : "Social Science";
    
    const list = field === 'natural' ? ['English', 'Maths', 'Physics', 'Chemistry', 'IT'] : ['English', 'Maths', 'Geography', 'History', 'Economics'];
    
    list.forEach(s => {
        const btn = document.createElement('div');
        btn.className = "subject-card";
        btn.innerHTML = `<span class="subj-icon">${subIcons[s]}</span>${s}`;
        btn.onclick = () => startExam(s);
        container.appendChild(btn);
    });
    navigateTo('subject-page');
}

function startExam(subj) {
    // ናሙና ጥያቄ (በኋላ በአድሚን የሚተካ)
    questions = [{q: "ናሙና ጥያቄ 1", a: "መልስ A", b: "መልስ B", c: "መልስ C", d: "መልስ D", r: "A"}];
    currentIdx = 0;
    userAnswers = {};
    timeLeft = 3600;
    showQuestion();
    startTimer();
    navigateTo('exam-page');
}

function showQuestion() {
    const q = questions[currentIdx];
    document.getElementById('q-text').innerText = q.q;
    document.getElementById('q-status').innerText = `ጥያቄ ${currentIdx + 1}/${questions.length}`;
    
    const container = document.getElementById('options-container');
    container.innerHTML = ['a','b','c','d'].map(opt => `
        <button class="option-btn ${userAnswers[currentIdx] === opt.toUpperCase() ? 'selected' : ''}" 
        onclick="selectOpt('${opt.toUpperCase()}')">${opt.toUpperCase()}. ${q[opt]}</button>
    `).join('');

    // ወደኋላ መመለስ ህግ (እስከ 3 ጥያቄ)
    document.getElementById('prev-btn').style.visibility = (currentIdx > 0 && currentIdx < 3) ? "visible" : "hidden";
}

function selectOpt(opt) { userAnswers[currentIdx] = opt; showQuestion(); }

function moveNext() {
    if (!userAnswers[currentIdx]) return alert("እባክዎ መጀመሪያ መልስ ይምረጡ!");
    if (currentIdx < questions.length - 1) { currentIdx++; showQuestion(); }
    else { finishExam(); }
}

function movePrev() { if (currentIdx > 0) { currentIdx--; showQuestion(); } }

function startTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) { clearInterval(timer); alert("ጊዜ አልቋል!"); location.reload(); }
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        document.getElementById('timer-display').innerText = `ጊዜ: ${m}:${s < 10 ? '0' + s : s}`;
    }, 1000);
}

function finishExam() {
    clearInterval(timer);
    let score = 0;
    questions.forEach((q, i) => { if (userAnswers[i] === q.r) score++; });
    document.getElementById('score-text').innerText = `${score}/${questions.length}`;
    navigateTo('result-page');
}

function processBulk() { alert("ጥያቄዎቹ በቅደም ተከተል ተጭነዋል!"); }
function handleOCR() { alert("ፎቶው ወደ ጥያቄነት እየተቀየረ ነው..."); }
function openGlobalScanner() { alert("QR ስካነር ይከፈታል..."); }
