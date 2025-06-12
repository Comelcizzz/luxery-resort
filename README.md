# Resort Management System

A full-featured full-stack web application for a resort website with hotel rooms and additional services.

## Features

- 🏨 Browse rooms with filtering and sorting
- 🔍 Search functionality for rooms and services
- 📅 Room booking and management
- 🧖‍♀️ Service booking and management
- ⭐ Leave reviews for rooms
- 👤 User authentication and profile management
- 📱 Fully responsive design
- 🔒 JWT-based authentication

## Tech Stack

### Frontend
- React
- TailwindCSS
- React Router
- Axios
- React Hook Form
- React Icons
- React Hot Toast

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing

## Project Structure

```
/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Context API setup
│   │   ├── pages/            # Page components
│   │   └── ...
│   └── ...
│
└── backend/                  # Node.js backend
    ├── controllers/          # Request handlers
    ├── middleware/           # Express middleware
    ├── models/               # Mongoose models
    ├── routes/               # API routes
    ├── services/             # Business logic
    └── ...
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB

### Setup

1. Clone the repository
   ```
   git clone <repository-url>
   cd resort-management-system
   ```

2. Install Backend Dependencies
   ```
   cd backend
   npm install
   ```

3. Install Frontend Dependencies
   ```
   cd ../frontend
   npm install
   ```

4. Set up Environment Variables
   - Create a `.env` file in the backend directory (copy from `.env.example`)
   - Create a `.env` file in the frontend directory (copy from `.env.example`)

## Admin Access

The system has two administrative roles:

1. **Admin**: Full access to all administrative features
   - Can create, update, and delete rooms and services
   - Can manage bookings and service orders
   - Can manage users

2. **Staff**: Limited administrative access
   - Can update rooms and services (but cannot create or delete them)
   - Can manage bookings and service orders

The system automatically assigns roles in the following cases:
- The first registered user automatically becomes an admin
- Any user with an email ending with "@admin.com" is automatically assigned admin privileges
- Any user with an email ending with "@staff.com" is automatically assigned staff privileges

To access the admin dashboard, users with admin or staff roles can click on "Admin Dashboard" in their profile dropdown menu.

## Running the Application

### Development Mode

1. Start the Backend Server
   ```
   cd backend
   npm run dev
   ```

2. Start the Frontend Development Server
   ```
   cd frontend
   npm run dev
   ```

### Production Mode

1. Build the Frontend
   ```
   cd frontend
   npm run build
   ```

2. Start the Backend Server
   ```
   cd backend
   npm start
   ```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/updatedetails` - Update user details

### Room Endpoints
- `GET /api/rooms` - Get all rooms (with filtering & pagination)
- `GET /api/rooms/:id` - Get single room
- `POST /api/rooms` - Create new room (admin)
- `PUT /api/rooms/:id` - Update room (admin)
- `DELETE /api/rooms/:id` - Delete room (admin)

### Booking Endpoints
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking status
- `DELETE /api/bookings/:id` - Delete booking

### Service Endpoints
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get single service
- `POST /api/services` - Create new service (admin)
- `PUT /api/services/:id` - Update service (admin)
- `DELETE /api/services/:id` - Delete service (admin)

### Service Order Endpoints
- `GET /api/service-orders` - Get all service orders
- `GET /api/service-orders/:id` - Get single service order
- `POST /api/service-orders` - Create service order
- `PUT /api/service-orders/:id` - Update service order status
- `DELETE /api/service-orders/:id` - Delete service order

### Review Endpoints
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/:id` - Get single review
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## Deployment

The application can be deployed on various platforms:

- Frontend: Vercel, Netlify, or any static hosting
- Backend: Render, Railway, Heroku
- Database: MongoDB Atlas

## License

[MIT](LICENSE) 