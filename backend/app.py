import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import mongomock
import bcrypt
from datetime import datetime, timedelta
import uuid

app = Flask(__name__)
CORS(app)

# Configuration
app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # Change this in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)

# Mock Database
client = mongomock.MongoClient()
db = client['video_app']
users_collection = db['users']
videos_collection = db['videos']

# Helper function for password hashing
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

# Initialize some mock data
if videos_collection.count_documents({}) == 0:
    videos_collection.insert_many([
        {
    "id": "v1",
    "title": "Clean Code - Uncle Bob / Lesson 1",
    "description": "Uncle Bob (Robert C. Martin) explains clean code principles, ethics in software, and why good code matters for society.",
    "youtube_id": "7EmboKQH8lM",
    "full_url": "https://www.youtube.com/watch?v=7EmboKQH8lM",
    "thumbnail_url": "https://img.youtube.com/vi/7EmboKQH8lM/maxresdefault.jpg",
    "is_active": True
  },
  {
    "id": "v2",
    "title": "Artificial Intelligence in 2025 | 60 Minutes Full Episodes",
    "description": "Deep discussion on AI's job impact, unemployment risks, and tech evolution in the coming years.",
    "youtube_id": "KpOcUrPdx-4",
    "full_url": "https://www.youtube.com/watch?v=KpOcUrPdx-4",
    "thumbnail_url": "https://img.youtube.com/vi/KpOcUrPdx-4/maxresdefault.jpg",
    "is_active": True
  }
    ])

# --- Root Route ---
@app.route('/')
def index():
    return jsonify({
        "status": "online",
        "message": "Welcome to the VideoBase API",
        "endpoints": {
            "auth": ["/auth/signup", "/auth/login", "/auth/me", "/auth/logout"],
            "videos": ["/dashboard", "/video/<id>/stream", "/video/<id>/play"]
        }
    }), 200

# --- Auth Routes ---

@app.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    print(f"Signup attempt: {data}") # Debug log
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        print("Signup failed: Missing fields")
        return jsonify({"msg": "Missing required fields"}), 400

    if users_collection.find_one({"email": email}):
        print(f"Signup failed: User {email} already exists")
        return jsonify({"msg": "User already exists"}), 400

    try:
        from datetime import timezone
        user = {
            "id": str(uuid.uuid4()),
            "name": name,
            "email": email,
            "password_hash": hash_password(password),
            "created_at": datetime.now(timezone.utc)
        }
        users_collection.insert_one(user)
        print(f"User {email} created successfully")
        
        access_token = create_access_token(identity=email)
        return jsonify(access_token=access_token, user={"name": name, "email": email}), 201
    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({"msg": "Internal server error"}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = users_collection.find_one({"email": email})
    if user and check_password(password, user['password_hash']):
        access_token = create_access_token(identity=email)
        return jsonify(access_token=access_token, user={"name": user['name'], "email": user['email']}), 200

    return jsonify({"msg": "Bad email or password"}), 401

@app.route('/auth/me', methods=['GET'])
@jwt_required()
def me():
    current_user_email = get_jwt_identity()
    user = users_collection.find_one({"email": current_user_email})
    if user:
        return jsonify(name=user['name'], email=user['email']), 200
    return jsonify({"msg": "User not found"}), 404

@app.route('/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    # In a real app, we might blacklist the token
    return jsonify({"msg": "Successfully logged out"}), 200

# --- Video Routes ---

@app.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    # Return videos without exposing internal IDs or youtube_ids
    videos = list(videos_collection.find({"is_active": True}, {"_id": 0, "youtube_id": 0}).limit(2))
    return jsonify(videos), 200

@app.route('/video/<video_id>/stream', methods=['GET'])
@jwt_required()
def get_stream(video_id):
    """
    Returns a signed playback token for the requested video.
    This fulfills 'Option B' of the video wrapper strategy.
    """
    video = videos_collection.find_one({"id": video_id})
    if not video:
        return jsonify({"msg": "Video not found"}), 404

    # Sign a token specifically for this video playback
    # This token expires in 1 hour
    playback_token = create_access_token(
        identity=get_jwt_identity(),
        additional_claims={"v_id": video_id, "type": "playback"},
        expires_delta=timedelta(hours=1)
    )
    
    return jsonify({
        "video_id": video_id,
        "playback_token": playback_token
    }), 200

@app.route('/video/<video_id>/play', methods=['GET'])
def play_video(video_id):
    """
    The endpoint used by the WebView to actually render the video.
    Validates the playback token.
    """
    token = request.args.get('token')
    if not token:
        return "Missing playback token", 401
    
    try:
        # Decode and validate the token manually since it might be a query param
        from flask_jwt_extended import decode_token
        decoded = decode_token(token)
        print(f"Decoded token for playback: {decoded}") # Debug log

        # Additional claims are at the root level of the decoded dictionary
        if decoded.get('sub') is None or decoded.get('v_id') != video_id:
            print(f"Validation failed: sub={decoded.get('sub')}, v_id={decoded.get('v_id')} vs expected {video_id}")
            return "Invalid playback token", 403
            
        video = videos_collection.find_one({"id": video_id})
        if not video:
            return "Video not found", 404

        # Return a simple HTML page with the YouTube embed
        # This keeps the YouTube logic entirely on the backend
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body, html {{ margin: 0; padding: 0; height: 100%; overflow: hidden; background: #000; }}
                iframe {{ position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }}
            </style>
        </head>
        <body>
            <iframe 
                src="https://www.youtube.com/embed/{video['youtube_id']}?autoplay=1&modestbranding=1&rel=0" 
                allow="autoplay; encrypted-media" 
                allowfullscreen>
            </iframe>
        </body>
        </html>
        """
        return html
    except Exception as e:
        return f"Authentication failed: {str(e)}", 401

if __name__ == '__main__':
    # host='0.0.0.0' is REQUIRED to allow your phone to connect to this server
    app.run(debug=True, host='0.0.0.0', port=5000)
