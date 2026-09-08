# Contributing to PlayPortal

Thank you for your interest in contributing to **PlayPortal**! This guide outlines the project structure, coding standards, and branch workflow.

---

## 1. Getting Started

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/PlayPortal.git
   cd PlayPortal
   ```

2. **Install Dependencies:**
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables:**
   - Copy `.env.example` to `server/.env` and `client/.env`.

4. **Seed Database:**
   ```bash
   npm run seed
   ```

5. **Start Development Servers:**
   - Backend: `npm run dev:server` (Port 5000)
   - Frontend: `npm run dev:client` (Port 5173)

---

## 2. Coding Guidelines & Standards

- **Backend:**
  - Follow the **Controller-Service-Model** separation pattern.
  - Implement request validation using `express-validator` in `src/validators/`.
  - Ensure all database queries handle errors gracefully via central error middleware.
  - Never commit plaintext credentials or API secrets.
- **Frontend:**
  - Build modular, functional React components with standard React Hooks.
  - Style components with **Tailwind CSS**.
  - Always handle loading, empty, and error states across forms and data lists.

---

## 3. Running Automated Tests

Before submitting a pull request, verify that all test suites pass:
```bash
npm run test:server
npm run build:client
```
All 43 tests must pass with 0 errors.
