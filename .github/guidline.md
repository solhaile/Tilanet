# Project Context for Idir Management SaaS

## 1. About This File
This document provides essential context about the Idir Management SaaS project. This is the single source of truth for the MVP's scope and technical direction.

---

## 2. Project Overview

* **Project Name:** Tilanet
* **Mission:** To empower Idir leaders and members in Ethiopia and the Diaspora with a simple, secure, and unified digital tool to manage their community's contributions and build trust.
* **Core Problem:** Idir leaders use manual, error-prone methods (paper notebooks) to track member finances. This is inefficient, lacks transparency, and doesn't easily accommodate members living abroad. Our platform digitizes this "notebook."

---

## 3. Core Personas (Target Users)

1.  **Idir Leader (Ethiopia-Based)**
    * **Environment:** Urban or peri-urban Ethiopia. Uses a mid-range Android smartphone. Internet connectivity can be intermittent and slow.
    * **Needs:** Simplicity, reliability, offline functionality, and an Amharic user interface. Primarily tracks cash and local mobile money payments.
    * **Tech Proficiency:** Basic smartphone user. Not necessarily a "power user."

2.  **Idir Leader (Diaspora-Based)**
    * **Environment:** North America, Europe, etc. Uses modern Android or iOS devices with reliable, high-speed internet.
    * **Needs:** Professionalism, security, multi-currency awareness, and an English user interface. Tracks payments from various digital sources (Zelle, PayPal, bank transfers).
    * **Tech Proficiency:** High. Expects a smooth, modern app experience.
3. **Idir Members:** once the leaders approve the usage of the system, it will expand to the members to execute all members durties using this app.

---

## 4. MVP Core Features & Scope (Detailed Breakdown)

### AUTH-01: Secure Authentication
* **User Story:** "As a leader, I want to sign up using my phone number, verify my identity securely, and log in easily so I can access my Idir's records."
* **Key Functionalities:**
    * select language 
    * Sign-up screen with country code picker.
    * SMS One-Time Password (OTP) verification for new accounts.
    * Login screen for existing users.
    * Secure session management using JWT.
* **Acceptance Criteria:**
    * **Given** a new user provides a valid international phone number and matching passwords, **When** they submit the sign-up form, **Then** an OTP is sent via SMS and they are navigated to the verification screen.
    * **Given** a user enters the correct, non-expired OTP, **When** they tap "Verify," **Then** their account is activated, a JWT is issued, and they are navigated to the Idir setup screen.
    * **Given** a verified user provides correct credentials, **When** they tap "Log In," **Then** a JWT is issued and they are navigated to their main dashboard.
* **Technical Notes for Copilot:** Use `bcrypt` for password hashing. JWTs should contain the `userId` and have a reasonable expiration. Use Azure Communication Services for international SMS.

### IDIR-01: Idir Profile Creation (Multi-Currency)
* **User Story:** "As a new leader who has just signed up, I want to set up my Idir's basic profile so I can start managing it."
* **Key Functionalities:**
    * A one-time setup form presented after the first successful login/verification.
    * User must input `Idir Name` and select a `Country of Operation`.
    * User must select a **fixed primary currency** for the Idir (e.g., ETB, USD, EUR) from a dropdown list.
* **Acceptance Criteria:**
    * **Given** a user has just verified their account, **When** they see the setup screen, **Then** they cannot proceed to the main app until the form is completed.
    * **Given** an Idir profile has been created, **When** the leader views it later, **Then** the primary currency is displayed as a non-editable field.
* **Technical Notes for Copilot:** The selected currency code (e.g., 'ETB') should be stored in the `idirs` table. All subsequent financial operations and UI displays for this Idir must respect this currency setting.

### MBR-01: Member Management (CRUD)
* **User Story:** "As a leader, I want to maintain an accurate and up-to-date list of my members."
* **Key Functionalities:**
    * A screen listing all active members, with a search/filter bar.
    * A form to add a new member with `First Name`, `Last Name`, `Phone Number`, email address, dependent info ....
    * Ability to edit a member's details.
    * Ability to deactivate a member (soft delete).
* **Acceptance Criteria:**
    * **Given** a leader is viewing the member list, **When** they deactivate a member, **Then** that member no longer appears in the main list or in new contribution cycles, but their past contribution records are preserved.
* **Technical Notes for Copilot:** Use a boolean flag like `isActive` for deactivation. Do not permanently delete member records.

