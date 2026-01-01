# 🛍️ Vaaya — Full-Stack E-Commerce Platform

Vaaya is a **production-ready full-stack e-commerce web application** built for a **single-seller business**, similar in concept to Amazon but designed for one brand to sell its own products.
It includes a customer-facing storefront and a secure admin dashboard for complete store management.

The architecture is designed to scale and can be extended to a **multi-seller marketplace** in the future.

---

## 🌐 Live Demo

* **Frontend:** [https://vaayafrontend.vercel.app](https://vaayafrontend.vercel.app)
* **Backend API:** [https://vaaya-backend.onrender.com](https://vaaya-backend.onrender.com)

> Fully deployed — no local setup required to access the app.

---

## ✨ Features

### Customer

* User authentication (register, login, profile)
* Browse products by category & subcategory
* Product detail pages with images, pricing, and stock
* Shopping cart with real-time updates
* Wishlist functionality
* Secure checkout flow
* Order history tracking

### Admin Panel

* Secure admin authentication
* Category & subcategory management
* Product CRUD operations
* Order management
* User management
* Inventory & stock control
* Homepage content management

---

## 🧱 Tech Stack

### Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js
* Prisma ORM
* JWT authentication

### Database

* PostgreSQL (Neon)

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: Neon

---

## 🏗️ Architecture Overview

* Frontend and backend are fully decoupled
* RESTful API design
* JWT-based role authentication (Admin / User)
* Relational schema optimized for scalability
* Environment-based configuration for production and development

---

## 🚀 Scalability

* Designed as a **single-seller platform**
* Database and schema structured to support:

  * Multiple sellers
  * Seller dashboards
  * Role-based access control
* Cloud-hosted infrastructure allows horizontal scaling

---

## 🧪 Local Development (Optional)

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

---

## 📌 Notes

* Image handling is cloud-ready (external URLs)
* Admin panel is part of the same frontend app
* Production database is hosted remotely (Neon)

---

## 👨‍💻 Author

**Shrey Sircar**
Full-Stack Developer
