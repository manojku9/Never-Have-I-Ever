# MongoDB Setup Guide

## The Error You're Seeing

If you see: `Operation gamesessions.insertOne() buffering timed out after 10000ms`

This means MongoDB is not running or not accessible.

## Solutions

### Option 1: Install and Run MongoDB Locally

1. **Install MongoDB:**
   - Windows: Download from https://www.mongodb.com/try/download/community
   - Or use Chocolatey: `choco install mongodb`
   - Or use MongoDB Atlas (cloud) - see Option 2

2. **Start MongoDB:**
   ```bash
   # Windows (if installed as service, it should start automatically)
   # Or manually:
   mongod
   
   # If mongod is not in PATH, find it in:
   # C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe
   ```

3. **Verify MongoDB is running:**
   - Check if port 27017 is listening
   - Or try: `mongosh` to connect to MongoDB shell

### Option 2: Use MongoDB Atlas (Cloud - Recommended for Quick Start)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster
4. Get your connection string
5. Update `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/never-have-i-ever
   ```

### Option 3: Use Docker (If you have Docker installed)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## After MongoDB is Running

1. **Seed the database:**
   ```bash
   cd backend
   node seedQuestions.js
   ```

2. **Restart your backend server:**
   ```bash
   npm run dev
   ```

3. **Check connection:**
   Visit: http://localhost:5000/api/health
   Should show: `"database": "connected"`

## Troubleshooting

- **Port 27017 in use?** Change MongoDB port or update MONGODB_URI
- **Firewall blocking?** Allow MongoDB through firewall
- **Connection string wrong?** Check your `.env` file
- **MongoDB not starting?** Check MongoDB logs for errors

