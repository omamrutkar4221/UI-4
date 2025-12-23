// ========================
// CharismaAI - Camera & Face Detection
// ========================

let stream = null;
let faceDetectionInterval = null;
let mediaRecorder = null;
let recordedChunks = [];
let isCameraActive = false;
let faceDetectionInitialized = false;

// DOM Elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startBtn = document.getElementById('start-interview-btn');
const stopBtn = document.getElementById('stop-interview-btn');
const cameraPlaceholder = document.getElementById('camera-placeholder');
const detectionStatus = document.getElementById('face-detection-status');
const uploadSection = document.getElementById('upload-section');

// ========================
// Initialize Face Detection Models
// ========================

async function initializeFaceDetection() {
    if (faceDetectionInitialized) return true;

    try {
        console.log('Loading face detection models...');

        // Load models from CDN
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

        console.log('Face detection models loaded successfully!');
        faceDetectionInitialized = true;
        return true;
    } catch (error) {
        console.error('Error loading face detection models:', error);
        console.log('Face detection will not be available, but camera will work');
        return false;
    }
}

// ========================
// Camera Controls
// ========================

// Start Interview Button
if (startBtn) {
    startBtn.addEventListener('click', async () => {
        try {
            // Request camera access
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: true
            });

            // Set video source
            video.srcObject = stream;

            // Wait for video to be ready
            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    resolve();
                };
            });

            // Hide placeholder
            cameraPlaceholder.classList.add('hidden');

            // Setup canvas
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Update UI
            isCameraActive = true;
            startBtn.disabled = true;
            stopBtn.disabled = false;

            // Start timer
            if (typeof startTimer === 'function') {
                startTimer();
            }

            // Initialize and start face detection
            await initializeFaceDetection();
            startFaceDetection();

            // Start recording
            startRecording();

            console.log('Interview started successfully!');

        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Could not access camera. Please ensure you have granted camera permissions.');
        }
    });
}

// Stop Interview Button
if (stopBtn) {
    stopBtn.addEventListener('click', () => {
        stopInterview();
    });
}

// Stop Interview Function
function stopInterview() {
    // Stop camera stream
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    // Stop recording
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }

    // Clear video
    video.srcObject = null;

    // Stop face detection
    stopFaceDetection();

    // Stop timer
    if (typeof stopTimer === 'function') {
        stopTimer();
    }

    // Show placeholder
    cameraPlaceholder.classList.remove('hidden');

    // Clear canvas
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update UI
    isCameraActive = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;

    // Show auto-upload notification and start automatic upload
    startAutomaticUpload();

    console.log('Interview stopped - Starting automatic upload');
}

// ========================
// Face Detection
// ========================

