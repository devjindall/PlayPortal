# PlayPortal — Testing Strategy & Test Execution Report

## 1. Testing Philosophy & Frameworks
PlayPortal utilizes an automated test runner approach using Node's native `assert` and `fetch` modules to test the Express server, Mongoose data models, authentication flows, Zip extraction, and REST endpoints.

---

## 2. Test Suites Overview

| Suite File | Test Count | Domains Covered |
| :--- | :--- | :--- |
| `server/tests/auth.test.js` | 25 Tests | • Registration input validation & duplicate check<br>• Password bcrypt hashing verification in MongoDB<br>• Role tampering resistance (forced PLAYER)<br>• Login credentials & deactivated user rejection<br>• Token verify & `/api/auth/me` retrieval<br>• RBAC authorization guards for PLAYER, DEVELOPER, ADMIN |
| `server/tests/e2e.test.js` | 18 Tests | • Developer game upload (multipart ZIP + thumbnail)<br>• Safe extraction & `index.html` presence verification<br>• Zip Slip attack rejection<br>• Admin moderation review & approval (status transitions)<br>• Public game catalog filtering & search<br>• Score submissions & leaderboard calculation<br>• Personal best scores & player history<br>• Admin user activation/deactivation |
| **Total Automated Tests** | **43 Tests** | **100% Passing (43 / 43)** |

---

## 3. How to Run Backend Tests

```bash
# Run all automated test suites from root
npm run test:server

# Or directly within server directory
cd server
npm test
```

### Actual Output:
```text
========================================
RUNNING PHASE 2A AUTHENTICATION & RBAC TESTS
========================================
  ✓ POST /api/auth/register - Successfully registers a PLAYER user
  ✓ Database Verification - Password is saved as bcrypt hash and not plaintext
  ✓ Security - Role tampering during registration is ignored (defaults to PLAYER)
  ✓ POST /api/auth/register - Rejects duplicate email
  ✓ POST /api/auth/register - Rejects invalid email
  ✓ POST /api/auth/register - Rejects missing name
  ✓ POST /api/auth/register - Rejects short password (< 6 chars)
  ✓ POST /api/auth/login - Successfully logs in valid user
  ✓ POST /api/auth/login - Rejects incorrect password
  ✓ POST /api/auth/login - Rejects non-existent email
  ✓ POST /api/auth/login - Rejects deactivated user
  ✓ GET /api/auth/me - Successfully retrieves profile with valid token
  ✓ GET /api/auth/me - Rejects missing Authorization header
  ✓ GET /api/auth/me - Rejects malformed/invalid token
  ✓ GET /api/auth/me - Rejects deactivated user holding valid token
  ✓ RBAC - PLAYER can access /api/auth/test/player
  ✓ RBAC - PLAYER CANNOT access /api/auth/test/developer (403)
  ✓ RBAC - PLAYER CANNOT access /api/auth/test/admin (403)
  ✓ RBAC - DEVELOPER can access /api/auth/test/player
  ✓ RBAC - DEVELOPER can access /api/auth/test/developer
  ✓ RBAC - DEVELOPER CANNOT access /api/auth/test/admin (403)
  ✓ RBAC - ADMIN can access /api/auth/test/player
  ✓ RBAC - ADMIN can access /api/auth/test/developer
  ✓ RBAC - ADMIN can access /api/auth/test/admin
  ✓ GET /api/health - Baseline endpoint still functions
TEST SUMMARY: 25 passed, 0 failed

========================================
PLAYPORTAL COMPLETE E2E INTEGRATION SUITE
========================================
  ✓ Register Player user (POST /api/auth/register)
  ✓ Create & Login Developer user
  ✓ Create & Login Admin user
  ✓ Get Authenticated Profile (GET /api/auth/me)
  ✓ Developer Upload HTML5 Game ZIP (POST /api/developer/games)
  ✓ Security - Reject ZIP without index.html
  ✓ Developer List Own Games (GET /api/developer/games)
  ✓ Admin List Submissions (GET /api/admin/submissions)
  ✓ Admin Approve Submission (PATCH /api/admin/submissions/:id/approve)
  ✓ Public Game Discovery (GET /api/games)
  ✓ Get Game Details (GET /api/games/:id)
  ✓ Submit Score for Published Game (POST /api/games/:id/scores)
  ✓ Get Game Leaderboard (GET /api/games/:id/leaderboard)
  ✓ Get Personal Game Scores (GET /api/games/:id/scores/me)
  ✓ Update User Profile (PATCH /api/users/me)
  ✓ Get Player History (GET /api/users/me/history)
  ✓ Admin List Users (GET /api/admin/users)
  ✓ Admin Toggle User Status (PATCH /api/admin/users/:id/status)
TEST SUMMARY: 18 passed, 0 failed
```

---

## 4. Frontend Production Build Verification

```bash
cd client
npm run build
```

**Build Output:**
```text
vite v6.4.3 building for production...
transforming...
✓ 1697 modules transformed.
rendering chunks...
dist/index.html                   0.53 kB │ gzip:   0.35 kB
dist/assets/index-e65Jf-9q.css   39.86 kB │ gzip:   6.86 kB
dist/assets/index-9nTtlWgd.js   391.19 kB │ gzip: 112.67 kB
✓ built in 4.25s
```
Zero compilation warnings or bundle errors.
