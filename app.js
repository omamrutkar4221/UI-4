// ========================
// CharismaAI - Main Application Logic
// ========================

// Page Navigation
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

// Initialize navigation
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetPage = item.getAttribute('data-page');
        navigateTo(targetPage);
    });
});

// Navigate to specific page
function navigateTo(pageName) {
    // Update nav items
    navItems.forEach(item => {
        if (item.getAttribute('data-page') === pageName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update pages
    pages.forEach(page => {
        if (page.id === `${pageName}-page`) {
            page.classList.remove('active');
            // Trigger reflow for animation
            void page.offsetWidth;
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================
// Drills Page - Category Filters
// ========================

const categoryButtons = document.querySelectorAll('.category-btn');
const drillCards = document.querySelectorAll('.drill-card');

categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        categoryButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.textContent.toLowerCase();

        // Filter drill cards
        drillCards.forEach(card => {
            const badge = card.querySelector('.drill-badge');
            if (!badge) return;

            const cardCategory = badge.textContent.toLowerCase();

            if (category === 'all' || cardCategory.includes(category)) {
                card.style.display = 'flex';
                card.style.animation = 'fadeIn 0.5s ease-in-out';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// ========================
// Practice Page - Timer
// ========================

let timerInterval = null;
let timerSeconds = 0;

function startTimer() {
    timerSeconds = 0;
    timerInterval = setInterval(() => {
        timerSeconds++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

// ========================
// Next Question Functionality
// ========================

const interviewQuestions = [
    "Tell me about yourself and why you're interested in this position.",
    "What are your greatest strengths and how do they apply to this role?",
    "Describe a challenging situation you faced and how you overcame it.",
    "Where do you see yourself in 5 years?",
    "Why should we hire you over other candidates?",
    "Tell me about a time when you worked in a team.",
    "How do you handle stress and pressure?",
    "What is your greatest weakness?",
    "Describe your ideal work environment.",
    "What motivates you to do your best work?"
];

let currentQuestionIndex = 0;

const nextQuestionBtn = document.getElementById('next-question-btn');
if (nextQuestionBtn) {
    nextQuestionBtn.addEventListener('click', () => {
        currentQuestionIndex = (currentQuestionIndex + 1) % interviewQuestions.length;
        const questionElement = document.getElementById('current-question');
        if (questionElement) {
            questionElement.style.opacity = '0';
            questionElement.style.transform = 'translateY(-10px)';

            setTimeout(() => {
                questionElement.textContent = interviewQuestions[currentQuestionIndex];
                questionElement.style.opacity = '1';
                questionElement.style.transform = 'translateY(0)';
            }, 200);
        }
    });
}

// ========================
// Upload Functionality
// ========================

const uploadArea = document.getElementById('upload-area');
const videoUploadInput = document.getElementById('video-upload');
const uploadProgress = document.getElementById('upload-progress');
const progressFill = document.getElementById('progress-fill');
const uploadStatus = document.getElementById('upload-status');
const submitUploadBtn = document.getElementById('submit-upload-btn');

// Click to upload
if (uploadArea) {
    uploadArea.addEventListener('click', () => {
        videoUploadInput.click();
    });
}

// Drag and drop functionality
if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--accent-cyan)';
        uploadArea.style.background = 'rgba(99, 102, 241, 0.15)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        uploadArea.style.background = 'rgba(99, 102, 241, 0.05)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        uploadArea.style.background = 'rgba(99, 102, 241, 0.05)';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleVideoUpload(files[0]);
        }
    });
}

// Handle file input change
if (videoUploadInput) {
    videoUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleVideoUpload(file);
        }
    });
}

// Handle video upload
function handleVideoUpload(file) {
    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
        alert('Please upload a valid video file (MP4, WebM, AVI)');
        return;
    }

    // Validate file size (500MB max)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('File size exceeds 500MB limit');
        return;
    }

    // Show progress
    uploadProgress.style.display = 'block';
    uploadArea.style.display = 'none';

    // Simulate upload progress
    let progress = 0;
    const uploadInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(uploadInterval);

            // Upload complete
            uploadStatus.textContent = 'Upload complete!';
            uploadStatus.style.color = 'var(--success)';
            submitUploadBtn.style.display = 'inline-flex';
        }

        progressFill.style.width = `${progress}%`;
    }, 300);
}

// Submit upload for analysis
if (submitUploadBtn) {
    submitUploadBtn.addEventListener('click', () => {
        // Simulate submission
        submitUploadBtn.textContent = 'Analyzing...';
        submitUploadBtn.disabled = true;

        setTimeout(() => {
            alert('Video submitted for AI analysis! Navigate to FEEDBACK page to see results.');
            navigateTo('feedback');

            // Reset upload section
            document.getElementById('upload-section').style.display = 'none';
            uploadArea.style.display = 'block';
            uploadProgress.style.display = 'none';
            submitUploadBtn.style.display = 'none';
            submitUploadBtn.textContent = 'Submit for Analysis';
            submitUploadBtn.disabled = false;
            progressFill.style.width = '0%';
            videoUploadInput.value = '';
        }, 2000);
    });
}

// ========================
// Resume Upload Functionality
// ========================

const resumeUploadArea = document.getElementById('resume-upload-area');
const resumeUploadInput = document.getElementById('resume-upload');
const resumeUploaded = document.getElementById('resume-uploaded');
const resumeFilename = document.getElementById('resume-filename');

// Click to upload resume
if (resumeUploadArea) {
    resumeUploadArea.addEventListener('click', () => {
        resumeUploadInput.click();
    });
}

// Drag and drop for resume
if (resumeUploadArea) {
    resumeUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        resumeUploadArea.style.borderColor = 'var(--primary-orange)';
        resumeUploadArea.style.background = 'rgba(255, 140, 66, 0.15)';
    });

    resumeUploadArea.addEventListener('dragleave', () => {
        resumeUploadArea.style.borderColor = 'rgba(255, 140, 66, 0.4)';
        resumeUploadArea.style.background = 'rgba(255, 140, 66, 0.05)';
    });

    resumeUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        resumeUploadArea.style.borderColor = 'rgba(255, 140, 66, 0.4)';
        resumeUploadArea.style.background = 'rgba(255, 140, 66, 0.05)';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleResumeUpload(files[0]);
        }
    });
}

// Handle resume file input change
if (resumeUploadInput) {
    resumeUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleResumeUpload(file);
        }
    });
}

// Handle resume upload
function handleResumeUpload(file) {
    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
        alert('Please upload a valid resume file (PDF, DOC, DOCX)');
        return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('File size exceeds 10MB limit');
        return;
    }

    // Show success message
    resumeFilename.textContent = `✓ ${file.name} uploaded successfully`;
    resumeUploaded.style.display = 'flex';
    resumeUploadArea.style.display = 'none';

    console.log('Resume uploaded:', file.name);
}

// ========================
// Smooth Scrolling
// ========================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========================
// Initialize on load
// ========================

document.addEventListener('DOMContentLoaded', () => {
    console.log('CharismaAI initialized successfully!');

    // Add SVG gradient for score circle
    const svg = document.querySelector('.score-circle svg');
    if (svg) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'scoreGradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('style', 'stop-color:#3b82f6;stop-opacity:1');

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('style', 'stop-color:#6366f1;stop-opacity:1');

        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        svg.insertBefore(defs, svg.firstChild);
    }
});
