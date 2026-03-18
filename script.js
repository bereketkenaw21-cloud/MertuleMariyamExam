// --- የቀድሞው መሠረታዊ ተለዋዋጮች ---
const ADMIN_PASS = "Mertule Mariyam@2026";
let questions = [];
let currentIdx = 0;
let userAnswers = {};
let timer;
let timeLeft = 3600;
let isAdminMode = false; // አድሚን መሆኑን መለያ
let selectedSubj = "";   // የተመረጠው ሳብጀክት

const subIcons = {
    'English': '📖', 'Maths': '📐', 'Physics': '🔬', 'Chemistry': '🧪', 'IT': '💻',
    'Geography': '🌍', 'History': '🏛️', 'Economics': '📊'
};

// --- ገጽ መቀያየሪያ ---
function navigateTo(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// --- የአድሚንና ተማሪ መግቢያ ---
function askAdminPassword() {
    if (prompt("የአድሚን ፓስወርድ ያስገቡ:") === ADMIN_PASS) {
        isAdminMode = true;
        navigateTo('field-page');
    } else {
        alert("ስህተት!");
    }
}

function enterAsStudent() {
    isAdminMode = false;
    navigateTo('field-page');
}

// --- ሳብጀክት ማሳያ (አድሚን ከሆነ ወደ መጫኛ፣ ተማሪ ከሆነ ወደ ፈተና) ---
function showSubjects(field) {
    const container = document.getElementById('subjects-container');
    container.innerHTML = "";
    document.getElementById('field-title').innerText = field === 'natural' ? "Natural Science" : "Social Science";
    
    const list = field === 'natural' ? ['English', 'Maths', 'Physics', 'Chemistry', 'IT'] : ['English', 'Maths', 'Geography', 'History', 'Economics'];
    
    list.forEach(s => {
        const btn = document.createElement('div');
        btn.className = "subject-card";
        btn.innerHTML = `<span class="subj-icon">${subIcons[s]}</span>${s}`;
        btn.onclick = () => handleSubjectSelection(s);
        container.appendChild(btn);
    });
    navigateTo('subject-page');
}

function handleSubjectSelection(subj) {
    selectedSubj = subj;
    if (isAdminMode) {
        document.getElementById('admin-sub-title').innerText = subj + " ጥያቄ መጫኛ";
        navigateTo('admin-page');
    } else {
        startExam(subj);
    }
}

// --- ፈተና መጀመሪያ ---
function startExam(subj) {
    // ከ LocalStorage ጥያቄዎችን መፈለግ
    const stored = localStorage.getItem('exam_' + subj);
    if (stored) {
        questions = JSON.parse(stored);
    } else {
        // ጥያቄ ከሌለ ናሙና ማሳያ
        questions = [{q: subj + " ጥያቄ አልተጫነም!", a: "-", b: "-", c: "-", d: "-", r: "A"}];
    }
    
    currentIdx = 0;
    userAnswers = {};
    timeLeft = 3600;
    showQuestion();
    startTimer();
    navigateTo('exam-page');
}

// --- ጥያቄ ማሳያ ---
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

// --- ሰዓት ቆጣሪ ---
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

// --- ውጤት ማሳያ ---
function finishExam() {
    clearInterval(timer);
    let score = 0;
    questions.forEach((q, i) => { if (userAnswers[i] === q.r) score++; });
    document.getElementById('score-text').innerText = `${score}/${questions.length}`;
    navigateTo('result-page');
}

// --- አድሚን፡ ጥያቄዎችን ከ PDF ተረድቶ መጫኛ (Regex Parser) ---
function processBulk() {
    const rawText = document.getElementById('bulk-input').value;
    if (!rawText) return alert("እባክዎ ጥያቄዎቹን ያስገቡ!");

    // በቀላሉ ጥያቄዎችን ለመለየት የሚረዳ ኮድ (ቁጥር 1. ብሎ የሚጀምር)
    const qBlocks = rawText.split(/\d+\./).filter(b => b.trim() !== "");
    const parsed = qBlocks.map(block => {
        const lines = block.split('\n').filter(l => l.trim() !== "");
        return {
            q: lines[0].trim(),
            a: lines[1] ? lines[1].replace(/A[.\)]/i, "").trim() : "",
            b: lines[2] ? lines[2].replace(/B[.\)]/i, "").trim() : "",
            c: lines[3] ? lines[3].replace(/C[.\)]/i, "").trim() : "",
            d: lines[4] ? lines[4].replace(/D[.\)]/i, "").trim() : "",
            r: "A" // አድሚኑ በኋላ እንዲያስተካክለው የሚተው
        };
    });

    localStorage.setItem('exam_' + selectedSubj, JSON.stringify(parsed));
    alert(parsed.length + " ጥያቄዎች ለ " + selectedSubj + " ተጭነዋል!");
}

// --- QR ኮድ ስካነር (ከአድሚን ጥያቄ ለመቀበል) ---
function openGlobalScanner() {
    navigateTo('qr-scanner-page');
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
            const data = JSON.parse(decodedText);
            localStorage.setItem('exam_' + data.subj, JSON.stringify(data.qs));
            alert(data.subj + " ጥያቄዎች ደርሰዋል!");
            html5QrCode.stop();
            navigateTo('welcome-page');
        }
    );
}

function handleOCR() { alert("የፎቶ ማንበቢያ (OCR) ሲስተም በቅርቡ ይጨመራል!"); }