### CYCLE-01: Contribution Cycle Management
* **User Story:** "As a leader, I want to create distinct collection cycles for different purposes or time periods."
* **Key Functionalities:**
    * A button to create a new cycle.
    * A form to define the cycle: `Cycle Name` (e.g., "August 2025 Dues"), `Date`, and `Amount per Member` (in the Idir's primary currency).
    * A screen listing all cycles (active and past).
* **Acceptance Criteria:**
    * **Given** a new cycle is created, **When** the leader opens it, **Then** a list of all *currently active* members is automatically generated, with each member's payment status initialized to "Unpaid."
* **Technical Notes for Copilot:** Creating a cycle should generate corresponding records in a `payments` table for each active member, linking `memberId`, `cycleId`, with a default status of `unpaid`.

### LOG-01: Manual Payment Logging (Offline-First)
* **User Story:** "As a leader, I want to instantly update a member's payment status, even if I don't have internet."
* **Key Functionalities:**
    * In a cycle's member list, the leader can tap a member to toggle their status between "Paid" and "Unpaid."
    * Ability to add a short, optional text note to each payment record.
* **Acceptance Criteria:**
    * **Given** the user's device is offline, **When** they mark a member as "Paid," **Then** the UI updates instantly and the change is saved to the local device database.
    * **Given** the device later reconnects to the internet, **When** the app is opened, **Then** the locally saved changes are automatically synced with the backend server.
* **Technical Notes for Copilot:** This is a critical offline-first feature. Use an on-device database like `SQLite` or `Realm`. Implement a synchronization queue to handle updates.

### RPT-01: Basic Reporting & Summary
* **User Story:** "As a leader, I want to see a clear summary of a collection's progress and share it with my members to ensure transparency."
* **Key Functionalities:**
    * A summary view for each cycle showing: Total Expected Amount, Total Collected Amount, Number of Paid Members, Number of Unpaid Members.
    * A list of names under "Paid" and "Unpaid" columns.
    * A "Share Summary" button.
* **Acceptance Criteria:**
    * **Given** a leader is viewing a cycle's report, **When** they tap "Share," **Then** the native OS share dialog opens with a pre-formatted, easy-to-read text summary (or an image of the summary view).
* **Technical Notes for Copilot:** For image sharing, use a library like `react-native-view-shot`.

### L10N-01: Bilingual Language Support
* **User Story:** "As a user, I want to use the entire application in my preferred language, either Amharic or English."
* **Key Functionalities:**
    * A language toggle switch in the app's settings.
    * All UI text, including buttons, labels, error messages, and system alerts, must be localized.
* **Acceptance Criteria:**
    * **Given** the user selects "Amharic," **When** they navigate the app, **Then** all text appears in Amharic.
* **Technical Notes for Copilot:** Use a library like `i18next` with `en.json` and `am.json` resource files. Do not hardcode any user-facing strings in the components.

---

## 5. What the MVP is NOT

To maintain focus, the MVP will explicitly **exclude** these features:
* **No Direct Payments:** The app is a ledger, not a payment gateway. Users do not send money through the app in the MVP.
* **No Member-Facing App:** The MVP is a tool *only* for the Idir leader. Members do not have accounts.
* **No Complex Financial Analytics:** No charts, graphs, or historical trend analysis.
* **No Advanced Group Management:** No sub-committees, roles/permissions, or event management.
* **No AI Features:** All AI-driven enhancements are planned for post-MVP phases.

---

## 6. Technology Stack & Architecture

* **Mobile App (Frontend):** `React Native App`
* **Backend API:** `Node.js` with `Express.js` (using `TypeScript`)
* **Deployment Platform:** `Microsoft Azure` (App Service, PostgreSQL, Blob Storage, Communication Services)
* **API Design:** `RESTful`
* **Security:** `HTTPS`, `bcrypt`, `JWT`, compliance with **Ethiopian, USA, and Europe data policies**.

---

## 7. Coding Style & Conventions

* **Language:** `TypeScript` for both frontend and backend.
* **Formatting:** `Prettier` and `ESLint`.
* **Git Commits:** [Conventional Commits](https://www.conventionalcommits.org/).

## 8. Tests
> Use the data structure and values from `server/test-data.ts` for all examples and code suggestions.

## 9. Deployment
> "Suggest a GitHub Actions workflow to deploy a Node.js app to Azure App Service."
> "The Front end can be deployed on static web service"
>  the deployment will be on flesxible postgreSQL server.

### Why?
- **Consistency:** All environments (dev, test, docs, Copilot) use the same data.
- **Maintainability:** Update in one place, propagate everywhere.
- **Clarity:** New contributors and AI tools always know where to look for canonical data.

Some Best practices:
The middleware is used to makes the service tenant context (idirId) available everywhere in your backend, enforcing multi-tenancy at the API/service layer.

- **Middleware:** a middleware is added that extracts idirId from the authenticated user and attaches it to req.idirId.
- **Route Handlers:** all route handlers and service calls use req.idirId instead of trusting any idirId from the client or query.
- **Service/Repository:** service/repository methods require idirId as an argument, and always use it for filtering.