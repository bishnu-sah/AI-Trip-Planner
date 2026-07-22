<div align="center">

# ✈️ MARG AI

### Intelligent AI-Powered Trip Planning System

Generate personalized travel itineraries using **Google Gemini AI**, **Google Places API**, and a modern full-stack architecture.

Plan smarter journeys with AI-powered recommendations tailored to your destination, budget, travel duration, and interests.

<br>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Now-2563EB?style=for-the-badge)](YOUR_LIVE_LINK_HERE)

[![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)]
[![Backend](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js)]
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)]
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)]
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express)]
[![Google Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=for-the-badge)]
[![Google Places](https://img.shields.io/badge/API-Google_Places-34A853?style=for-the-badge)]

<br>

> **AI • Travel • Automation • Personalization • Modern Full-Stack Architecture**

</div>

---

# 🌍 Overview

MARG AI is an intelligent AI-powered travel planning platform that automates itinerary creation through Generative AI.

Instead of manually browsing multiple travel websites, users simply provide their destination, budget, travel duration, and personal interests. The system analyzes these preferences and instantly generates a personalized day-by-day travel itinerary.

The application integrates Google's Gemini AI with real-time location services to deliver accurate recommendations while maintaining a clean, scalable, and modular software architecture.

---

# 🚀 Why MARG AI?

Traditional travel planning requires users to browse multiple websites, compare destinations, calculate budgets, and manually organize schedules.

MARG AI solves these challenges by:

- 🤖 Automatically generating complete travel itineraries
- 📍 Providing location-aware recommendations
- 💬 Understanding natural language travel requests
- 💰 Creating plans based on budget
- 🗓️ Organizing trips day-by-day
- ⚡ Reducing planning time from hours to seconds

---

# ✨ Features

## 🤖 AI Features

- AI-powered itinerary generation
- Personalized travel recommendations
- Natural language trip planning
- Intelligent prompt engineering
- Context-aware responses
- Budget-aware recommendations

---

## 🌍 Travel Features

- Create personalized trips
- Day-wise itinerary generation
- Destination recommendations
- Tourist attraction suggestions
- Travel duration planning
- Interest-based recommendations

---

## 👤 User Features

- User Registration
- Secure Login
- JWT Authentication
- Password Encryption
- Trip History
- Saved Itineraries
- Edit Existing Trips
- Delete Trips

---

## 💬 AI Assistant

- Interactive Travel Chat
- Intelligent Suggestions
- Dynamic Prompt Generation
- Personalized Responses
- Real-time AI Recommendations

---

## 📄 Export Features

- Export Trip
- PDF Generation
- Structured Itinerary Output

---

## 🎨 Frontend Features

- Responsive Design
- Modern UI
- React Components
- TypeScript Support
- Tailwind CSS
- Fast Navigation
- Mobile Friendly
- Smooth User Experience

---

# 🏗 System Architecture

The project follows a **Layered Full-Stack Architecture**, ensuring separation of concerns, scalability, maintainability, and clean code organization.

```

                    User

                      │

              React Frontend

                      │

              Express Controllers

                      │

               Service Layer

                      │

      ┌───────────────┴───────────────┐
      │                               │

External APIs                    MongoDB DAO

      │                               │

Gemini AI                     User Collection

Google Places                 Trip Collection

Distance Matrix               Saved Trips

      │                               │

      └───────────────┬───────────────┘
                      │

               Final Trip Response

```

---

# 📋 Application Workflow

```

User Login

↓

Create Trip

↓

Frontend Validation

↓

Express API

↓

Business Logic

↓

Gemini AI

↓

Google Places API

↓

Distance Matrix API

↓

MongoDB Storage

↓

Generate Day-wise Itinerary

↓

Display Result

↓

Export PDF

```

---

# 🖥️ Screens

The application contains the following major pages:

- 🏠 Home
- 🔐 Login
- 📝 Signup
- ✈️ Create Trip
- 📅 Trip Details
- 💬 AI Chat Assistant
- 📂 Saved Trips
- 📄 Export PDF

---

# 🎯 Project Objectives

- Automate travel planning
- Generate AI-powered itineraries
- Improve personalization
- Reduce manual effort
- Provide real-time recommendations
- Deliver an intuitive user experience
- Build a scalable software architecture

---
# 🛠 Technology Stack

## Frontend

| Technology | Purpose |
|------------|---------|
| React | User Interface |
| TypeScript | Type Safety |
| Vite | Development & Build Tool |
| Tailwind CSS | Styling |
| React Router DOM | Client-side Routing |
| Context API | State Management |

---

## Backend

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | REST API Development |
| TypeScript | Backend Development |
| JWT | Authentication |
| bcrypt | Password Hashing |

---

## Database

| Technology | Purpose |
|------------|---------|
| MongoDB | Primary Database |
| Mongoose | MongoDB ODM |

---

## AI & External APIs

| Service | Purpose |
|---------|---------|
| Google Gemini API | AI-powered itinerary generation |
| Google Places API | Place recommendations |
| Google Distance Matrix API | Travel distance & duration |

---

# 🏛 Software Architecture

The application follows a **Layered Architecture**, separating responsibilities into independent modules for scalability and maintainability.

## Layers

### 🎨 Presentation Layer

Responsible for:

- Login
- Signup
- Create Trip
- View Trip
- Edit Trip
- Chat Assistant
- Export Trip

---

### ⚙️ Controller Layer

Handles incoming API requests.

Controllers include:

- AuthController
- TripController
- PlaceController
- ExportController

---

### 🧠 Service Layer

Contains the core business logic.

Services include:

- AuthService
- TripService
- PlaceService
- AIService
- DistanceService

---

### 📦 DAO Layer

Responsible for all database operations.

DAO Classes:

- UserDAO
- TripDAO
- PlaceCacheDAO

---

### 🌐 Adapter Layer

Acts as a bridge between external services.

Adapters:

- AI Adapter
- Places Adapter
- Distance Adapter

---

### 💾 Database Layer

MongoDB Collections:

- Users
- Trips
- Saved Itineraries

---

# 📂 Project Structure

```text
MargAI
│
├── frontend
│   ├── public
│   ├── src
│   │
│   ├── assets
│   ├── components
│   ├── pages
│   ├── layouts
│   ├── hooks
│   ├── services
│   ├── utils
│   ├── context
│   ├── App.tsx
│   └── main.tsx
│
├── backend
│   ├── src
│   │
│   ├── controllers
│   ├── services
│   ├── dao
│   ├── adapters
│   ├── middleware
│   ├── routes
│   ├── models
│   ├── utils
│   ├── config
│   └── server.ts
│
├── README.md
└── package.json
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/bishnu-sah/MargAI.git
```

---

## Navigate to Project

```bash
cd MargAI
```

---

## Install Dependencies

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd backend
npm install
```

---

## Configure Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_secret_key

GEMINI_API_KEY=your_gemini_api_key

GOOGLE_PLACES_API_KEY=your_google_places_api_key

GOOGLE_DISTANCE_MATRIX_API_KEY=your_distance_matrix_api_key
```

---

## Run Backend

```bash
npm run dev
```

---

## Run Frontend

```bash
npm run dev
```

---

# 🌐 API Integrations

The project integrates multiple external services.

## 🤖 Google Gemini AI

Used for:

- Intelligent itinerary generation
- Travel recommendations
- Natural language understanding
- Personalized travel planning

---

## 📍 Google Places API

Provides:

- Tourist attractions
- Place details
- Ratings
- Nearby locations
- Geographical information

---

## 🚗 Google Distance Matrix API

Calculates:

- Travel time
- Distance between places
- Route estimation

---

# 🗄 Database Design

MongoDB Collections

### 👤 Users

Stores:

- User Profile
- Login Credentials
- Authentication Details

---

### ✈️ Trips

Stores:

- Destination
- Budget
- Number of Days
- Interests
- AI Generated Itinerary

---

### 📁 Saved Itineraries

Stores

- Previous Trips
- Exported Plans
- User History

---

# 🔐 Authentication

The application uses **JWT Authentication**.

Security Features:

- Password Hashing using bcrypt
- Secure Login
- Protected Routes
- Token-based Authentication
- Session Management

---

# 📱 Responsive Design

Optimized for

- 💻 Desktop
- 🖥 Laptop
- 📱 Tablet
- 📲 Mobile

The UI automatically adapts to different screen sizes to ensure a seamless experience.

---

# ⚡ Performance Optimizations

- Fast Vite Bundling
- Lazy Loading
- Modular Components
- Optimized API Calls
- TypeScript Type Safety
- Clean Folder Structure
- Reusable Components
- Efficient Database Queries

---

# 💻 System Requirements

## Hardware

| Component | Requirement |
|-----------|-------------|
| Processor | Intel Core i3 or higher |
| RAM | Minimum 4 GB (8 GB Recommended) |
| Storage | 10 GB Free Space |
| Display | 1366×768 or higher |
| Internet | Required for AI & API Services |

---

## Software

| Requirement | Technology |
|-------------|------------|
| Operating System | Windows / macOS / Linux |
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB |
| Editor | VS Code |
| Browser | Chrome / Edge / Firefox |
---

# 📸 Screenshots

> Replace the placeholders below with screenshots of your application.

## 🏠 Home Page

<p align="center">
<img src="screenshots/home.png" width="900"/>
</p>

---

## 🔐 Login

<p align="center">
<img src="screenshots/login.png" width="900"/>
</p>

---

## ✈️ Create Trip

<p align="center">
<img src="screenshots/create-trip.png" width="900"/>
</p>

---

## 🤖 AI Generated Itinerary

<p align="center">
<img src="screenshots/itinerary.png" width="900"/>
</p>

---

## 💬 AI Chat Assistant

<p align="center">
<img src="screenshots/chat.png" width="900"/>
</p>

---

## 📄 Export PDF

<p align="center">
<img src="screenshots/export.png" width="900"/>
</p>

---

# 🎯 Key Functionalities

### 👤 User Authentication

- User Registration
- Secure Login
- JWT Authentication
- Password Encryption
- Protected Routes

---

### ✈️ Trip Management

- Create Trip
- Edit Trip
- Delete Trip
- View Saved Trips
- Store Previous Itineraries

---

### 🤖 AI Travel Assistant

- Personalized Recommendations
- AI-generated Travel Plans
- Natural Language Understanding
- Budget-aware Suggestions
- Day-wise Itinerary Generation

---

### 📍 Smart Location Services

- Google Places Integration
- Nearby Attractions
- Route Planning
- Distance Calculation
- Travel Time Estimation

---

### 📄 Export Features

- Download PDF
- Printable Itinerary
- Structured Travel Plan

---

# 🔄 Complete Data Flow

```text
User

      │

      ▼

React Frontend

      │

      ▼

REST API Request

      │

      ▼

Express Controllers

      │

      ▼

Business Services

      │

 ┌──────────────┬───────────────┐

 ▼              ▼               ▼

Gemini AI   Google Places   Distance Matrix

      │              │              │

      └───────┬──────┴──────────────┘

              ▼

      Trip Processing

              ▼

         MongoDB

              ▼

      Generate Itinerary

              ▼

      Display Response

              ▼

       Export PDF
```

---

# 🎨 UI Highlights

- ✨ Clean & Modern Interface
- 🌈 Elegant Color Palette
- 📱 Responsive Layout
- ⚡ Fast Page Rendering
- 🎭 Interactive Components
- 🧩 Reusable UI Components
- 🎯 User-friendly Navigation
- 💡 Minimal Design Philosophy

---

# 🚀 Future Roadmap

## Phase 1

- 🌤 Weather API Integration
- 🏨 Hotel Recommendations
- ✈ Flight Suggestions
- 📍 Live Maps
- 🗺 Interactive Route Visualization

---

## Phase 2

- 💳 Booking Integration
- 💰 Expense Tracker
- 📅 Calendar Synchronization
- 🔔 Trip Notifications
- 📤 Share Trip Plans

---

## Phase 3

- 🤖 AI Voice Assistant
- 🎙 Voice-based Trip Planning
- 🌐 Multi-language Support
- 📱 Mobile Application
- ☁ Cloud Synchronization

---

# 🤝 Contributing

Contributions are welcome!

If you'd like to improve this project:

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature/your-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to GitHub

```bash
git push origin feature/your-feature
```

5. Open a Pull Request

---

# ⭐ Project Highlights

- 🤖 AI Powered
- 🌍 Smart Travel Planning
- ⚡ Fast Performance
- 🔒 Secure Authentication
- 📱 Responsive Design
- 💾 MongoDB Database
- 🌐 Google APIs
- 🧩 Scalable Architecture
- 🎨 Modern UI
- 📄 PDF Export

---

# 📈 Future Scope

This project can be extended with:

- Hotel Booking
- Flight Reservation
- Restaurant Recommendations
- Weather Forecasting
- Currency Conversion
- AI Budget Optimization
- Offline Trip Access
- Travel Expense Analytics
- Social Trip Sharing
- Group Trip Planning

---

# 👨‍💻 Author

<div align="center">

## Bishnu Sah

**AI Engineer | Full Stack Developer | MCA Student**

</div>

### Connect with Me

**GitHub**

https://github.com/bishnu-sah

**LinkedIn**

https://linkedin.com/in/YOUR-LINKEDIN

**Portfolio**

https://YOUR-PORTFOLIO.com

---

# 🙏 Acknowledgements

Special thanks to:

- Google Gemini AI
- Google Places API
- Google Distance Matrix API
- MongoDB
- React
- Express.js
- TypeScript
- Tailwind CSS
- Vite

for providing the technologies that made this project possible.

---

# 📄 License

This project is licensed under the **MIT License**.

Feel free to use, modify, and distribute this project for educational and personal purposes.

---

# ⭐ Support

If you found this project useful, please consider giving it a **Star ⭐** on GitHub.

It motivates continued development and helps others discover the project.

---

<div align="center">

# ✈️ MARG AI

### Intelligent AI-Powered Trip Planning System

**Built with ❤️ using**

React • TypeScript • Node.js • Express.js • MongoDB • Google Gemini AI

---

### ⭐ Thanks for visiting this repository!

**Happy Coding 🚀**

</div>
