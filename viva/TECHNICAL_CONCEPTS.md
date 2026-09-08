# PlayPortal — Technical Concepts Reference

This document explains the core computer science and software engineering concepts underpinning PlayPortal at a final-year B.E. level.

---

## 1. Single Page Application (SPA) & React Component Lifecycle
- **Virtual DOM:** React uses an in-memory representation of the real DOM. When component state changes (e.g., in `HomePage`, `GamesPage`), React compares the previous Virtual DOM with the updated Virtual DOM using a reconciliation diffing algorithm (\(O(n)\) complexity) and patches only the changed subtrees in the real DOM.
- **React Context API:** Solves "prop drilling" by sharing global state (user profile, token, role flags) across the component tree without third-party dependencies like Redux.
- **Hooks:**
  - `useState`: Encapsulates local state.
  - `useEffect`: Manages side effects (HTTP queries on mount, event listeners for `postMessage` and socket events, cleanups on unmount).
  - `useRef`: Retains mutable DOM references (iframe instance, fullscreen container) without triggering re-renders.

---

## 2. RESTful API Architecture
- **Statelessness:** Every HTTP request from client to server contains all necessary authentication and context (`Authorization: Bearer <token>`). The server retains no session state in memory.
- **HTTP Methods:**
  - `GET`: Safe, idempotent retrieval (catalog, leaderboards, profile).
  - `POST`: Creation of new resources (registration, score submissions, game uploads).
  - `PATCH`: Partial updates to resources (user status toggle, approval/rejection, profile edits).
- **HTTP Status Codes:**
  - `200 OK`: Successful retrieval or update.
  - `201 Created`: Resource successfully created.
  - `400 Bad Request`: Client input validation failure.
  - `401 Unauthorized`: Missing or invalid authentication token.
  - `403 Forbidden`: Insufficient role permissions or deactivated account.
  - `404 Not Found`: Target resource does not exist.
  - `500 Internal Server Error`: Unhandled server exception.

---

## 3. Cryptography & Password Hashing (Bcrypt)
- **Salt Generation:** Bcrypt generates a random 128-bit salt and prepends it to the hashed output. This prevents **Rainbow Table attacks** (precomputed hash lookups).
- **Key Stretching & Work Factor:** Bcrypt uses an adaptive cost factor ($2^{\text{cost}}$ iterations). Salt rounds = 10 means 1024 hashing rounds, balancing security against brute-force attacks with reasonable response times (~100–150ms per login).

---

## 4. JSON Web Tokens (JWT)
A standard JWT consists of three Base64URL-encoded components separated by dots (`.`):
$$\text{Header}.\text{Payload}.\text{Signature}$$
1. **Header:** Defines algorithm (`HS256`) and token type (`JWT`).
2. **Payload:** Claims describing the user (`id`, `role`, `iat`, `exp`).
3. **Signature:** $\text{HMAC-SHA256}(\text{Base64}(Header) + "." + \text{Base64}(Payload), \text{JWT\_SECRET})$.
The server verifies authenticity by recalculating the signature upon receiving the token.

---

## 5. WebSockets & Real-Time Bidirectional Communication (Socket.IO)
- **HTTP vs WebSockets:** Standard HTTP follows a simplex request-response pattern (client pulls data). WebSockets establish a persistent, full-duplex TCP connection over a single socket, allowing the server to push real-time board updates to connected clients with sub-millisecond latency.
- **Heartbeat & Reconnection:** Socket.IO continuously exchanges ping/pong packets to detect dropped connections and automatically switches between WebSocket and HTTP long-polling if networks block WebSockets.

---

## 6. Path Traversal & Zip Slip Prevention
- **Canonicalization:** When extracting files, archives may contain malicious relative directory sequences (`../`).
- **Resolution Boundary Check:**
  ```javascript
  const destPath = path.resolve(targetDir, normalizedEntryName);
  if (!destPath.startsWith(targetDir)) {
    throw new Error('Security Violation: Zip Slip Path Traversal Detected');
  }
  ```
  Ensuring the resolved destination starts with `targetDir` mathematically guarantees that no file can be written outside the designated game folder.
