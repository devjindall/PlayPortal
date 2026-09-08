# PlayPortal — Security & Threat Modeling Specification

## 1. Authentication & Session Security
- **Algorithm:** JSON Web Tokens (JWT) signed with HMAC-SHA256 (`HS256`).
- **Secret Management:** The `JWT_SECRET` is strictly read from server environment variables (`.env`). No fallback keys or credentials are committed to version control.
- **Minimal Payload:** Tokens carry only `{ id, role }`, preventing sensitive credential leakage in token payload.
- **Token Invalidation:** Frontend interceptors automatically discard expired tokens upon encountering HTTP `401 Unauthorized`.
- **Account State Verification:** Every protected request verifies `user.isActive === true`. Deactivated accounts are immediately blocked from protected operations with `403 Forbidden`.

---

## 2. Role-Based Access Control (RBAC)
- **Server as Security Boundary:** Role authorization occurs strictly on the Express backend (`authorize(...roles)` middleware) and never relies on client UI visibility.
- **Registration Privilege Elevation Defense:** Public registration (`POST /api/auth/register`) enforces `role = 'PLAYER'` at the controller/service level, ignoring any user-supplied role parameters (such as `role: 'ADMIN'`).
- **Administrative Protection:** Admin endpoints verify `req.user.role === 'ADMIN'`. Deactivating your own admin account is prevented.

---

## 3. Password Security & Storage
- **Hashing Algorithm:** `bcryptjs` with salt rounds = 10.
- **Leakage Defense (Multi-layer):**
  1. **Schema Exclude:** `passwordHash` has `select: false` in the Mongoose schema, excluding it from standard queries (`find`, `findById`).
  2. **Serialization Stripping:** Mongoose `toJSON` and `toObject` transform hooks explicitly delete `passwordHash` and `__v`.
  3. **No Plaintext Logging:** Passwords are never logged in console outputs or error stacks.

---

## 4. File Upload & Zip Slip Path Traversal Defense

```
ZIP Archive Upload (Developer)
             │
             ▼
1. File Filter Check (Must be .zip, Max 25MB)
             │
             ▼
2. AdmZip Entry Inspection (Pre-Extraction)
   ├── Validate Destination: destinationPath.startsWith(targetDir)
   └── Detect Entry Point: index.html required
             │
             ▼
3. Safe File Extraction to /uploads/games/<gameId>/
             │
             ▼
4. Temp Archive Cleanup (Unlink source zip)
```

- **Zip Slip Mitigation:** Malicious archives with entries like `../../../../etc/passwd` or `..\..\app.js` are checked before writing to disk. The server calculates `path.resolve(targetDir, entryName)`. If it does not start with `targetDir`, extraction is immediately aborted with a security error, and temporary files are deleted.
- **File Type Enforcement:** Only verified archive formats (`.zip`) are accepted for games, and only standard image formats (`.jpg`, `.jpeg`, `.png`, `.webp`, `.svg`) are accepted for thumbnails.

---

## 5. Untrusted Game Sandboxing (Iframe Isolation)
Games created by third-party developers are treated as untrusted code:
- **Iframe Sandboxing:** Games run inside an iframe configured with:
  ```html
  <iframe sandbox="allow-scripts allow-same-origin allow-forms allow-popups" ... />
  ```
- **Communication Protocol:** Games cannot directly manipulate the parent React DOM or access `localStorage` tokens. Score transmission uses standard HTML5 Web Messaging (`window.parent.postMessage`).

---

## 6. Network & HTTP Security
- **Helmet Middleware:** Configures secure HTTP headers while allowing cross-origin resource embedding for sandboxed game assets:
  ```javascript
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
  ```
- **CORS Protection:** Configured to whitelist `CLIENT_URL` (e.g. `http://localhost:5173`) with support for credentials.
- **Rate Limiting:** `express-rate-limit` limits authentication routes (`/api/auth/login`, `/api/auth/register`) to 100 requests per 15-minute window per IP to mitigate brute-force attempts.

---

## 7. Realistic Security Boundaries & Viva Honesty

> [!NOTE]
> **Client-Side Single-Player Score Verification Limitation:**
> In web-based single-player games executing in the browser (client-side Canvas/JS), a malicious player with DevTools can theoretically modify JavaScript variables or mock `window.parent.postMessage`. 
> 
> *Viva Defense:* Server-side validation verifies authentication, active account status, valid numeric constraints, and published game status. For a college MVP, server-authoritative multiplayer (Tic-Tac-Toe) demonstrates true cheat-proof state validation on the server, whereas single-player score submissions are protected against malformed inputs and unauthorized users.
