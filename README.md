# 💬 Yapper

**Yapper** is a high-performance, full-stack real-time chat application built with a focus on privacy, scalability, and custom tooling. Unlike traditional SPAs, Yapper utilizes **Pug** templates with a custom **Vite-integrated Express** middleware to deliver a modern development experience with server-side rendering.

## 🚀 Key Features

### 🔐 Security & Privacy

* **Dual-Token JWT Auth:** Secure authentication flow using Access and Refresh tokens with an Axios auth interceptor.
* **Email OTP:** Account actions and verification secured via One-Time Passwords with a custom **cooldown mechanism**.
* **Database Transactions:** Ensures data integrity across complex relational operations.

### ⚡ Real-Time & Media

* **Instant Messaging:** Powered by **Socket.io** for real-time delivery and **User Presence** (Online/Offline) tracking.
* **Voice & Video Calls:** Peer-to-peer communication implemented via **WebRTC**.
* **Paginated Loading:** Efficient data handling for both chatroom lists and message history.

### 💰 Monetization & Storage

* **Stripe Integration:** Full payment lifecycle management with a paywall system for premium features.
* **Cloudflare R2:** S3-compatible object storage for file uploads, utilizing **presigned URLs** to allow direct client-to-cloud uploads.
* **Stripe CLI:** Integrated workflow for local webhook testing.

## 🛠️ Technical Stack

| **Layer** | **Technology** | 
| ----- | ----- | 
| **Backend** | Node.js, Express.js | 
| **Frontend** | Pug (Jade), Vanilla JS, CSS | 
| **Database** | MariaDB | 
| **ORM** | Sequelize (Transactions, Virtual Fields, Scopes) | 
| **Real-time** | Socket.io, WebRTC | 
| **Storage** | Cloudflare R2 | 
| **Infrastructure** | Docker, Nginx (Proxy & Rate Limiting) | 
| **Build Tools** | Vite, esbuild, Custom Node.js build scripts | 

## 🏗️ Architecture & Engineering Highlights

### The "Hybrid" Frontend Approach

One of the most challenging aspects of Yapper was the integration of **Vite as an Express middleware**. This setup provides:

* **Hot Module Replacement (HMR)** during development while serving Pug templates.
* A custom **Local State Management** solution to handle complex UI updates without a heavy framework like React.
* Optimized asset bundling for vanilla JS and CSS through Vite.

### Database Excellence

The data layer utilizes MariaDB with Sequelize, featuring complex relational mapping:

* **Advanced Relations:** Implementation of One-to-Many, Many-to-Many, and **Super Many-to-Many** associations.
* **Performance:** Utilizing **Sequelize Scopes** for minimal data fetching and **Virtual Fields** for computed properties.
* **Cron Jobs:** Automated scheduled tasks using `node-cron` for database maintenance and cleanup.

### Custom Build Pipeline

Rather than relying on standard presets, Yapper uses a bespoke build system:

* **esbuild** handles the backend code bundling for speed and efficiency.
* **Vite** manages the frontend assets.
* A **custom JS build script** orchestrates both processes to bundle the Frontend and Backend in a single command.

## 🚦 Getting Started

### Prerequisites

* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Installation & Launch

1. **Clone the repo:**
   ```bash
   git clone [https://github.com/Zain-Khoso/Yapper.git](https://github.com/Zain-Khoso/Yapper.git)
   cd Yapper
    ```
2. **Environment Setup:** Create a `.env` file based off of the `.env.example` file and populate it with your own secrets (Stripe, Cloudflare R2, JWT, etc.).

3. **Spin up the containers:** 
    ```bash 
    docker-compose up --build
    ```

The application will be accessible at http://localhost. Docker handles the dependency installation, database initialization, and the custom build orchestration automatically.

### 📈 Lessons Learned
This project was a deep dive into the internals of modern web tooling. Successfully setting up Vite within an Express ecosystem required a thorough understanding of the request/response lifecycle and how to bridge the gap between traditional SSR and modern build-time optimizations.