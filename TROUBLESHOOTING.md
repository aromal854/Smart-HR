# Troubleshooting Guide - "Failed to Fetch" Error

## Quick Diagnosis Steps

### 1. Check if Backend is Running

```bash
# Check if Node process is running
Get-Process -Name node

# Check if port 5000 is listening
netstat -ano | findstr :5000
```

**Expected Output**: Should show LISTENING on port 5000

### 2. Test Backend API Directly

```bash
# Test the backend
curl http://localhost:5000/api/test
```

**Expected Output**: `{"message":"HR backend is working!"}`

### 3. Check Frontend is Running

```bash
# Check if port 3000 is listening
netstat -ano | findstr :3000
```

**Expected Output**: Should show LISTENING on port 3000

### 4. Check Browser Console

Open your browser's Developer Tools (F12) and look for:
- 🔧 API Client initialized message
- 📤 API Request logs
- 📥 API Response logs  
- ❌ Any error messages

## Common Issues and Solutions

### Issue 1: Backend Not Running

**Symptoms**: 
- `ERR_CONNECTION_REFUSED` in console
- No response from `http://localhost:5000`

**Solution**:
```bash
cd backend
node server.js
```

### Issue 2: Frontend Not Running

**Symptoms**:
- Can't access `http://localhost:3000`
- Page doesn't load

**Solution**:
```bash
cd frontendd
npm start
```

### Issue 3: CORS Error

**Symptoms**:
- Console shows: `Access to fetch at 'http://localhost:5000' has been blocked by CORS policy`

**Solution**:
The backend already has CORS enabled. If you still see this:
1. Clear browser cache
2. Restart both servers
3. Try incognito/private browsing mode

### Issue 4: Wrong API URL

**Symptoms**:
- API requests going to wrong URL
- Check console for "API Client initialized" message

**Solution**:
Create `.env` file in `frontendd/` folder:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Then restart the frontend.

### Issue 5: MongoDB Not Connected

**Symptoms**:
- Backend starts but crashes when making requests
- Console shows MongoDB connection errors

**Solution**:
1. Check `backend/.env` file has correct MongoDB URI
2. Ensure MongoDB is running (if using local MongoDB)
3. Check MongoDB Atlas connection (if using cloud)

```env
# backend/.env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

### Issue 6: Old Dashboard Components Using Fetch

**Symptoms**:
- Login works fine
- Dashboard pages show "failed to fetch"

**Solution**:
The old `EmployeeDashboard.jsx` and `HRDashboard.jsx` are still using direct `fetch()` calls instead of our new `apiClient`. They need to be updated.

**Temporary Fix**: Use the old login flow or update dashboards to use apiClient.

## Debugging Commands

### Check All Running Processes
```powershell
Get-Process -Name node | Select-Object Id, ProcessName, StartTime
```

### Kill All Node Processes (if needed)
```powershell
Get-Process -Name node | Stop-Process -Force
```

### Check What's Using a Port
```powershell
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```

### Test API with PowerShell
```powershell
# Test endpoint
Invoke-RestMethod -Uri "http://localhost:5000/api/test" -Method Get

# Test login
$body = @{
    username = "testuser"
    password = "testpass"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

## Step-by-Step Fresh Start

If nothing works, try this clean restart:

### 1. Stop Everything
```powershell
# Kill all node processes
Get-Process -Name node | Stop-Process -Force
```

### 2. Start Backend
```bash
cd c:\Users\arjun\Desktop\Smart-HR\backend
node server.js
```

**Wait for**: `🚀 Server running on port 5000`

### 3. Start Frontend (in new terminal)
```bash
cd c:\Users\arjun\Desktop\Smart-HR\frontendd
npm start
```

**Wait for**: Browser opens to `http://localhost:3000`

### 4. Test the Flow
1. Go to `http://localhost:3000`
2. Open Browser DevTools (F12) → Console tab
3. Look for: `🔧 API Client initialized with base URL: http://localhost:5000/api`
4. Click "Employee Portal" or "HR Admin Portal"
5. Try to login
6. Watch console for:
   - `📤 API Request: POST /auth/login`
   - `📥 API Response: 200 /auth/login` (success)
   - OR `❌ API Error:` (with details)

## Understanding the Console Logs

### Good Signs ✅
```
🔧 API Client initialized with base URL: http://localhost:5000/api
📤 API Request: POST /auth/login
📥 API Response: 200 /auth/login
```

### Bad Signs ❌
```
❌ API Error: {
  url: "/auth/login",
  status: undefined,
  message: "Network Error"
}
```
This means backend is not reachable.

```
❌ API Error: {
  url: "/auth/login",
  status: 401,
  message: "Invalid credentials"
}
```
This means backend is working but credentials are wrong.

## Still Not Working?

### Check These Files:

1. **Backend is configured correctly**:
   - `backend/.env` exists with MongoDB URI
   - `backend/server.js` has `app.use(cors())`

2. **Frontend is configured correctly**:
   - `frontendd/src/utils/apiClient.js` has correct base URL
   - `frontendd/src/App.js` wraps components correctly

3. **Dependencies are installed**:
```bash
# Backend
cd backend
npm install

# Frontend
cd frontendd
npm install
```

## Contact Points

If you see specific error messages in the console, note them down:
- The exact error message
- The URL it's trying to reach
- The HTTP status code (if any)
- Any stack traces

This will help diagnose the exact issue!

---

**Pro Tip**: Keep both terminal windows visible so you can see backend logs and frontend logs simultaneously.
