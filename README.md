# Idir Management SaaS - Tilanet

A comprehensive SaaS platform designed to help Ethiopian **Idir leaders**, both in Ethiopia and in the Diaspora, manage their community operations digitally.

## 🌍 Project Overview

**Core Principle:** "A single, trusted notebook for Idir leaders everywhere."

This platform is optimized for mobile use and provides essential tools for:
- 👥 Member management
- 💰 Contribution tracking
- 📊 Financial reporting
- 🌐 Bilingual support (Amharic and English)
- 📱 Mobile-first design

## 🏗️ Architecture

```
├── backend/          # Node.js API with Express.js & TypeScript
├── Frontend/         # React Native mobile app (planned)
├── shared/           # Shared types and utilities
└── .github/          # CI/CD workflows and documentation
```

## 🚀 Quick Start

### Backend API

The backend is a production-ready Node.js API with Express.js and TypeScript.

```bash
cd backend
npm install
npm run dev
```

**API Endpoints:**
- Health Check: `GET /api/health`
- Sign Up: `POST /api/auth/signup`
- Sign In: `POST /api/auth/signin`

**Server:** http://localhost:3001

### Deployment

The project includes automated Azure App Service deployment via GitHub Actions.

📋 **See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions**

#### Quick Deploy:
1. Create Azure App Service
2. Add publish profile to GitHub Secrets
3. Push to main branch → Auto deploy! 🚀

## 🧱 Tech Stack

- **Backend API:** Node.js + Express.js + TypeScript
- **Database:** Azure PostgreSQL
- **Mobile App:** React Native (planned)
- **Cloud:** Microsoft Azure
- **CI/CD:** GitHub Actions
- **Authentication:** JWT with bcrypt
- **Security:** Helmet, CORS, Rate limiting

## 📚 Documentation

- 📖 [Backend API Documentation](./backend/README.md)
- 🚀 [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- ✅ [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- 🛠️ [Development Setup](./backend/README.md#quick-start)

## 🔐 Security Features

- JWT authentication with secure secrets
- Password hashing with bcrypt
- Request rate limiting
- CORS protection
- Input validation
- Secure headers with Helmet

## 📱 Mobile-First Design

Built with Ethiopian Idir communities in mind:
- Optimized for mobile devices
- Offline-capable (planned)
- Multi-currency support (ETB, USD)
- Bilingual interface (Amharic/English)

## 🌟 Features

### Core MVP Features
- ✅ User authentication (signup/signin)
- ✅ Secure API foundation
- ✅ Production deployment ready
- 🔄 Member management (planned)
- 🔄 Contribution tracking (planned)
- 🔄 Financial reporting (planned)

### Future Enhancements
- Cross-currency remittance
- Member self-service portal
- Sub-committees & permissions
- Budget & expense tracking
- SMS notifications
- Multi-language support

## 🚦 Project Status

- ✅ **Backend API**: Production ready with authentication
- ✅ **Deployment**: GitHub Actions + Azure App Service
- 🔄 **Frontend**: React Native app (next phase)
- 🔄 **Database**: PostgreSQL integration (next phase)

## 🤝 Contributing

1. Follow existing code style (ESLint + Prettier)
2. Add tests for new features
3. Update documentation
4. Submit pull requests to develop branch

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for Ethiopian Idir communities worldwide**