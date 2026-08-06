# CampusConnect Frontend

CampusConnect is a comprehensive web application designed to bridge the gap between college clubs and students. It provides a centralized platform for managing campus events, club activities, notices, and student engagement. 

## 🚀 Key Features Implemented

The frontend is fully built with role-based access control, catering to three main user types:

### 1. Admin Role
- **Admin Dashboard**: Overview of platform activities.
- **Student Management**: View, add, and manage registered students.
- **Club Management**: Approve, create, and oversee clubs on campus.
- **Global Notices & Events**: Broadcast notices and oversee all events.

### 2. Club Role
- **Club Dashboard**: Manage the club's presence on the platform.
- **Club Profile**: Update club details, logo, and descriptions.
- **Event Management**: Create, edit, and manage club events.
- **Notice Board**: Post notices specifically for club members or the general student body.
- **Member Management**: Manage students who have joined the club.

### 3. Student Role
- **Student Dashboard**: Personalized feed of upcoming events and notices.
- **Club Discovery**: Browse and join various campus clubs.
- **Events & Notices**: Stay updated with all ongoing campus and club-specific activities.
- **Student Chat**: Interact with peers and club convenors.
- **Profile Management**: Update personal information, bio, and avatars.

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS, Styled-components
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React
- **API Communication**: Axios
- **Authentication/DB**: Firebase (Frontend integration)
- **Image Optimization**: Browser Image Compression

## 📁 Project Structure

```text
src/
├── assets/         # Static assets (images, icons)
├── components/     # Reusable UI components (Headers, Buttons, Cards)
├── context/        # React Context for global state (Auth, Theme)
├── layouts/        # Layout wrappers for different roles
├── pages/          # Page components
│   ├── admin/      # Admin-specific pages (Dashboard, Clubs, Events, etc.)
│   ├── club/       # Club-specific pages (Dashboard, Profile, Notices, etc.)
│   ├── student/    # Student-specific pages (Dashboard, Chat, Clubs, etc.)
│   └── (shared)    # Home, Login, Register, Profile, NotFound
├── services/       # API integration functions
├── App.jsx         # Root component and Routing logic
└── main.jsx        # Entry point
```

## 🔐 Test Credentials (Clubs)

Here are the test email IDs and passwords for various clubs on the platform:

| Club Name | Email ID | Password |
| :--- | :--- | :--- |
| Technova Club | technova@college.edu.in | tech99747@ |
| Rhythm & Roots Club | rhythmandroots@college.edu.in | rhyt71246$ |
| Inkspire Literary Club | inkspire@college.edu.in | inks48298% |
| Champion's Arena Club | championsarena@college.edu.in | cham76867# |
| Scholars' Circle | scholarscircle@college.edu.in | scho22247# |

## ⚙️ Setup Instructions

1. **Clone the repository** (if not already done).
2. **Navigate to the frontend directory**:
   ```bash
   cd CampusConnect
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Environment Variables**:
   Create a `.env` file in the root of the frontend folder and add your Firebase config and Backend API URL (e.g., `VITE_API_BASE_URL=http://localhost:5000/api`).
5. **Start the development server**:
   ```bash
   npm run dev
   ```
