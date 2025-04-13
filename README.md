# Resume Builder

Resume Builder is a modern web application that allows users to create, manage, and export professional resumes. It leverages NeonDB for secure database management and provides a clean, user-friendly interface for building resumes efficiently.

## Features
- **User Authentication**: Secure login and registration using JWT.
- **Resume Creation**: Input personal, educational, and professional details.
- **Data Storage**: All user and resume data is stored in NeonDB.
- **PDF Export**: Download the completed resume as a print-ready PDF.
- **Responsive Design**: Fully responsive across desktops, tablets, and mobile devices.

## Tech Stack
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: TypeScript, NeonDB (PostgreSQL)
- **Authentication**: JSON Web Tokens (JWT)

## Installation & Setup

### Prerequisites
- Node.js (>=18)
- NeonDB account

### Steps

#### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/resume-builder.git
cd resume-builder
```

#### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Creating a NeonDB Database

1. Visit [NeonDB Console](https://console.neon.tech/app/welcome) and log in.
2. Click **Create a Database** and provide the following details:
   - **Name:** (Choose any suitable name)
   - **PostgreSQL Version:** `17`
   - **Region:** `AWS Singapore`
3. Click **Create** to initialize your database.

### Step 4: Obtaining the Connection String

After the database is created, click the "Connect" button.  
Select "Connection String" and choose **Next.js** as the platform.  
Copy the generated `.env` snippet.

### Step 5: Configuring the Project

Create a file named `.env.local` in the root directory.  
Paste the following into it:

DATABASE_URL=your-neondb-connection-string

JWT_SECRET=your-jwt-secret-key
*(Replace with actual values)*

### Step 6: Running the Project

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser to access the app.

## Hosted Link

The project is live at: [ResumeBuilder](https://resume-builder-iota-two.vercel.app)
