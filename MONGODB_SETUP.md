# MongoDB Setup Instructions

## Current Status
- ❌ MongoDB is NOT running (connection refused on port 27017)
- ✅ MongoDB Compass downloaded: `~/Downloads/mongodb-compass_1.48.2_amd64.deb`
- ✅ Bug fixed in `backend/models/userModel.js` (password hashing issue)

## Quick Setup Options

### Option 1: Using Docker (Recommended - Easiest)

1. **Start Docker daemon:**
   ```bash
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

2. **Run MongoDB in Docker:**
   ```bash
   docker run -d --name mongodb -p 27017:27017 -v mongodb-data:/data/db mongo:latest
   ```

3. **Verify it's running:**
   ```bash
   docker ps | grep mongodb
   ```

### Option 2: Install MongoDB Community Edition

1. **Import MongoDB public GPG key:**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
   ```

2. **Add MongoDB repository:**
   ```bash
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. **Update and install:**
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Start MongoDB:**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

5. **Verify MongoDB is running:**
   ```bash
   sudo systemctl status mongod
   netstat -tuln | grep 27017
   ```

## Install MongoDB Compass

MongoDB Compass is already downloaded. Install it with:

```bash
sudo dpkg -i ~/Downloads/mongodb-compass_1.48.2_amd64.deb
```

If you get dependency errors:
```bash
sudo apt-get install -f
```

## Connect to MongoDB

### From MongoDB Compass:
- Connection String: `mongodb://localhost:27017`
- Or use: `mongodb://127.0.0.1:27017/chat-app`

### Verify Connection:
```bash
# Test connection from Node.js
cd /home/keerthi/mern-chat-app/backend
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/chat-app').then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(err => { console.log('❌ Error:', err.message); process.exit(1); });"
```

## After MongoDB is Running

1. **Restart the backend server:**
   ```bash
   cd /home/keerthi/mern-chat-app
   # Stop current server (Ctrl+C) and restart:
   npm start
   ```

2. **Test the signup endpoint** - The 500 error should be resolved once MongoDB is connected.

## Current .env Configuration
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/chat-app
NODE_ENV=development
```

## Troubleshooting

- **Connection refused**: MongoDB is not running
- **500 Internal Server Error**: Usually means MongoDB connection failed
- **Check backend logs**: Look for MongoDB connection errors in the terminal where `npm start` is running

