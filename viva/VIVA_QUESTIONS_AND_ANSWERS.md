# PlayPortal — Viva Questions & Answers

### Q1: Why did you choose the MERN stack?
**Answer:** The MERN stack (MongoDB, Express, React, Node.js) allows full-stack JavaScript and JSON throughout the entire pipeline. React provides a reactive, component-based user interface, Node.js and Express offer non-blocking asynchronous I/O ideal for handling multiple concurrent game requests and WebSockets, and MongoDB provides flexible JSON-like document modeling suitable for varying game metadata and dynamic scores.

### Q2: Why Vite instead of Create React App?
**Answer:** Vite leverages native ES modules (ESM) in the browser during development, resulting in near-instantaneous server startup and sub-second Hot Module Replacement (HMR). During production build, it uses Rollup for tree-shaking and bundle optimization. Create React App is officially deprecated and relies on slower Webpack bundling.

### Q3: How does JWT authentication work in PlayPortal?
**Answer:** Upon successful verification of credentials using `bcrypt.compare`, the backend generates a JSON Web Token (JWT) containing `{ id, role }` signed using HMAC-SHA256 and the server's `JWT_SECRET`. The client attaches this token in the `Authorization: Bearer <token>` header for subsequent requests. The `authenticate` middleware verifies the token signature, checks if the account is active in MongoDB, and attaches `req.user`.

### Q4: What is the difference between Authentication and Authorization?
**Answer:** 
- **Authentication** verifies *who you are* (e.g., verifying email and password at `/api/auth/login` to produce a JWT).
- **Authorization** determines *what you are allowed to do* (e.g., the `authorize('ADMIN')` middleware ensuring only users with the `ADMIN` role can access the game moderation queue).

### Q5: How do you prevent Privilege Escalation during user registration?
**Answer:** Public registration (`POST /api/auth/register`) enforces `role: 'PLAYER'` on the backend regardless of what the user supplies in the JSON payload. `DEVELOPER` and `ADMIN` roles can only be granted by existing administrators or database seed scripts.

### Q6: How are passwords stored securely?
**Answer:** Passwords are never stored in plaintext. They are hashed using `bcryptjs` with 10 salt rounds before insertion. In addition, the `passwordHash` field is configured with `select: false` in the Mongoose schema and deleted in the `toJSON` transform hook, preventing accidental exposure in API responses.

### Q7: What is the "Zip Slip" vulnerability and how does PlayPortal prevent it?
**Answer:** Zip Slip is an arbitrary file overwrite vulnerability that occurs when a malicious ZIP archive contains directory traversal paths (e.g., `../../app.js`). When extracted naively, it can escape the target folder and overwrite server source files. PlayPortal prevents this by calculating `path.resolve(targetDir, entryName)` for every entry and rejecting the entire archive if the path does not start with `targetDir`.

### Q8: Why do you run uploaded HTML5 games inside an iframe with sandbox attributes?
**Answer:** Uploaded games created by third parties are untrusted code. By running them inside a sandboxed `<iframe>`, the game code cannot access the parent application's DOM, cookies, or `localStorage` tokens. The game communicates game-over events to the host application strictly via the standard `window.parent.postMessage` API.

### Q9: Why is the Tic-Tac-Toe multiplayer game "Server-Authoritative"?
**Answer:** In client-authoritative games, clients can hack memory or send fake "I won" messages. In PlayPortal's server-authoritative design, clients only send move requests (`make_move` with cell index). The Node.js server maintains the board state in memory, verifies it is the player's turn, checks for valid unoccupied cells, runs the win/draw algorithm, and announces the winner.

### Q10: How does leaderboard ranking work in the database?
**Answer:** The leaderboard query uses a MongoDB Aggregation Pipeline:
1. `$match`: Filters by `game: gameId`.
2. `$sort`: Sorts by `score: -1` (highest score first).
3. `$group`: Groups by `user` taking the `$first` score, ensuring each player appears only once with their highest personal score.
4. `$lookup`: Joins user profiles to attach player names and avatars.
5. `$sort` and `$limit`: Returns the top ranked players.

### Q11: What happens when an administrator deactivates a user?
**Answer:** The admin endpoint sets `isActive = false` on the User document in MongoDB. The `authenticate` middleware checks `user.isActive` on every request. If false, the request is immediately rejected with HTTP `403 Forbidden` (`"Account has been deactivated"`), blocking access to protected gameplay, scores, and dashboard routes.

### Q12: Why did you not use Microservices, Redis, or Kafka?
**Answer:** Microservices and message brokers introduce distributed tracing overhead, network latency, and deployment complexity that are counterproductive for an MVP. A clean **Modular Monolith** is easier to maintain, faster to execute locally, and provides a clear, unified architecture that is easily understood and defensible in academic reviews.
