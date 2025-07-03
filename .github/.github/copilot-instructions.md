# GitHub Copilot Guidelines for Idir Management SaaS

## 🌍 Project Overview
This SaaS platform is designed to help Ethiopian **Idir leaders**, both in Ethiopia and in the Diaspora, manage their community operations digitally. It is optimized for mobile use (via React Native) and deployed on Microsoft Azure. The MVP includes core workflows such as member management, contribution tracking, and bilingual support (Amharic and English).

**Core Principle:** "A single, trusted notebook for Idir leaders everywhere."

---

## 🧭 Guiding Principles for Code Suggestions

1. **Simplicity First:** Prioritize readable, maintainable, and minimal code.
2. **Mobile-Centric:** Suggest mobile-first UI/UX solutions using React Native.
3. **Currency-Awareness:** Always respect multi-currency logic (ETB, USD, etc.) where relevant.
4. **Offline Support:** Incorporate SQLite or Realm where persistent offline data is needed.
5. **Localization:** Every UI component should support both English and Amharic.
6. **Security First:** Use secure practices like hashed passwords, input validation, and managed identities.
7. **Transparency Tools:** Any summaries or reports should be easily shareable (text or image).

---

## 🧱 Tech Stack

- **Mobile App (Frontend):** `React Native App`
- **Backend API:** `Node.js` with `Express.js` (using `TypeScript`)
- **Database:** Azure PostgreSQL
- **Storage:** Azure Blob Storage
- **SMS Auth:** Azure Communication Services
- **CI/CD:** GitHub Actions → Azure App Service
- **Offline DB:** SQLite or Realm
- **Security:** `HTTPS`, `bcrypt`, `JWT`, compliance with **Ethiopian, USA, and Europe data policies**.

---

## 💡 Suggested Prompts for Copilot

Use these to kickstart helpful Copilot completions:

### 🛂 Authentication
> "Create a secure user signup flow with phone number verification via Azure Communication Services."

### 🏘️ Idir Setup
> "Build a form to set the Idir name, country, and primary currency (ETB, USD, etc.) "

### 👥 Member Management
> "Implement CRUD operations for Idir members."

### 🔄 Contribution Cycle
> "Generate joining fee Collection for each idir upon setup cycle, including name, amount, and date."
>"Generate a cycle for each new Monthly cycle, including name, amount, and date."

### 💰 Payment Logging
> "Write a backend API to log member payment for a specific cycle with optional notes."

### 📊 Summary Report
> "Create a summary view with totals and shareable export in image or text format."

### 🌐 Language Toggle
> "Build a language toggle for English/Amharic using a localization library in React Native."

### ⚙️ DevOps
> "Suggest a GitHub Actions workflow to deploy a Node.js app to Azure App Service."

---

## ✅ Code Style Conventions

- Follow Prettier formatting rules
- Use ESLint for JS/TS linting
- camelCase for JS
- Always document exported functions
- Add test cases for backend endpoints

---

## 🧪 Testing Expectations

- Cover:
  - Input validation
  - Auth flows
  - Contribution logic
  - Report summaries

---

## 🛠️ Future Enhancements (Phase 2+)
- Cross-currency remittance
- Member self-service app
- Sub-committees & permissions
- Budget & expense tracking

---

