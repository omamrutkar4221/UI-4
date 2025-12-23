// ========================
// CharismaAI - Camera & Face Detection
// ========================

// Global variables
let stream = null;
let mediaRecorder = null;
let recordedChunks = [];
let isCameraActive = false;
let faceDetectionInterval = null;

// DOM elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startBtn = document.getElementById('start-interview-btn');
const stopBtn = document.getElementById('stop-interview-btn');
const cameraPlaceholder = document.getElementById('camera-placeholder');
const detectionStatus = document.getElementById('face-detection-status');

// Initialize button listeners
if (startBtn) {
    startBtn.addEventListener('click', startInterview);
}

if (stopBtn) {
    stopBtn.addEventListener('click', stopInterview);
}

// Start Interview Function
async function startInterview() {
    try {
        // Get camera stream
        stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720 },
            audio: true
        });

        // Display video stream
        video.srcObject = stream;

        // Hide placeholder
        cameraPlaceholder.classList.add('hidden');

        // Update buttons
        isCameraActive = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;

        // Start face detection
        await loadFaceDetectionModels();
        startFaceDetection();

        // Start timer
        if (typeof startTimer === 'function') {
            startTimer();
        }

        // Start recording
        startRecording();

        console.log('Interview started');

    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Unable to access camera. Please ensure you have granted camera permissions.');
    }
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

async function loadFaceDetectionModels() {
    try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);

        console.log('Face detection models loaded');
    } catch (error) {
        console.error('Error loading face detection models:', error);
    }
}

function startFaceDetection() {
    if (!faceapi || !video) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    // Run face detection every 100ms
    faceDetectionInterval = setInterval(async () => {
        if (!isCameraActive) return;

        try {
            const detections = await faceapi
                .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks();

            // Clear canvas
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (detections && detections.length > 0) {
                // Draw face detection box
                const resizedDetections = faceapi.resizeResults(detections, {
                    width: canvas.width,
                    height: canvas.height
                });

                // Draw with custom styling
                resizedDetections.forEach(detection => {
                    const box = detection.detection.box;

                    // Draw green rectangle around face
                    ctx.strokeStyle = '#10b981';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(box.x, box.y, box.width, box.height);

                    // Draw confidence score
                    const confidence = Math.round(detection.detection.score * 100);
                    ctx.fillStyle = '#10b981';
                    ctx.font = '16px Inter';
                    ctx.fillText(`${confidence}%`, box.x, box.y - 10);
                });

                // Update status
                updateDetectionStatus(true, detections.length);
            } else {
                updateDetectionStatus(false, 0);
            }
        } catch (error) {
            console.error('Face detection error:', error);
        }
    }, 100);
}

function stopFaceDetection() {
    if (faceDetectionInterval) {
        clearInterval(faceDetectionInterval);
        faceDetectionInterval = null;
    }
    updateDetectionStatus(false, 0);
}

function updateDetectionStatus(detected, faceCount) {
    if (!detectionStatus) return;

    const statusDot = detectionStatus.querySelector('.status-dot');
    const statusText = detectionStatus.querySelector('.status-text');

    if (detected) {
        statusDot.classList.add('active');
        statusText.textContent = `Face Detected: ${faceCount}`;
    } else {
        statusDot.classList.remove('active');
        statusText.textContent = 'Face Detection: Inactive';
    }
}

// ========================
// Video Recording
// ========================

function startRecording() {
    if (!stream) return;

    recordedChunks = [];

    try {
        const options = { mimeType: 'video/webm;codecs=vp9' };
        mediaRecorder = new MediaRecorder(stream, options);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            console.log('Recording completed, size:', blob.size);
            // Here you could send the blob to your Python backend
        };

        mediaRecorder.start(1000); // Save data every second
        console.log('Recording started');

    } catch (error) {
        console.error('Error starting recording:', error);
    }
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
