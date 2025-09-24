# WanderWeave – Tour Booking Platform

WanderWeave is a **tour booking system** designed for users, admins, and tour managers.  
It allows users to explore tours, make secure bookings, view locations, and track reservations in real time.  
Admins and tour operators can manage tours, bookings, and users through a role-based system.  

---

## Features

- **Role Management** – Supports Users, Admins, and Tour Managers with role-based access control.  
- **Authentication & Security** – OTP verification and JWT-based login for secure access.  
- **Interactive Maps** – Integrated Mapbox to view and explore tour locations.  
- **Payments** – Stripe integration for secure and seamless online payments.  
- **RESTful APIs** – For tours, bookings, and user management.  
- **Booking Management** – Users can browse tours, book them, and track bookings in real time.  
- **Data Management** – Stored and managed data efficiently using MongoDB.  

---

## Tech Stack

- **Frontend:** Pug 
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB, Mongoose  
- **Authentication:** JWT
- **Payments:** Stripe  
- **Maps:** Mapbox    

---

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/wanderweave.git](https://github.com/mobin04/wonderweave.git
   cd wanderweave

2. **Install dependencies**
   ```bash
   npm install
3. **Set up environment variables**
-  Create a .env file in the root directory and configure:
   ```bash
   PORT=8000
   NODE_ENV=development
   DATABASE=<your-value>
   DATABASE_LOCAL=<your-value>
   DATABASE_PASSWORD=<your-value>
    
   # JWT CONFIGURATION
   JWT_SECRET=<your-value>
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90
    
   # MAILTRAP(DEVELOPEMENT) CONFIGURATION
   EMAIL_USERNAME=<your-value>
   EMAIL_PASSWORD=<your-value>
   EMAIL_HOST=sandbox.smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_FROM=<your-value>
    
   # PUBLIC AND PRIVATE KEYS FOR THE MAILJET EMAIL SERVICE(PRODUCTION)
   MJ_API_KEY_PUBLIC=<your-value>
   MJ_API_KEY_PRIVATE=<your-value>
   EMAIL_FROM_ME=<your-value>
    
   # STRIPE TEST API KEYS.
   STRIPE_SECRET_KEY=<your-value>

    
   # STRIPE WEBHOOK SECRET.
   STRIPE_WEBHOOK_SECRET=<your-value>
   
4. **Run the application**
   ```bash
   npm run dev
   
## ✨ HAPPY BUILDING ✨
