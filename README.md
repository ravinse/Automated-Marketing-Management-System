# 🚀 Automated Marketing Management System

A comprehensive full-stack marketing automation platform with intelligent customer segmentation, campaign management, and multi-channel communication capabilities.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-green.svg)](https://www.mongodb.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Railway Deployment](#railway-deployment)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Workflow](#workflow)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The Automated Marketing Management System is a powerful, enterprise-grade solution designed to streamline marketing operations through intelligent automation. It combines role-based access control, machine learning-powered customer segmentation, and automated multi-channel campaign execution to help businesses maximize their marketing ROI.

### Key Capabilities

- **Intelligent Segmentation**: ML-powered RFM (Recency, Frequency, Monetary) analysis for targeted customer grouping
- **Multi-Channel Campaigns**: Email and SMS campaign execution with automated scheduling
- **Role-Based Workflows**: Structured approval processes with owner, manager, and team member roles
- **Real-Time Analytics**: Comprehensive performance dashboards and KPI tracking
- **Template Management**: Reusable campaign templates for operational efficiency

---

## ✨ Features

### 🔐 Role-Based Access Control

| Role | Capabilities |
|------|--------------|
| **Owner** | Strategic oversight, performance monitoring, executive dashboard access |
| **Marketing Manager** | Campaign approval, team oversight, analytics review, performance tracking |
| **Team Member** | Campaign creation, template management, feedback submission |

### 🎨 Core Functionality

- ✅ **Campaign Lifecycle Management** - Create, review, approve, execute, and track campaigns
- 📊 **Automated Customer Segmentation** - ML-driven RFM analysis and K-Means clustering
- 📧 **Multi-Channel Communication** - Email and SMS campaign execution
- 📝 **Template System** - Pre-built, reusable campaign templates
- 💬 **Feedback & Analytics** - Real-time performance tracking and feedback collection
- ⏰ **Smart Scheduling** - Automated campaign execution and completion
- 🎯 **Targeted Marketing** - Segment-based customer targeting
- 📈 **Performance Dashboards** - Role-specific analytics and insights
- 📧 **Professional Email Design** ⭐ **NEW** - Beautiful, responsive HTML email templates with automatic enhancement

### 📧 Email Template System ⭐ **NEW**

Campaign emails are automatically enhanced with professional HTML templates:

- ✨ **Auto-Enhancement** - Plain text automatically wrapped in beautiful HTML
- 🎨 **Professional Design** - Gradient headers, proper spacing, modern typography
- 📱 **Mobile Responsive** - Adapts perfectly to all screen sizes
- 🔘 **Smart CTA Buttons** - Eye-catching call-to-action buttons added automatically
- 📊 **Built-in Tracking** - Open and click tracking integrated seamlessly
- 🎭 **Multiple Templates** - Default, Promotional, Newsletter, Product Launch, Event Invitation
- 💼 **Email Client Compatible** - Works perfectly in Gmail, Outlook, Apple Mail, and more

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI framework with hooks and concurrent features
- **Vite** - Lightning-fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Material Tailwind** - Premium UI component library
- **Recharts** - Powerful data visualization
- **Axios** - Promise-based HTTP client
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js & Express.js** - High-performance server framework
- **MongoDB & Mongoose** - NoSQL database with elegant ODM
- **JWT & bcryptjs** - Secure authentication and password hashing
- **Multer** - Multipart file upload handling
- **Nodemailer** - Email service integration
- **node-cron** - Job scheduling for automated tasks
- **Twilio** - SMS service integration (optional)

### Machine Learning
- **Python 3** - ML runtime environment
- **Pandas** - Data manipulation and analysis
- **Scikit-learn** - Machine learning algorithms
- **NumPy** - Numerical computing library

---

## 📋 Prerequisites

Ensure you have the following installed on your system:

- **Node.js** v16.0.0 or higher ([Download](https://nodejs.org/))
- **Python** v3.8 or higher ([Download](https://www.python.org/))
- **MongoDB** v4.4 or higher ([Download](https://www.mongodb.com/try/download/community))
- **npm** v7+ or **yarn** v1.22+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

---

## 🔧 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ravinse/Automated-Marketing-Management-System.git
cd Automated-Marketing-Management-System
```

### 2️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor

# Start the backend server
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5001`

### 3️⃣ Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend application will be available at `http://localhost:5173`

### 4️⃣ Machine Learning Setup

```bash
# Navigate to ML directory (from project root)
cd ml

# Install Python dependencies
pip install -r requirements.txt

# Verify installation
python --version
python -c "import pandas, sklearn, numpy; print('ML dependencies installed successfully')"
```

### 5️⃣ Quick Start Script

For convenience, you can use the provided startup script:

```bash
# From project root
chmod +x start_all.sh
./start_all.sh
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following configuration:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/marketing-system

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Email Service Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Marketing Management System

# SMS Service Configuration (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Email Setup (Gmail Example)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password: [Google Account Settings](https://myaccount.google.com/apppasswords)
3. Use the generated password in `EMAIL_PASSWORD`

### SMS Setup (Twilio - Optional)

1. Create a Twilio account: [Twilio Console](https://www.twilio.com/console)
2. Get your Account SID and Auth Token
3. Purchase a phone number
4. Add credentials to `.env`

---

## 🚀 Usage

### Starting the Application

1. **Start MongoDB** (if not running):
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

2. **Start Backend**:
   ```bash
   cd backend
   npm start
   ```

3. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001

### Default Login Credentials

After initial setup, use these credentials to log in:

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@example.com | Check `backend/seedUser.js` |
| Marketing Manager | manager@example.com | Check `backend/seedUser.js` |
| Team Member | team@example.com | Check `backend/seedUser.js` |

⚠️ **Important**: Change these credentials in production!

---

## 📁 Project Structure

```
Automated-Marketing-Management-System/
├── 📂 backend/                   # Node.js/Express backend
│   ├── 📂 config/               # Database and app configuration
│   │   └── db.js               # MongoDB connection setup
│   ├── 📂 controllers/          # Business logic layer
│   │   ├── campaignController.js
│   │   ├── customerController.js
│   │   ├── feedbackController.js
│   │   ├── segmentationController.js
│   │   └── templateController.js
│   ├── 📂 models/               # Mongoose schemas
│   │   ├── Campaign.js
│   │   ├── Customer.js
│   │   ├── Feedback.js
│   │   ├── Template.js
│   │   └── User.js
│   ├── 📂 routes/               # API endpoints
│   │   ├── auth.js
│   │   ├── campaigns.js
│   │   ├── customers.js
│   │   ├── feedback.js
│   │   ├── segmentation.js
│   │   ├── templates.js
│   │   └── users.js
│   ├── 📂 middleware/           # Express middleware
│   │   └── authMiddleware.js
│   ├── 📂 utils/                # Helper functions
│   │   ├── autoSegmentation.js
│   │   ├── campaignScheduler.js
│   │   ├── emailService.js
│   │   ├── smsService.js
│   │   └── generatePassword.js
│   ├── 📂 uploads/              # File upload directory
│   ├── index.js                # Application entry point
│   └── package.json
│
├── 📂 frontend/                 # React frontend
│   ├── 📂 src/
│   │   ├── 📂 admin/           # Admin dashboard
│   │   ├── 📂 owner/           # Owner dashboard
│   │   ├── 📂 Marketingmanager/ # Manager dashboard
│   │   ├── 📂 team member/     # Team member dashboard
│   │   ├── 📂 components/      # Shared components
│   │   ├── 📂 Login/           # Authentication UI
│   │   ├── api.js             # API client
│   │   ├── App.jsx            # Root component
│   │   └── main.jsx           # Entry point
│   ├── 📂 public/              # Static assets
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── 📂 ml/                       # Machine Learning module
│   ├── clean_posdata.py        # Data preprocessing
│   ├── data_cleaning.py        # ML data pipeline
│   └── requirements.txt        # Python dependencies
│
├── start_all.sh                # Quick start script
└── README.md                   # This file
```

---

## � API Documentation

### Base URL
```
http://localhost:5001/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |

### Campaign Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/campaigns` | Get all campaigns | Yes |
| POST | `/campaigns` | Create new campaign | Yes |
| GET | `/campaigns/:id` | Get campaign by ID | Yes |
| PUT | `/campaigns/:id` | Update campaign | Yes |
| DELETE | `/campaigns/:id` | Delete campaign | Yes |
| PATCH | `/campaigns/approve/:id` | Approve campaign | Yes (Manager) |
| PATCH | `/campaigns/reject/:id` | Reject campaign | Yes (Manager) |
| POST | `/campaigns/execute/:id` | Execute campaign (send emails/SMS) | Yes (Manager) |

### Customer Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/customers` | Get all customers | Yes |
| POST | `/customers` | Add new customer | Yes |
| GET | `/customers/:id` | Get customer by ID | Yes |
| PUT | `/customers/:id` | Update customer | Yes |
| DELETE | `/customers/:id` | Delete customer | Yes |
| POST | `/customers/import` | Bulk import customers | Yes |

### Segmentation Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/segmentation` | Get all segments | Yes |
| POST | `/segmentation/analyze` | Run ML segmentation | Yes |
| GET | `/segmentation/:id/customers` | Get customers in segment | Yes |

### Template Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/templates` | Get all templates | Yes |
| POST | `/templates` | Create template | Yes |
| GET | `/templates/:id` | Get template by ID | Yes |
| PUT | `/templates/:id` | Update template | Yes |
| DELETE | `/templates/:id` | Delete template | Yes |

### Feedback Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/feedback` | Get all feedback | Yes |
| POST | `/feedback` | Submit feedback | Yes |
| GET | `/feedback/campaign/:id` | Get feedback for campaign | Yes |

---

## 🔄 Workflow

### Campaign Creation & Approval Process

```
1. Team Member creates campaign
   ↓
2. Campaign submitted for review
   ↓
3. Marketing Manager reviews
   ↓
   ├─→ Approved → Campaign goes live → Can be executed
   │
   └─→ Rejected → Team Member receives feedback
              ↓
              Team Member edits and resubmits
              ↓
              Back to step 3
```

### Campaign Execution Flow

```
1. Approved campaign ready for execution
   ↓
2. Manager triggers campaign execution
   ↓
3. System filters customers by segment
   ↓
4. Automated emails/SMS sent to targeted customers
   ↓
5. Campaign metrics tracked in real-time
   ↓
6. Campaign auto-completes on end date
   ↓
7. Owner reviews performance analytics
```

---

## 🧪 Development

### Running in Development Mode

**Backend with auto-reload:**
```bash
cd backend
npm run dev  # Uses nodemon for hot reload
```

**Frontend with hot module replacement:**
```bash
cd frontend
npm run dev  # Vite HMR enabled
```

### Building for Production

**Frontend production build:**
```bash
cd frontend
npm run build

# Preview production build
npm run preview
```

**Backend production:**
```bash
cd backend
NODE_ENV=production npm start
```

### Code Linting

**Frontend:**
```bash
cd frontend
npm run lint
```

---

## 🤖 Machine Learning Features

The system includes intelligent customer segmentation powered by machine learning:

### RFM Analysis
- **Recency**: How recently did the customer make a purchase?
- **Frequency**: How often do they purchase?
- **Monetary**: How much do they spend?

### Segmentation Algorithm
1. Data preprocessing and cleaning
2. RFM score calculation
3. K-Means clustering for customer grouping
4. Segment profiling and labeling
5. JSON export for campaign targeting

### Usage
```python
# From ml directory
python data_cleaning.py

# Output: Customer segments exported to JSON
# Automatically integrated with backend API
```

---

## 🚂 Railway Deployment

### Quick Start

Deploy your application to Railway without crashes! We've optimized the backend to work perfectly with Railway's infrastructure.

**📚 Comprehensive Guides:**
- **[RAILWAY_FIX_SUMMARY.md](RAILWAY_FIX_SUMMARY.md)** - Overview of the deployment solution
- **[RAILWAY_CHECKLIST.md](RAILWAY_CHECKLIST.md)** - Step-by-step deployment checklist
- **[RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)** - Detailed deployment guide
- **[RAILWAY_ARCHITECTURE.md](RAILWAY_ARCHITECTURE.md)** - Architecture diagrams and explanations
- **[RAILWAY_QUICK_START.md](RAILWAY_QUICK_START.md)** - Quick reference

### The Problem (Fixed!)

The backend was crashing on Railway due to internal schedulers running every minute. This has been **completely fixed** by using Railway's Cron Jobs instead.

### Key Changes

✅ **Environment Variable Control** - `ENABLE_SCHEDULERS` to control internal schedulers  
✅ **Cron API Endpoints** - New `/api/cron/*` endpoints for scheduled tasks  
✅ **Railway Cron Jobs** - External scheduling instead of internal timers  
✅ **Improved Stability** - No more crashes from background processes  
✅ **Better Resource Usage** - Optimized for Railway's platform  

### Quick Deploy Steps

1. **Set environment variables in Railway:**
   ```env
   ENABLE_SCHEDULERS=false
   CRON_SECRET=your_secure_random_string
   # ... other required variables
   ```

2. **Deploy backend service** (will be stable now!)

3. **Set up Railway Cron Job** to call:
   ```
   GET https://your-backend.railway.app/api/cron/all?secret=YOUR_CRON_SECRET
   ```
   Every 5 minutes: `*/5 * * * *`

4. **Done!** Your application will run stably without crashes.

### Testing

```bash
# Test cron endpoint
curl "https://your-backend.railway.app/api/cron/health"

# Trigger scheduled tasks manually
curl "https://your-backend.railway.app/api/cron/all?secret=YOUR_SECRET"
```

**Need detailed instructions?** Check the deployment guides linked above!

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
   ```bash
   # Click 'Fork' on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/Automated-Marketing-Management-System.git
   cd Automated-Marketing-Management-System
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

4. **Make your changes and commit**
   ```bash
   git add .
   git commit -m 'Add some AmazingFeature'
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/AmazingFeature
   ```

6. **Open a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Describe your changes

### Development Guidelines

- Follow existing code style and conventions
- Write clear commit messages
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👥 Author

**Ravinse**
- GitHub: [@ravinse](https://github.com/ravinse)
- Repository: [Automated-Marketing-Management-System](https://github.com/ravinse/Automated-Marketing-Management-System)

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
```bash
# Ensure MongoDB is running
brew services start mongodb-community  # macOS
sudo systemctl start mongod           # Linux
```

**Port Already in Use:**
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or change PORT in backend/.env
```

**Email Not Sending:**
- Verify Gmail App Password is correct
- Check firewall settings
- Ensure 2FA is enabled on Gmail

**Frontend Build Errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Support

- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/ravinse/Automated-Marketing-Management-System/issues)
- 📖 Documentation: [Wiki](https://github.com/ravinse/Automated-Marketing-Management-System/wiki)

---

## 🎓 Acknowledgments

- Built with modern web development best practices
- Inspired by enterprise marketing automation platforms
- ML algorithms based on industry-standard RFM analysis
- Community-driven open-source project

---

## 🌟 Show Your Support

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🍴 Forking for your own use
- 🐛 Reporting issues
- 💡 Suggesting new features
- 🤝 Contributing code

---

**Built with ❤️ for efficient marketing campaign management**

*Last Updated: October 2025*
