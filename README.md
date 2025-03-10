# Stationery Store Management System

## Overview
The **Stationery Store Management System** is a web-based application designed to enhance the operational efficiency of a retail store. It provides features such as secure authentication, product catalog management, checkout processing, and sales tracking. The system utilizes **PostgreSQL** as the database for managing essential data like product details, order history, and customer records.

## Features
- **User Authentication**: Secure login and session management using JWT and bcrypt.
- **Product Management**: Add, update, delete, and list products.
- **Cart & Checkout**: Manage user cart, checkout process, and order history.
- **Admin Panel**: Admins can manage the product catalog securely.
- **Database Integration**: Uses **PostgreSQL** for efficient data handling.
- **Secure Access Control**: Role-based access for customers and admins.
- **Dynamic Content Rendering**: Uses **EJS** templates for dynamic front-end rendering.

## Technology Stack
### **Frontend**
- HTML, CSS, JavaScript
- EJS (Embedded JavaScript)

### **Backend**
- Node.js with Express.js
- JSON for structured data exchange

### **Database**
- PostgreSQL for managing product, user, and order data

## Project Structure
```
📂 Stationery Store
│── 📁 config/              # Database configuration
│── 📁 controller/         # Business logic modules
│── 📁 middleware/         # Authentication middleware
│── 📁 router/             # Routing modules
│── 📁 views/              # EJS templates for frontend
│── 📁 public/             # Static assets (CSS, images)
│── app.js                # Main server file
│── package.json          # Project dependencies
```

## Installation & Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Kumar-Amitesh/Stationary-Store-Management.git
   cd stationery-store
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure **PostgreSQL** connection in `config/db.js`.
4. Start the server:
   ```bash
   npm start
   ```
5. Open `http://localhost:3000` in the browser.

## Usage
- **Users**: Can browse products, add to cart, checkout, and view order history.
- **Admins**: Can manage products through a secure admin panel.

## Future Enhancements
- Implementing **payment gateway** integration.
- Adding **order export** in CSV/Excel format.

---
**Note**: For detailed module descriptions, refer to the project documentation.

