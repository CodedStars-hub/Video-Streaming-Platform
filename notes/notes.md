# 📝 Living Backend Engineering Notes

> **Central Living Document & Quick Reference Hub**  
> This file is your daily workspace dashboard. Open this when you want to quickly refresh how your application works, review key JavaScript concepts, or check recent progress.

---

## 📌 Quick Application Map

Here is how your backend project is wired together right now:

```
[ Client / Postman / Browser ]
           │
           │ HTTP Request (e.g. GET /api/v1/health)
           ▼
[ src/index.js ] ── (1) Loads .env via dotenv.config()
           │     ── (2) Calls connectDB()
           ▼
[ src/db/db.js ] ── Connects to MongoDB Atlas via Mongoose
           │
           ▼ (Once Promise resolves)
[ app.listen(8000) ] Starts HTTP server
           │
           ▼
[ src/app.js ] ──── Applies Global Middleware:
           ├── cors()                     (Cross-Origin Resource Sharing)
           ├── express.json({limit})      (Parses incoming JSON payloads)
           ├── express.urlencoded({limit})(Parses form data/URLs)
           ├── express.static("public")   (Serves static files from public/)
           └── cookieParser()             (Parses incoming HTTP cookies)
           │
           ▼
[ Future Layer: src/routes & src/controllers ]
           └── Wrapped with src/utils/asynchandler.js
```

---

## 🔗 Quick Topic Directory

| # | Topic | Key Question Answered | Deep Dive Link |
|:---|:---|:---|:---|
| **00** | Foundations | What is a backend and why is the project structured this way? | [00-backend-foundations.md](./00-backend-foundations.md) |
| **01** | JS for Backend | How do Higher-Order Functions, Closures, and Promises work? | [01-javascript-for-backend.md](./01-javascript-for-backend.md) |
| **02** | Node.js | Why does `"type": "module"` require `.js` file extensions? | [02-nodejs-fundamentals.md](./02-nodejs-fundamentals.md) |
| **03** | HTTP & APIs | What is the difference between `req.body`, `req.params`, and `req.query`? | [03-http-and-apis.md](./03-http-and-apis.md) |
| **04** | Express Setup | Why did we separate `index.js` and `app.js`? | [04-express-fundamentals.md](./04-express-fundamentals.md) |
| **05** | Lifecycle | What happens step-by-step from client request to response? | [05-request-response-lifecycle.md](./05-request-response-lifecycle.md) |
| **06** | Middleware | What does `app.use()` actually do behind the scenes? | [06-middleware.md](./06-middleware.md) |
| **07** | Routes & Controllers | How will routes and controllers connect in the next lesson? | [07-routing-and-controllers.md](./07-routing-and-controllers.md) |
| **08** | Async & Errors | How does `asyncHandler` eliminate repetitive `try...catch` blocks? | [08-async-javascript-and-errors.md](./08-async-javascript-and-errors.md) |
| **09** | MongoDB | How does a document database store data and connect over TCP? | [09-databases-and-mongodb.md](./09-databases-and-mongodb.md) |
| **10** | Mongoose | What is an ODM and what information does `connectionInstance` give us? | [10-mongoose.md](./10-mongoose.md) |
| **11** | Environment Config | Why must `.env` never be pushed to Git and how does `process.env` work? | [11-environment-variables-and-configuration.md](./11-environment-variables-and-configuration.md) |

---

## 🎨 Visual Diagrams Index

- [Application Architecture Diagram](./diagrams/application-architecture.md) — Visualizes how `index.js`, `db.js`, `app.js`, and the future controller layers communicate.
- [Request-Response Flow Diagram](./diagrams/request-response-flow.md) — Sequence diagram showing middleware ordering and execution.
- [Database Startup Flow Diagram](./diagrams/database-flow.md) — Illustrates the asynchronous startup sequence and safety checks.

---

## 💡 Top 5 JavaScript Prerequisites for Chai aur Code

### 1. Higher-Order Functions (HOFs)
A function that accepts another function as an argument, or returns a new function.  
**Where used in repo:** [`src/utils/asynchandler.js`](../src/utils/asynchandler.js#L3-L7)  
```javascript
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};
```
*Why?* It takes your async route controller and wraps it in a safety net.

### 2. Promises & `.then()` / `.catch()`
An object representing the eventual completion or failure of an asynchronous operation.  
**Where used in repo:** [`src/index.js`](../src/index.js#L9-L18)  
```javascript
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => { ... });
})
.catch((err) => { ... });
```
*Why?* Database connection takes time across the network. The server must NOT listen for requests until the database is ready.

### 3. `async` / `await`
Syntactic sugar over Promises that makes asynchronous code read like synchronous code.  
**Where used in repo:** [`src/db/db.js`](../src/db/db.js#L4-L6)  
```javascript
const connectDB = async function() {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
};
```
*Key rule:* An `async` function always returns a Promise automatically.

### 4. ES Modules (ESM) vs CommonJS
- **ES Modules:** `import express from "express"`, `export { app }`, `"type": "module"` in `package.json`. In Node.js ESM, local file paths **must include the extension** (`./db/db.js`).
- **CommonJS:** `const express = require('express')`, `module.exports = app`.

### 5. Object Destructuring & Property Shorthand
Extracting properties from objects into distinct variables.  
**Where used in repo:** [`src/db/db.js`](../src/db/db.js#L2)  
```javascript
import { DB_NAME } from "../constants.js";
```

---

## ⚡ 60-Second Request-Response Lifecycle Summary

1. **Client** (browser or mobile app) sends an HTTP Request (e.g. `POST /api/v1/users/register` with JSON body).
2. **Express** receives the request and passes the `(req, res)` objects through registered middleware in order:
   - `cors` checks if the frontend domain is permitted.
   - `express.json` parses raw binary buffer strings into a JavaScript object and assigns it to `req.body`.
   - `express.urlencoded` decodes URL-encoded parameters.
   - `cookieParser` extracts cookie headers into `req.cookies`.
3. Express matches the URL to a **Route** (e.g., `/register`).
4. The Route calls the **Controller** wrapped in `asyncHandler`.
5. The Controller queries **MongoDB** using **Mongoose models**.
6. MongoDB returns documents; the Controller prepares a response.
7. The Controller calls `res.status(200).json({ success: true, data })`.
8. The HTTP Response travels back over TCP/IP to the client.

---

## 🔄 Recently Added & Studied Concepts

- [x] Initializing Node project with `"type": "module"`
- [x] Prettier configuration (`.prettierrc`, `.prettierignore`)
- [x] Environment variable management with `dotenv`
- [x] MongoDB Atlas database connection in a separate module (`src/db/db.js`)
- [x] Professional Express application configuration (`src/app.js`)
- [x] Configuring standard middlewares: CORS, JSON parser, URL parser, static files, cookie parser
- [x] Production-grade `asyncHandler` higher-order utility function

---

## ⚠️ Concepts Requiring Immediate Attention / Verification in Code

1. **Missing `app` import in [`src/index.js`](../src/index.js#L12):**  
   `src/index.js` calls `app.listen(...)` inside `.then()`, but `app` is defined in `src/app.js` and has not been imported into `src/index.js`.
2. **Missing `return` and naming typo in [`src/utils/asynchandler.js`](../src/utils/asynchandler.js#L3-L9):**  
   The wrapper is defined as `asynhandler` (missing 'c') and exported as `asynchandler`. Also, the inner arrow function needs a `return` or implicit return.
3. **Empty directories waiting for implementation:**  
   `src/controllers/`, `src/middlewares/`, `src/models/`, `src/routes/` are currently empty directories awaiting future Chai aur Code lessons.
