"""
CharismaAI - Flask Backend Application

This Flask application serves the CharismaAI frontend (HTML/CSS/JavaScript)
and provides backend endpoints for file uploads and AI processing.
"""

from flask import Flask, send_from_directory, request, jsonify
from werkzeug.utils import secure_filename
import os
from datetime import datetime

# Initialize Flask app
app = Flask(__name__, 
            template_folder='.',
            static_folder='.',
            static_url_path='')

# Configuration
app.config['SECRET_KEY'] = 'charismaai-secret-key-2024'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB

# Allowed file extensions
ALLOWED_RESUME_EXTENSIONS = {'pdf', 'doc', 'docx'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'webm', 'avi', 'mov'}

# Create upload directories
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'resumes'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'videos'), exist_ok=True)


def allowed_file(filename, allowed_extensions):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions


@app.route('/')
def index():
    """Serve the main application"""
    return send_from_directory('.', 'index.html')


@app.route('/index.html')
def index_html():
    """Alternative route for index.html"""
    return send_from_directory('.', 'index.html')


@app.route('/style.css')
def style():
    """Serve CSS file"""
    return send_from_directory('.', 'style.css')


@app.route('/app.js')
def app_js():
    """Serve main JavaScript file"""
    return send_from_directory('.', 'app.js')


@app.route('/camera.js')
def camera_js():
    """Serve camera JavaScript file"""
    return send_from_directory('.', 'camera.js')


@app.route('/api/upload/resume', methods=['POST'])
def upload_resume():
    """Handle resume uploads"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename, ALLOWED_RESUME_EXTENSIONS):
            return jsonify({'error': 'Invalid file type'}), 400
        
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'resumes', unique_filename)
        
        file.save(filepath)
        
        return jsonify({
            'success': True,
            'message': 'Resume uploaded successfully',
            'filename': unique_filename
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/upload/video', methods=['POST'])
def upload_video():
    """Handle video uploads"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename, ALLOWED_VIDEO_EXTENSIONS):
            return jsonify({'error': 'Invalid file type'}), 400
        
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'videos', unique_filename)
        
        file.save(filepath)
        
        return jsonify({
            'success': True,
            'message': 'Video uploaded successfully',
            'filename': unique_filename
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("=" * 60)
    print("CharismaAI Flask Backend Starting...")
    print("=" * 60)
    print(f"Upload folder: {app.config['UPLOAD_FOLDER']}")
    print(f"Server running at: http://localhost:5000")
    print(f"Open your browser: http://localhost:5000")
    print("=" * 60)
    print("\nPress CTRL+C to stop\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
