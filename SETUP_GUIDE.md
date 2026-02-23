# 🚀 Supreme Cheta - Setup & Run Guide

Quick guide to get the project running on your machine.

---

## 📋 Prerequisites

Before you start, make sure you have these installed:

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (or use MongoDB Atlas cloud)
- **Git**

Check your versions:
```bash
node --version
npm --version
git --version
```

---

## 🎯 First Time Setup

### **Step 1: Clone the Repository**

```bash
git clone <repository-url>
cd SupremeCheta
```

---

### **Step 2: Setup Backend**

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# You need to update:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_ACCESS_SECRET (generate with the command below)
# - JWT_REFRESH_SECRET (generate with the command below)
```

**Generate JWT Secrets:**
```bash
# Run this twice to get two different secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste into `.env`:
```env
JWT_ACCESS_SECRET=<first_generated_secret>
JWT_REFRESH_SECRET=<second_generated_secret>
```

**Your backend/.env should look like:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/supreme_cheta
PORT=5001
NODE_ENV=development
JWT_ACCESS_SECRET=your_generated_secret_here
JWT_REFRESH_SECRET=your_other_generated_secret_here
CORS_ORIGIN=http://localhost:3000
```

---

### **Step 3: Setup Frontend**

```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# The .env should already have the correct configuration
# Just verify it points to your backend:
```

**Your frontend/.env should look like:**
```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_TOKEN_REFRESH_BUFFER=60
REACT_APP_DEBUG=true
REACT_APP_ENV=development
REACT_APP_NAME=Supreme Cheta
```

---

## ▶️ Running the Project

You need **TWO terminal windows** - one for backend, one for frontend.

### **Terminal 1: Run Backend**

```bash
# From project root
cd backend
npm run dev
```

**You should see:**
```
✅ Environment validation passed
✅ Models registered
✅ MongoDB connected successfully
✅ Server running on port 5001
```

**Keep this terminal running!**

---

### **Terminal 2: Run Frontend**

```bash
# From project root (open a NEW terminal)
cd frontend
npm start
```

**You should see:**
```
Compiled successfully!
The app is running at http://localhost:3000
```

**Your browser should automatically open to http://localhost:3000**

**Keep this terminal running too!**

---

## 🎉 You're Ready!

The application is now running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Backend is connected to MongoDB**

---

## 👤 Test Accounts

You can login with these test accounts:

| Name | Email | Password |
|------|-------|----------|
| Sadid | sadid@example.com | Sadid123! |
| Shakib | shakib@example.com | Shakib123! |
| Siam | siam@example.com | Siam123! |

---

## 🔧 Common Issues & Solutions

### **Issue: "Cannot connect to MongoDB"**

**Solution:**
- Check your `MONGODB_URI` in `backend/.env`
- Make sure MongoDB is running (if local)
- Verify your IP is whitelisted (if using MongoDB Atlas)

---

### **Issue: "Port 5001 already in use"**

**Solution:**
```bash
# Find what's using port 5001
lsof -i :5001

# Kill the process (replace PID with the number shown)
kill -9 <PID>

# Or change the port in backend/.env
PORT=5002
```

---

### **Issue: "CORS error in browser"**

**Solution:**
- Verify `CORS_ORIGIN=http://localhost:3000` in `backend/.env`
- Make sure frontend is running on port 3000
- Restart backend after changing .env

---

### **Issue: "JWT secrets required" error**

**Solution:**
- Generate secrets with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Add them to `backend/.env`
- Restart backend

---

## 🛑 Stopping the Application

**In each terminal:**
- Press `Ctrl+C` to stop the server

---

## 🔄 Subsequent Runs

After the first setup, you just need to:

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend (new terminal)
cd frontend
npm start
```

That's it! No need to reinstall dependencies or reconfigure.

---

## 📦 Project Structure

```
SupremeCheta/
├── backend/                 # Node.js + Express backend
│   ├── controllers/         # Business logic
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth, validation, etc.
│   ├── utils/              # Helper functions
│   ├── .env               # Environment variables (not in git)
│   └── server.js          # Entry point
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── providers/     # Context providers
│   │   ├── utils/         # Helper functions
│   │   ├── hooks/         # Custom hooks
│   │   └── App.js         # Main app component
│   └── .env               # Frontend config (not in git)
│
└── docs/                   # Documentation
```

---

## 🧪 Testing the Authentication

Run the automated test suite:

```bash
# Make sure backend is running first
./test-jwt.sh
```

This will test:
- ✅ User registration
- ✅ User login
- ✅ Protected routes
- ✅ Token refresh
- ✅ Token rotation
- ✅ Logout
- ✅ Rate limiting

---

## 📚 Documentation

- **JWT Implementation**: See `JWT_IMPLEMENTATION_SUMMARY.md`
- **API Testing**: See `TESTING_CHECKLIST.md`
- **Security Analysis**: See `SECURITY_ANALYSIS.md`
- **Sprint Plan**: See `PROJECT_SPRINT_PLAN.md`

---

## 🆘 Need Help?

If you're stuck:

1. Check the error message in the terminal
2. Review the "Common Issues" section above
3. Check the documentation files
4. Make sure both frontend and backend are running
5. Verify your `.env` files are configured correctly

---

## 🎯 Quick Command Reference

```bash
# Install dependencies
npm install

# Run backend (development)
npm run dev

# Run frontend (development)
npm start

# Run tests
./test-jwt.sh

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

**Happy coding! 🚀**