async function startFaceDetection() {
    if (!faceDetectionInitialized) {
        console.log('Face detection not initialized');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Update status
    updateDetectionStatus(true, 'Detecting...');

    async function detectFaces() {
        if (!isCameraActive) return;

        try {
            // Detect faces
            const detections = await faceapi
                .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks();

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (detections.length > 0) {
                // Face detected
                updateDetectionStatus(true, 'Face Detected');

                // Draw detection boxes
                detections.forEach(detection => {
                    const box = detection.detection.box;

                    // Draw bounding box
                    ctx.strokeStyle = '#06b6d4';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(box.x, box.y, box.width, box.height);

                    // Draw corner accents
                    const cornerLength = 20;
                    ctx.strokeStyle = '#10b981';
                    ctx.lineWidth = 4;

                    // Top-left
                    ctx.beginPath();
                    ctx.moveTo(box.x, box.y + cornerLength);
                    ctx.lineTo(box.x, box.y);
                    ctx.lineTo(box.x + cornerLength, box.y);
                    ctx.stroke();

                    // Top-right
                    ctx.beginPath();
                    ctx.moveTo(box.x + box.width - cornerLength, box.y);
                    ctx.lineTo(box.x + box.width, box.y);
                    ctx.lineTo(box.x + box.width, box.y + cornerLength);
                    ctx.stroke();

                    // Bottom-left
                    ctx.beginPath();
                    ctx.moveTo(box.x, box.y + box.height - cornerLength);
                    ctx.lineTo(box.x, box.y + box.height);
                    ctx.lineTo(box.x + cornerLength, box.y + box.height);
                    ctx.stroke();

                    // Bottom-right
                    ctx.beginPath();
                    ctx.moveTo(box.x + box.width - cornerLength, box.y + box.height);
                    ctx.lineTo(box.x + box.width, box.y + box.height);
                    ctx.lineTo(box.x + box.width, box.y + box.height - cornerLength);
                    ctx.stroke();

                    // Draw confidence text
                    ctx.fillStyle = '#10b981';
                    ctx.font = 'bold 16px Inter';
                    const confidence = Math.round(detection.detection.score * 100);
                    ctx.fillText(`${confidence}%`, box.x, box.y - 10);
                });
            } else {
                // No face detected
                updateDetectionStatus(false, 'No Face Detected');
            }

        } catch (error) {
            console.error('Face detection error:', error);
        }

        // Continue detection
        if (isCameraActive) {
            requestAnimationFrame(detectFaces);
        }
    }

    // Start detection loop
    detectFaces();
}

function stopFaceDetection() {
    if (faceDetectionInterval) {
        clearInterval(faceDetectionInterval);
        faceDetectionInterval = null;
    }
    updateDetectionStatus(false, 'Face Detection: Inactive');
}

function updateDetectionStatus(isActive, text) {
    const statusDot = detectionStatus.querySelector('.status-dot');
    const statusText = detectionStatus.querySelector('.status-text');

    if (statusDot && statusText) {
        if (isActive) {
            statusDot.classList.add('active');
        } else {
            statusDot.classList.remove('active');
        }
        statusText.textContent = text;
    }
}

// ========================
// Video Recording
// ========================

function startRecording() {
    if (!stream) return;

    recordedChunks = [];

    // Create media recorder
    const options = { mimeType: 'video/webm; codecs=vp9' };

    // Fallback for different browsers
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/mp4';
        }
    }

    try {
        mediaRecorder = new MediaRecorder(stream, options);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            // Create blob from recorded chunks
            const blob = new Blob(recordedChunks, {
                type: 'video/webm'
            });

            // Save blob for upload
            console.log('Recording saved, size:', blob.size);

            // Optionally: Create download link
            // const url = URL.createObjectURL(blob);
            // const a = document.createElement('a');
            // a.href = url;
            // a.download = 'interview-recording.webm';
            // a.click();
        };

        mediaRecorder.start();
        console.log('Recording started');

    } catch (error) {
        console.error('Error starting recording:', error);
    }
}

// ========================
// Handle page visibility
// ========================

document.addEventListener('visibilitychange', () => {
    if (document.hidden && isCameraActive) {
        // Optionally pause when tab is hidden
        console.log('Tab hidden, camera still active');
    }
});

// ========================
// Initialize on page load
// ========================

console.log('Camera module loaded successfully!');

// Pre-load face detection models when user navigates to practice page
const practiceNavItem = document.querySelector('[data-page="practice"]');
if (practiceNavItem) {
    practiceNavItem.addEventListener('click', () => {
        // Pre-load models in background
        setTimeout(() => {
            initializeFaceDetection();
        }, 500);
    });
}

// ========================
// Automatic Video Upload
// ========================

function startAutomaticUpload() {
    const autoUploadNotification = document.getElementById('auto-upload-notification');
    const autoProgressFill = document.getElementById('auto-progress-fill');
    const autoUploadStatus = document.getElementById('auto-upload-status');

    if (!autoUploadNotification) return;

    // Show notification
    autoUploadNotification.style.display = 'block';
    autoUploadNotification.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Simulate automatic upload progress
    let progress = 0;
    autoUploadStatus.textContent = 'Uploading video...';

    const uploadInterval = setInterval(() => {
        progress += Math.random() * 12 + 3; // Random progress 3-15%

        if (progress >= 100) {
            progress = 100;
            clearInterval(uploadInterval);

            // Upload complete
            autoProgressFill.style.width = '100%';
            autoUploadStatus.textContent = 'Upload complete! Processing your interview...';
            autoUploadStatus.style.color = 'var(--success)';

            // After a brief delay, update status
            setTimeout(() => {
                autoUploadStatus.textContent = 'Analysis complete! View your feedback.';
            }, 1500);

            console.log('Auto-upload completed');
        } else {
            autoProgressFill.style.width = `${progress}%`;
        }
    }, 200);
}
