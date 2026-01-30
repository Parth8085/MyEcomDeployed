# Electronic E-Commerce Web Application

A full-stack e-commerce solution inspired by 91mobiles, built with a modern tech stack.

## Tech Stack

- **Frontend**: React, Vite, Axios, React Router, Vanilla CSS
- **Backend**: ASP.NET Core Web API 8.0, Entity Framework Core
- **Database**: MySQL
- **Security**: JWT Authentication, Role-based Authorization

## Prerequisites

- .NET 8.0 SDK
- Node.js (v16+)
- MySQL Server

## Getting Started

### Backend

1. Navigate to the `backend` directory.
2. Update `appsettings.json` with your MySQL connection string.
3. specific `ConnectionStrings:DefaultConnection`.
4. Apply database migrations:
   ```bash
   dotnet ef database update
   ```
5. Run the API:
   ```bash
   dotnet run
   ```
   The API will be available at `http://localhost:5000` (or the port specified in launchSettings.json).
   Swagger UI will be at `http://localhost:5000/swagger`.

### Frontend

1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the displayed URL (usually `http://localhost:5173`).

## Features

- **User**: Browse products, search, filter, add to cart (simulated), place orders.
- **Admin**: (API endpoints ready) Manage products.

## Architecture

- **Clean Architecture**: Use of Controllers, DTOs (planned), Repository pattern (via DbContext).
- **Security**: JWT based auth.

## Project Structure

```
electronic-ecommerce/
├── backend/            # ASP.NET Core API
│   ├── Controllers/
│   ├── Data/          # DbContext & Migrations
│   ├── Models/        # Entity Models
│   └── Program.cs     # App Configuration
├── frontend/           # React App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/  # API calls
│   │   └── App.jsx
└── README.md
```
