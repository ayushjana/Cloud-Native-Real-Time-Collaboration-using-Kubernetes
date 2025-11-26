#!/bin/bash

echo "=== MongoDB Setup Script ==="
echo ""

# Check if MongoDB is already running
if netstat -tuln 2>/dev/null | grep -q ":27017" || ss -tuln 2>/dev/null | grep -q ":27017"; then
    echo "✅ MongoDB is already running on port 27017"
    exit 0
fi

# Option 1: Try to start Docker and run MongoDB
echo "Attempting to start MongoDB using Docker..."
if systemctl is-active --quiet docker || sudo systemctl start docker 2>/dev/null; then
    echo "Starting MongoDB container..."
    docker run -d --name mongodb -p 27017:27017 -v mongodb-data:/data/db mongo:latest
    sleep 3
    if docker ps | grep -q mongodb; then
        echo "✅ MongoDB is running in Docker on port 27017"
        exit 0
    fi
fi

# Option 2: Install MongoDB Community Edition
echo ""
echo "Docker method failed. Installing MongoDB Community Edition..."
echo "Please run the following commands:"
echo ""
echo "1. Import MongoDB public GPG key:"
echo "   wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -"
echo ""
echo "2. Add MongoDB repository:"
echo "   echo 'deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse' | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list"
echo ""
echo "3. Update and install:"
echo "   sudo apt-get update"
echo "   sudo apt-get install -y mongodb-org"
echo ""
echo "4. Start MongoDB:"
echo "   sudo systemctl start mongod"
echo "   sudo systemctl enable mongod"
echo ""
echo "5. Verify MongoDB is running:"
echo "   sudo systemctl status mongod"
echo ""

