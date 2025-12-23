# CharismaAI - Python Flask Application

## Quick Start Guide

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Application
```bash
python app.py
```

### 3. Open in Browser
Navigate to: **http://localhost:5000**

---

## What You Have

✅ **Python Flask Backend** - Serves your UI and handles uploads  
✅ **Orange/Black Theme** - Premium color scheme  
✅ **Camera & Face Detection** - Real-time AI-powered detection  
✅ **Resume Upload** - In PRACTICE section  
✅ **Automatic Video Upload** - After stopping interview  
✅ **Next Question Button** - Cycle through 10 questions  
✅ **All 4 Pages** - HOME, PRACTICE, FEEDBACK, DRILLS  

---

## File Structure

```
UI-4/
├── app.py              # Flask Python backend
├── requirements.txt    # Python dependencies
├── README.md          # This file
├── index.html         # Main HTML
├── style.css          # Orange/black styling
├── app.js             # Navigation & interactions
├── camera.js          # Camera & face detection
└── uploads/           # Auto-created for uploads
    ├── resumes/
    └── videos/
```

---

## How It Works

1. **Flask serves HTML** - Python backend serves your frontend
2. **JavaScript runs in browser** - Camera, face detection work normally
3. **Python handles backend** - File uploads, data processing
4. **Perfect combination** - Python power + JavaScript browser features!

---

## Troubleshooting

**Port 5000 busy?**
Edit app.py line 138: change port to 8000

**Camera not working?**
Camera works on localhost. For production, use HTTPS.

---

**Your CharismaAI is ready for the hackathon!** 🏆
