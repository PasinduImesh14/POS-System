# RealTimePOS - Point of Sale System

A modern, full-stack Point of Sale (POS) system built with React (TypeScript), Node.js, Express, and SQLite. Features a clean, responsive interface optimized for retail operations.

![POS System Screenshot](https://via.placeholder.com/800x500/3B82F6/FFFFFF?text=RealTimePOS+System)

## 🚀 Features

### Core Functionality
- **Product Management**: Browse products by category, search by name/barcode
- **Shopping Cart**: Add/remove items, adjust quantities, real-time totals
- **Payment Processing**: Support for cash, card, and digital payments
- **Transaction Management**: Complete sales processing with automatic inventory updates
- **User Authentication**: Secure login system with role-based access
- **Real-time Updates**: Live product availability and pricing

### Technical Features
- **Responsive Design**: Optimized for tablets, desktop, and touch devices
- **Modern UI/UX**: Clean interface matching professional POS standards
- **Real-time Inventory**: Automatic stock level updates after each sale
- **Transaction History**: Complete audit trail of all sales
- **Tax Calculations**: Automatic tax computation (8.25% default rate)
- **RESTful API**: Clean API design for scalability and integration

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Axios** for API communication
- **Context API** for state management

### Backend
- **Node.js** with Express.js
- **SQLite** database for data persistence
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **CORS** enabled for cross-origin requests

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **Git** (for cloning the repository)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd pos-system
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm run install:all
```

Or manually install:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup
Create environment file for backend:
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
DB_PATH=./database/pos.db
```

### 4. Initialize Database
```bash
cd backend
npm run init-db
```

This will create the SQLite database with sample data and a default admin user.

### 5. Start the Application

#### Option 1: Start Both Services (Recommended)
```bash
# From root directory
npm run dev
```

#### Option 2: Start Services Separately
```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm start
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🔐 Default Login Credentials

```
Email: admin@pos.com
Password: admin123
```

## 📱 Usage Guide

### 1. Login
- Navigate to the login page
- Use the demo credentials or create new user accounts
- The system supports both admin and cashier roles

### 2. Product Selection
- Browse products in the main grid
- Use category filters to narrow down products
- Search by product name or barcode
- Click products to add them to the cart

### 3. Cart Management
- View selected items in the right sidebar
- Adjust quantities with +/- buttons
- Remove individual items or clear entire cart
- View real-time totals including tax

### 4. Checkout Process
- Click "Checkout" to open payment modal
- Choose from cash, card, or digital payment methods
- Confirm transaction to complete the sale
- System automatically updates inventory

### 5. System Features
- Real-time clock and date display
- Employee information in header
- Online status indicator
- Stock level warnings for low inventory

## 🏗️ Architecture

### Database Schema
```sql
-- Core Tables
employees (id, name, email, password, role)
categories (id, name, color)
products (id, barcode, name, price, category_id, stock_quantity)
transactions (id, transaction_id, employee_id, subtotal, tax, total, payment_method)
transaction_items (id, transaction_id, product_id, quantity, unit_price, total_price)
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Products
- `GET /api/products` - List all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/barcode/:barcode` - Get product by barcode
- `POST /api/products` - Create new product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

#### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

#### Transactions
- `GET /api/transactions` - List transactions
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/reports/summary` - Sales summary

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# The built files will be in frontend/build/
# Backend serves these files in production mode
```

### Environment Variables
Set `NODE_ENV=production` for production deployment.

### Database
The SQLite database file will be created in `backend/database/pos.db`. Ensure this directory is writable and backed up regularly.

## 🔧 Configuration

### Tax Rate
Default tax rate is 8.25%. To change, update the `TAX_RATE` constant in:
- `frontend/src/contexts/CartContext.tsx`

### Currency Format
The system uses USD formatting. To change currency display, update the `formatPrice` functions in the components.

### Categories and Colors
Default categories and their colors can be modified in:
- `backend/scripts/initDatabase.js`

## 🧪 Testing

### Manual Testing Checklist
- [ ] User login/logout functionality
- [ ] Product browsing and filtering
- [ ] Cart operations (add, remove, quantity changes)
- [ ] Checkout process with different payment methods
- [ ] Inventory updates after sales
- [ ] Responsive design on different screen sizes

### API Testing
Use tools like Postman or curl to test API endpoints:
```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pos.com","password":"admin123"}'
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for security
- **SQL Injection Prevention**: Parameterized queries
- **Role-based Access**: Admin vs. cashier permissions

## 📈 Performance Optimizations

- **Efficient Queries**: Optimized database queries with proper indexing
- **Component Optimization**: React memo and efficient re-renders
- **Image Optimization**: Compressed assets and efficient loading
- **Code Splitting**: Organized component structure for maintainability

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure the database directory exists and is writable
   - Run `npm run init-db` in the backend directory

2. **CORS Errors**
   - Check that backend is running on port 5000
   - Verify frontend is connecting to correct API URL

3. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT_SECRET is set in environment variables

4. **Product Images Not Loading**
   - Images are currently placeholder-based
   - Implement image upload functionality if needed

### Logs
- Backend logs are displayed in the console
- Frontend errors appear in browser developer tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add some feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the API documentation

---

**Built with ❤️ for modern retail operations**