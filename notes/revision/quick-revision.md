# ⚡ Quick Revision Cards & Cheat Sheet

> **Focus:** Rapid recall for all backend and JavaScript concepts implemented in this repository. Use this file for 5-minute pre-interview or pre-coding revision.

---

## 🃏 Topic Flashcards

### 1. ES Modules (ESM) in Node.js
- **Definition:** The official standard module system for JavaScript using `import` and `export`.
- **Why it matters:** Standardizes modern JavaScript across frontend and backend; replaces legacy CommonJS `require()`.
- **Core syntax:** `import express from "express";` / `export { app };` with `"type": "module"` in `package.json`.
- **Code example:** `import connectDB from "./db/db.js";` ([`src/index.js:3`](../src/index.js))
- **Common mistake:** Omitting the `.js` extension on relative imports (`./db/db` throws `ERR_MODULE_NOT_FOUND`).
- **Connection to flow:** Ensures modular code organization without global namespace pollution.

---

### 2. Environment Variables (`dotenv` & `process.env`)
- **Definition:** Dynamic values stored in a `.env` file outside source code to configure runtime environments.
- **Why it matters:** Prevents hardcoding secret database passwords and API keys into Git repositories.
- **Core syntax:** `dotenv.config({ path: "./.env" });` -> `process.env.VARIABLE_NAME`.
- **Code example:** `const port = process.env.PORT || 8000;` ([`src/index.js:12`](../src/index.js))
- **Common mistake:** Naming path `"./env"` instead of `"./.env"`, or forgetting to add `.env` to `.gitignore`.
- **Connection to flow:** Configures database URIs and port numbers before server initialization.

---

### 3. Database Connection via Mongoose
- **Definition:** Asynchronous network handshake connecting Node.js to MongoDB Atlas using the Mongoose ODM.
- **Why it matters:** Persistent storage of users, videos, and comments with schema validation.
- **Core syntax:** `const instance = await mongoose.connect(uri);`
- **Code example:** `await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);` ([`src/db/db.js:6`](../src/db/db.js))
- **Common mistake:** Omitting `await`, which assigns a pending Promise instead of the resolved connection instance.
- **Connection to flow:** Must succeed *before* `app.listen()` opens network ports to accept traffic.

---

### 4. Express Application & `app.use()`
- **Definition:** Express is a minimal web framework providing a middleware pipeline and routing engine.
- **Why it matters:** Eliminates low-level Node HTTP boilerplate for URL parsing, header extraction, and streaming.
- **Core syntax:** `const app = express(); app.use(middleware);`
- **Code example:** `app.use(express.json({ limit: "16kb" }));` ([`src/app.js:14`](../src/app.js))
- **Common mistake:** Placing `app.use(express.json())` *after* route handlers, resulting in `req.body === undefined`.
- **Connection to flow:** Every incoming request travels through the registered middleware array in sequential order.

---

### 5. CORS (Cross-Origin Resource Sharing)
- **Definition:** Security mechanism enforced by browsers restricting cross-domain HTTP requests.
- **Why it matters:** Prevents malicious external websites from making unauthorized requests to your backend on behalf of a user.
- **Core syntax:** `app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));`
- **Code example:** [`src/app.js:8-11`](../src/app.js)
- **Common mistake:** Not setting `credentials: true` when sending cookies or authorization headers across domains.
- **Connection to flow:** Acts as the very first security gate on incoming HTTP requests.

---

### 6. Cookie Parser
- **Definition:** Middleware that extracts cookies from the HTTP `Cookie` header into a JavaScript object.
- **Why it matters:** Enables server-side reading of secure JWT tokens stored in HTTP-only cookies.
- **Core syntax:** `app.use(cookieParser());` -> Access via `req.cookies.tokenName`.
- **Code example:** [`src/app.js:23`](../src/app.js)
- **Common mistake:** Trying to read `req.cookies` before registering `cookieParser()`.
- **Connection to flow:** Allows authentication middlewares to inspect user session tokens.

---

### 7. Higher-Order Functions & `asyncHandler`
- **Definition:** A wrapper function that catches unhandled Promise rejections from async route handlers and passes them to `next(err)`.
- **Why it matters:** Eliminates writing repetitive `try...catch` blocks across dozens of controllers.
- **Core syntax:** `const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);`
- **Code example:** [`src/utils/asynchandler.js`](../src/utils/asynchandler.js)
- **Common mistake:** Using block curly braces `{}` without writing `return`, which returns `undefined` to Express.
- **Connection to flow:** Wraps every route controller to guarantee safe error forwarding to Express error handlers.

---

## 📊 Comprehensive Comparison Tables

### CommonJS vs. ES Modules
| Feature | CommonJS (CJS) | ES Modules (ESM) |
|:---|:---|:---|
| **Import Syntax** | `const pkg = require("pkg");` | `import pkg from "pkg";` |
| **Export Syntax** | `module.exports = pkg;` | `export default pkg;` or `export { pkg };` |
| **Relative File Extensions** | Optional (`require("./db")`) | **Mandatory** (`import "./db/db.js"`) |
| **Async Loading** | Synchronous | Asynchronous / Static analysis |
| **Top-Level `await`** | Not supported (without wrapper) | Supported natively |

### `req.body` vs. `req.params` vs. `req.query`
| Property | Where data is found | How it looks in URL / Request | Typical Use Case |
|:---|:---|:---|:---|
| **`req.body`** | Inside HTTP Request Payload | Form data or JSON string in payload | Creating or updating resources (`POST`, `PUT`, `PATCH`) |
| **`req.params`** | In the route path itself | `/api/v1/videos/:videoId` -> `/videos/123` | Locating a specific unique resource by ID |
| **`req.query`** | Appended after `?` mark | `/api/v1/videos?page=2&limit=10` | Filtering, pagination, sorting, search queries |
