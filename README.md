# API-First Video App

A premium React Native (Expo) application powered by a Flask backend and MongoDB (mocked).

## 🚀 Key Features
- **Thin Client Architecture**: Zero business logic on the mobile app. All data and streaming strategies are managed by the Flask API.
- **Secure Streaming (Option B)**: Implements signed playback tokens. YouTube URLs are never exposed to the client; the backend serves a secure playback wrapper.
- **Premium Aesthetic**: Modern Dark Mode UI with high-fidelity components, custom typography, and vibrant accents.
- **JWT Authentication**: Full auth flow including signup, login, and profile management with secure token storage.

## 🛠 Tech Stack
- **Frontend**: React Native, Expo, React Navigation, Axios, Lucide Icons.
- **Backend**: Flask, Flask-JWT-Extended, PyMongo (with mongomock for demo), Bcrypt.

## 📂 Project Structure
- `/backend`: Flask API server.
- `/frontend`: React Native Expo application.

## 🚦 Getting Started

### 1. Start the Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```
The server will run on `http://localhost:5000`.

### 2. Start the Frontend
```bash
cd frontend
npm install
npx expo start
```
*Note: If using an Android Emulator, the API is configured to use `http://10.0.2.2:5000`. If using a physical device, update the `API_URL` in `frontend/services/api.js` to your machine's local IP.*

## 🔐 Video Security Design
The app never directly accesses YouTube. Instead:
1. Client requests a playback token via `GET /video/<id>/stream`.
2. Backend returns a signed JWT playback token valid for 1 hour.
3. Client loads the `WebView` with `http://backend/video/<id>/play?token=...`.
4. Backend validates the token and injects a secure HTML template with the embed.
