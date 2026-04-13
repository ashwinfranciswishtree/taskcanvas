# Wishtree Creatives

A full-stack workflow management system for creative agencies.

## Setup Instructions

### 1. Database Setup
Ensure you have PostgreSQL installed and running. Create a database named `wishtree`.
If your credentials differ from the default (`postgres:postgres@localhost:5432/wishtree`), update the `.env` file in the `wishtree-backend` directory.

### 2. Backend Setup
1. Open a terminal and navigate to `wishtree-backend`:
   ```bash
   cd c:\clickup\wishtree-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the database schema and seed dummy users:
   ```bash
   node init_db.js
   ```
4. Start the server:
   ```bash
   npm start
   ```
   *(The backend runs on http://localhost:5000)*

### 3. Frontend Setup
1. Open a new terminal and navigate to `wishtree-frontend`:
   ```bash
   cd c:\clickup\wishtree-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *(The frontend runs on http://localhost:5173)*

## Demo Credentials
After running the initialization script (`node init_db.js`), you can log in with:
- **Admin**: `admin@wishtree.com` | Password: `password123`
- **Designer**: `designer@wishtree.com` | Password: `password123`
- **Manager**: `manager@wishtree.com` | Password: `password123`
- **Digital Marketer**: `dm@wishtree.com` | Password: `password123`
