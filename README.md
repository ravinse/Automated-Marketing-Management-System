# Automated Marketing Management System

A comprehensive full-stack application for managing marketing campaigns with role-based access control, customer segmentation using machine learning, and real-time performance tracking.

## 🚀 Features

### Role-Based Access Control
- **Owner**: Strategic overview, campaign performance monitoring, and executive dashboard
- **Marketing Manager**: Campaign approval, performance analytics, and team oversight
- **Team Member**: Campaign creation, template management, and feedback submission

### Core Functionality
- **Campaign Management**: Create, review, approve, and track marketing campaigns
- **Campaign Execution**: 🆕 Automatically send emails and SMS to filtered customers
- **Customer Segmentation**: ML-powered customer segmentation using RFM (Recency, Frequency, Monetary) analysis
- **Template System**: Reusable campaign templates for efficient workflow
- **Feedback System**: Collect and analyze campaign performance feedback
- **Automated Scheduling**: Auto-complete expired campaigns with built-in scheduler
- **Performance Dashboards**: Real-time analytics and KPI tracking
- **Email & SMS Integration**: 🆕 Send personalized emails and SMS to targeted customer segments

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router DOM** - Navigation and routing
- **Tailwind CSS** - Utility-first styling
- **Material Tailwind** - Pre-built UI components
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email service for campaigns
- **Twilio** - SMS service (optional)

### Machine Learning
- **Python 3** - ML runtime
- **Pandas** - Data manipulation
- **Scikit-learn** - Machine learning algorithms
- **NumPy** - Numerical computing

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/ravinse/Automated-Marketing-Management-System.git
cd Automated-Marketing-Management-System
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (or copy from .env.example)
cp .env.example .env
# Edit .env and configure:
# - MongoDB connection
# - Email service for campaign execution
# - SMS service (optional, for SMS campaigns)

# Seed database (optional)
node seedUser.js
node seedFeedback.js

# Start backend server
npm start
# For development with auto-reload
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Machine Learning Setup

```bash
cd ml

# Install Python dependencies
pip install -r requirements.txt

# Run data cleaning (if needed)
python clean_posdata.py

# The ML models will be called automatically by the backend when needed
```

## 📁 Project Structure

```
Automated-Marketing-Management-System/
├── backend/                 # Node.js/Express backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Business logic
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication & validation
│   ├── utils/              # Helper functions
│   └── uploads/            # File uploads directory
├── frontend/               # React frontend
│   ├── src/
│   │   ├── admin/          # Admin dashboard components
│   │   ├── owner/          # Owner dashboard components
│   │   ├── Marketingmanager/ # Manager components
│   │   ├── team member/    # Team member components
│   │   ├── components/     # Shared components
│   │   └── Login/          # Authentication pages
│   └── public/             # Static assets
├── ml/                     # Machine learning module
│   ├── clean_posdata.py    # Data cleaning script
│   ├── data_cleaning.py    # ML data preprocessing
│   └── requirements.txt    # Python dependencies
├── db/                     # Database seeds/samples
└── output/                 # ML output files
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/:id` - Get campaign by ID
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `PATCH /api/campaigns/approve/:id` - Approve campaign
- `PATCH /api/campaigns/reject/:id` - Reject campaign
- `POST /api/campaigns/execute/:id` - 🆕 Execute campaign (send emails/SMS)

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Add new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Templates
- `GET /api/templates` - Get all templates
- `POST /api/templates` - Create template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Feedback
- `GET /api/feedback` - Get all feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/:id` - Get feedback by ID

### Users
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user

## 🎯 Default User Roles

After seeding the database, you can login with:

- **Owner**: owner@example.com
- **Marketing Manager**: manager@example.com
- **Team Member**: team@example.com

(Check `seedUser.js` for default passwords)

## 🔄 Workflow

1. **Team Member** creates a campaign and submits for approval
2. **Marketing Manager** reviews and either approves or requests resubmission with notes
3. If rejected, **Team Member** sees manager's feedback and can edit & resubmit
4. **Manager** can approve campaigns to go live
5. 🆕 **Execute Campaign** - Automatically send emails and SMS to filtered customers
6. Campaigns automatically complete when end date is reached
7. **Owner** monitors overall performance and strategic metrics
8. All stakeholders can submit feedback on campaign performance

## 📧 Campaign Execution

The system now supports automatic email and SMS sending to targeted customers! 

**Quick Start:**
1. Configure email settings in `.env` (required for email campaigns)
2. Optionally configure Twilio for SMS campaigns
3. Create a campaign with target customers and content
4. Execute the campaign to send emails/SMS automatically

For detailed setup instructions, see:
- **[Campaign Execution Quick Start](./CAMPAIGN_EXECUTION_README.md)** - Get started quickly
- **[Campaign Execution Guide](./CAMPAIGN_EXECUTION_GUIDE.md)** - Comprehensive documentation

## 🤖 Machine Learning Features

The system includes customer segmentation using:
- **RFM Analysis** (Recency, Frequency, Monetary)
- **K-Means Clustering** for customer grouping
- **Data cleaning and preprocessing** for accurate results
- **JSON export** of customer segments for campaign targeting

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production

#### Frontend
```bash
cd frontend
npm run build
```

#### Backend
```bash
cd backend
npm start
```

## 📝 Environment Variables

### Backend (.env)
```env
# Server
PORT=5001
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/marketing-system

# Authentication
JWT_SECRET=your_secret_key

# Email Service (for campaign execution)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Marketing Management System

# SMS Service (optional, for SMS campaigns)
# TWILIO_ACCOUNT_SID=your_account_sid
# TWILIO_AUTH_TOKEN=your_auth_token
# TWILIO_PHONE_NUMBER=+1234567890

# Frontend
FRONTEND_URL=http://localhost:5174
```

See `.env.example` for a complete template.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- **ravinse** - [GitHub Profile](https://github.com/ravinse)

## 🐛 Known Issues

- Ensure MongoDB is running before starting the backend
- File uploads require proper directory permissions
- Email functionality requires valid SMTP credentials

## 📞 Support

For support, email your-email@example.com or open an issue in the GitHub repository.

## 🎓 Acknowledgments

- Built with modern web technologies
- Inspired by real-world marketing automation needs
- ML algorithms based on industry-standard customer segmentation techniques

---

**Built with ❤️ for efficient marketing campaign management**
