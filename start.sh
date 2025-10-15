#!/bin/bash

# Automated Marketing Management System - Startup Script
# This script starts both backend and frontend servers

echo "🚀 Starting Automated Marketing Management System..."
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if MongoDB is running
echo -e "\n${BLUE}Checking MongoDB...${NC}"
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB is not running. Attempting to start...${NC}"
    
    # Try to start MongoDB (macOS with Homebrew)
    if command -v brew &> /dev/null; then
        brew services start mongodb-community 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ MongoDB started successfully${NC}"
            sleep 3
        else
            echo -e "${RED}✗ Failed to start MongoDB automatically${NC}"
            echo -e "${YELLOW}Please start MongoDB manually:${NC}"
            echo "  macOS: brew services start mongodb-community"
            echo "  Linux: sudo systemctl start mongod"
            echo "  Windows: net start MongoDB"
            exit 1
        fi
    else
        echo -e "${RED}✗ Please start MongoDB manually before running this script${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ MongoDB is running${NC}"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed. Please install Node.js v16+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm --version) detected${NC}"

# Install backend dependencies if needed
echo -e "\n${BLUE}Checking backend dependencies...${NC}"
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd backend
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Failed to install backend dependencies${NC}"
        exit 1
    fi
    cd ..
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi

# Install frontend dependencies if needed
echo -e "\n${BLUE}Checking frontend dependencies...${NC}"
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
        exit 1
    fi
    cd ..
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

# Check if .env file exists
echo -e "\n${BLUE}Checking configuration...${NC}"
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found in backend directory${NC}"
    echo -e "${YELLOW}Please create backend/.env file with required configuration${NC}"
    echo -e "See README.md for configuration details"
else
    echo -e "${GREEN}✓ Configuration file found${NC}"
fi

# Start backend server
echo -e "\n${BLUE}Starting backend server...${NC}"
cd backend
npm start &
BACKEND_PID=$!
cd ..
echo -e "${GREEN}✓ Backend server starting on http://localhost:5001${NC}"
echo -e "  PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Start frontend server
echo -e "\n${BLUE}Starting frontend server...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..
echo -e "${GREEN}✓ Frontend server starting on http://localhost:5173${NC}"
echo -e "  PID: $FRONTEND_PID"

# Success message
echo -e "\n${GREEN}=================================================="
echo -e "✓ All servers started successfully!"
echo -e "==================================================${NC}"
echo -e "\n📱 ${BLUE}Application URLs:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:5001${NC}"
echo -e "\n📝 ${BLUE}Useful Commands:${NC}"
echo -e "   Stop servers: ${YELLOW}Press Ctrl+C${NC}"
echo -e "   View logs: ${YELLOW}Check the terminal output${NC}"
echo -e "\n💡 ${BLUE}Note:${NC} Keep this terminal window open to keep servers running"
echo -e "\n${YELLOW}Press Ctrl+C to stop all servers${NC}\n"

# Function to cleanup on exit
cleanup() {
    echo -e "\n\n${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✓ All servers stopped${NC}"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT

# Wait for processes to finish
wait
