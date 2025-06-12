# Technical Documentation

This document provides detailed technical information about the Resort Management System, including API endpoints, architecture, and implementation details.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [API Endpoints](#api-endpoints)
4. [Authentication](#authentication)
5. [Database Models](#database-models)
6. [Frontend Components](#frontend-components)

## Architecture Overview

The Resort Management System is a full-stack web application built with the MERN stack:

- **MongoDB**: Document database for storing application data
- **Express**: Backend web framework running on Node.js
- **React**: Frontend library for building the user interface
- **Node.js**: JavaScript runtime environment for the backend

The application follows a client-server architecture with a RESTful API connecting the frontend and backend. The design patterns used include:

- **MVC Pattern** on the backend (Models, Controllers, Views/Routes)
- **Component-Based Architecture** on the frontend
- **Context API** for state management
- **Repository Pattern** for data access

## Project Structure

### Backend Structure

```
backend/
├── controllers/     # Request handlers
├── middleware/      # Express middleware (auth, error handling, etc.)
├── models/          # Mongoose schema definitions
├── routes/          # API routes
├── services/        # Business logic
├── .env.example     # Environment variables template
├── package.json     # Dependencies and scripts
└── server.js        # Application entry point
```

### Frontend Structure

```
frontend/
├── public/          # Static assets
├── src/
│   ├── assets/      # Images, fonts, etc.
│   ├── components/  # Reusable UI components
│   │   ├── bookings/    # Booking-related components
│   │   ├── layout/      # Layout components
│   │   ├── reviews/     # Review-related components
│   │   ├── rooms/       # Room-related components
│   │   ├── services/    # Service-related components
│   │   └── ui/          # Generic UI components
│   ├── context/     # React Context providers
│   ├── pages/       # Page components
│   ├── App.jsx      # Main application component
│   ├── index.css    # Global styles
│   └── main.jsx     # Entry point
├── .env.example     # Environment variables template
├── package.json     # Dependencies and scripts
├── postcss.config.js # PostCSS configuration
├── tailwind.config.js # Tailwind CSS configuration
└── vite.config.js   # Vite configuration
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/auth/register` | Register new client | `{firstName, lastName, email, phone, password}` | `{success, token, data}` |
| POST | `/api/auth/login` | Login client | `{email, password}` | `{success, token, data}` |
| GET | `/api/auth/me` | Get current client | - | `{success, data}` |
| PUT | `/api/auth/updatedetails` | Update client details | `{firstName, lastName, email, phone}` | `{success, data}` |

### Rooms

| Method | Endpoint | Description | Request Body/Query Params | Response |
|--------|----------|-------------|---------------------------|----------|
| GET | `/api/rooms` | Get all rooms | Query params: `search, sort, page, limit, type, pricePerNight[gte], pricePerNight[lte], maxOccupancy[gte]` | `{success, count, pagination, data}` |
| GET | `/api/rooms/:id` | Get single room | - | `{success, data}` |
| POST | `/api/rooms` | Create new room (admin) | `{name, description, pricePerNight, type, maxOccupancy, size, amenities, images}` | `{success, data}` |
| PUT | `/api/rooms/:id` | Update room (admin) | `{name, description, pricePerNight, type, maxOccupancy, size, amenities, images}` | `{success, data}` |
| DELETE | `/api/rooms/:id` | Delete room (admin) | - | `{success, data}` |

### Bookings

| Method | Endpoint | Description | Request Body/Query Params | Response |
|--------|----------|-------------|---------------------------|----------|
| GET | `/api/bookings` | Get all bookings | Query params: `page, limit` | `{success, count, pagination, data}` |
| GET | `/api/bookings/:id` | Get single booking | - | `{success, data}` |
| POST | `/api/bookings` | Create booking | `{roomId, checkInDate, checkOutDate, guests}` | `{success, data}` |
| PUT | `/api/bookings/:id` | Update booking status | `{status}` | `{success, data}` |
| DELETE | `/api/bookings/:id` | Delete booking | - | `{success, data}` |

### Services

| Method | Endpoint | Description | Request Body/Query Params | Response |
|--------|----------|-------------|---------------------------|----------|
| GET | `/api/services` | Get all services | Query params: `search, page, limit` | `{success, count, pagination, data}` |
| GET | `/api/services/:id` | Get single service | - | `{success, data}` |
| POST | `/api/services` | Create new service (admin) | `{name, description, price, duration, images}` | `{success, data}` |
| PUT | `/api/services/:id` | Update service (admin) | `{name, description, price, duration, images}` | `{success, data}` |
| DELETE | `/api/services/:id` | Delete service (admin) | - | `{success, data}` |

### Service Orders

| Method | Endpoint | Description | Request Body/Query Params | Response |
|--------|----------|-------------|---------------------------|----------|
| GET | `/api/service-orders` | Get all service orders | Query params: `page, limit` | `{success, count, pagination, data}` |
| GET | `/api/service-orders/:id` | Get single service order | - | `{success, data}` |
| POST | `/api/service-orders` | Create service order | `{serviceId, appointmentDate, quantity, specialRequests}` | `{success, data}` |
| PUT | `/api/service-orders/:id` | Update service order status | `{status}` | `{success, data}` |
| DELETE | `/api/service-orders/:id` | Delete service order | - | `{success, data}` |

### Reviews

| Method | Endpoint | Description | Request Body/Query Params | Response |
|--------|----------|-------------|---------------------------|----------|
| GET | `/api/reviews` | Get all reviews | Query params: `roomId, page, limit` | `{success, count, pagination, data}` |
| GET | `/api/reviews/:id` | Get single review | - | `{success, data}` |
| POST | `/api/reviews` | Create review | `{roomId, rating, comment}` | `{success, data}` |
| PUT | `/api/reviews/:id` | Update review | `{rating, comment}` | `{success, data}` |
| DELETE | `/api/reviews/:id` | Delete review | - | `{success, data}` |

## Authentication

The application uses JWT (JSON Web Tokens) for authentication. When a client logs in, the server generates a token that is stored in the client's local storage and sent with subsequent API requests in the Authorization header.

### JWT Token Structure

The token contains:
- **Header**: Algorithm and token type
- **Payload**: Client ID and expiration time
- **Signature**: Verifies the token hasn't been tampered with

### Authentication Flow

1. Client sends login request with email and password
2. Server validates credentials and generates JWT token
3. Token is returned to client and stored in localStorage
4. Client includes token in Authorization header for protected routes
5. Server middleware validates token for protected routes

### Protection Middleware

The `protect` middleware in `middleware/auth.js` checks if the request has a valid token and attaches the client's information to the request object.

## Database Models

### Client

```javascript
{
  firstName: String,    // First name of the client
  lastName: String,     // Last name of the client
  email: String,        // Email address (unique)
  phone: String,        // Phone number
  password: String,     // Hashed password
  createdAt: Date       // Account creation date
}
```

### Room

```javascript
{
  name: String,              // Room name
  description: String,       // Detailed description
  pricePerNight: Number,     // Price per night
  type: String,              // Room type (standard, deluxe, suite, etc.)
  maxOccupancy: Number,      // Maximum number of guests
  size: Number,              // Room size in square meters
  amenities: [String],       // Array of amenities
  images: [String],          // Array of image URLs
  rating: Number,            // Average rating
  numReviews: Number,        // Number of reviews
  createdAt: Date            // Creation date
}
```

### Booking

```javascript
{
  room: ObjectId,            // Reference to Room
  client: ObjectId,          // Reference to Client
  checkInDate: Date,         // Check-in date
  checkOutDate: Date,        // Check-out date
  guests: Number,            // Number of guests
  totalPrice: Number,        // Total price
  status: String,            // Status (pending, confirmed, cancelled, completed)
  createdAt: Date            // Booking creation date
}
```

### Service

```javascript
{
  name: String,              // Service name
  description: String,       // Detailed description
  price: Number,             // Price per service
  duration: Number,          // Duration in minutes
  images: [String],          // Array of image URLs
  createdAt: Date            // Creation date
}
```

### ServiceOrder

```javascript
{
  service: ObjectId,         // Reference to Service
  client: ObjectId,          // Reference to Client
  appointmentDate: Date,     // Appointment date and time
  quantity: Number,          // Quantity of services
  totalPrice: Number,        // Total price
  specialRequests: String,   // Special requests
  status: String,            // Status (pending, confirmed, cancelled, completed)
  createdAt: Date            // Order creation date
}
```

### Review

```javascript
{
  room: ObjectId,            // Reference to Room
  client: ObjectId,          // Reference to Client
  rating: Number,            // Rating (1-5)
  comment: String,           // Review comment
  createdAt: Date            // Review creation date
}
```

## Frontend Components

### Core Components

- **AuthContext**: Manages authentication state and provides login/register functions
- **Header**: Navigation bar with dynamic menu based on auth state
- **Footer**: Site footer with links and information
- **PrivateRoute**: HOC for protecting routes that require authentication
- **Spinner**: Loading indicator for async operations

### Room Components

- **RoomCard**: Card displaying room summary information
- **BookingForm**: Form for booking a room
- **ReviewForm**: Form for submitting a review

### Service Components

- **ServiceCard**: Card displaying service summary information
- **ServiceOrderForm**: Form for ordering a service

### Page Components

- **Home**: Landing page with featured rooms and services
- **Rooms**: Listing of all rooms with search and filtering
- **RoomDetails**: Detailed view of a room with booking form
- **Services**: Listing of all services
- **Login/Register**: Authentication forms
- **Profile**: User profile management
- **Bookings**: List of user's bookings
- **ServiceOrders**: List of user's service orders 