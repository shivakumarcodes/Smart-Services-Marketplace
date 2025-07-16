# 🛠️ Smart Services Marketplace

DeployedLink : https://smart-services-marketplace.vercel.app

A full-stack web application that connects service seekers with skilled professionals across various domains such as home services, repair, cleaning, and more. Users can search, book, and review service providers, while admins and providers manage services and bookings efficiently.

## 🚀 Features

### 👤 User Side
- User Registration & Login (JWT Auth)
- Browse and search services by location & category
- Book services with preferred date/time
- Leave reviews and ratings after service completion
- Responsive UI with modern UX

### 👨‍🔧 Service Provider Side
- Provider Registration & Login
- Add, edit, and manage offered services
- Accept or decline bookings
- View reviews and ratings from customers

### 🛡️ Admin Panel
- Dashboard overview with KPIs
- Manage users and providers
- Approve or reject service providers
- Moderate reviews and service listings
- System settings management

---

## 🧱 Tech Stack

### Frontend
- **React.js**
- **React Router DOM**
- **Axios**
- **Context API**
- **AOS (Animate on Scroll)**

### Backend
- **Node.js**
- **Express.js**
- **JWT Authentication**
- **bcrypt for password hashing**

### Database
- **MySQL** with **UUIDs**

### Other
- **Cloudinary** for image uploads
- **CORS**, **Helmet** for security
- **Vite**

---

## 📦 Installation & Running Locally

### 📁 Clone the Repository

```bash
git clone https://github.com/shivakumarcodes/Smart-Services-Marketplace.git
cd smart-services-marketplace

🔧 Backend Setup (/server)
cd server
npm install
node index.js

💻 Frontend Setup (/client)
cd ../client
npm install
npm run dev