# ⚠️ Common Mistakes, Pitfalls & Real Debugging Logs

> **Focus:** Real mistakes encountered in this repository, verified failure modes, and classic backend pitfalls—with exact error messages and debugging steps.

---

## 🚨 Category 1: Verified Issues in This Codebase

### 1. The Missing `.js` File Extension in ES Modules
- **The Incorrect Code:**
  ```javascript
  import connectDB from "./db/db";
  import { DB_NAME } from "../constants";
  ```
- **Why It Fails:**  
  In your `package.json`, you set `"type": "module"`. Unlike CommonJS or bundlers like Vite, native Node.js ES Modules **strictly mandate full relative file paths including extensions**.
- **The Error Output:**
  ```text
  Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/.../src/db/db' imported from /.../src/index.js
  ```
- **The Fix:**
  ```javascript
  import connectDB from "./db/db.js";
  import { DB_NAME } from "../constants.js";
  ```

---

### 2. Directory Import in ES Modules
- **The Incorrect Code:**
  ```javascript
  import connectDB from "./db";
  ```
- **Why It Fails:**  
  In CommonJS, `require("./db")` automatically looked for `index.js` inside the `db` folder. In Node.js ES Modules, automatic directory resolution is unsupported.
- **The Error Output:**
  ```text
  Error [ERR_UNSUPPORTED_DIR_IMPORT]: Directory import '/.../src/db' is not supported resolving ES modules
  ```
- **The Fix:**  
  Always specify the exact filename: `import connectDB from "./db/db.js";` (or `./db/index.js`).

---

### 3. Running `nodemon index.js` from Root Instead of `src/index.js`
- **The Incorrect Command:**
  ```bash
  npx nodemon index.js
  ```
- **Why It Fails:**  
  When run from the project root (`/Users/.../Video Streaming backend project`), Node looks for `index.js` directly in the root directory. But your file is located inside `src/index.js`.
- **The Error Output:**
  ```text
  Error: Cannot find module '/Users/.../Video Streaming backend project/index.js'
  ```
- **The Fix:**  
  Always run the npm script configured in your `package.json`:
  ```bash
  npm run dev
  ```
  *(Which runs `nodemon src/index.js`).*

---

### 4. Typo in `.env` Path (`"./env"` vs `"./.env"`)
- **The Incorrect Code:**
  ```javascript
  dotenv.config({ path: "./env" });
  ```
- **Why It Fails:**  
  The file on disk is `.env` (starts with a dot). Passing `"./env"` tells `dotenv` to look for a file named `env` without a dot. It fails silently, leaving all variables in `process.env` as `undefined`!
- **How to Debug:**  
  Log `console.log(process.env.PORT)`. If it prints `undefined`, `dotenv` did not find the file.
- **The Fix:**
  ```javascript
  dotenv.config({ path: "./.env" });
  // Or simply: dotenv.config() (defaults to root .env)
  ```

---

### 5. Missing `return` in Higher-Order Arrow Function
- **The Problem in [`src/utils/asynchandler.js:3-7`](../src/utils/asynchandler.js#L3-L7):**
  ```javascript
  const asynhandler = (requestHandler) => {
      (req, res, next) => {
          Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error))
      }
  }
  ```
- **Why It Fails:**  
  In arrow functions, if you wrap the body in curly braces `{ ... }`, you **must explicitly write `return`**. Without `return`, `asynhandler` executes the block and returns `undefined`.
- **The Consequence:**  
  When passed to a route (`router.post("/register", asyncHandler(registerUser))`), Express throws:
  ```text
  Route.post() requires a callback function but got a [object Undefined]
  ```
- **The Fix:**
  ```javascript
  const asyncHandler = (requestHandler) => {
      return (req, res, next) => {
          Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error));
      };
  };
  ```

---

### 6. Mismatched Function Name & Export
- **The Problem in [`src/utils/asynchandler.js`](../src/utils/asynchandler.js):**
  - Line 3: `const asynhandler = ...` (missing 'c')
  - Line 9: `export { asynchandler }` (with a 'c')
- **The Consequence:**  
  ```text
  ReferenceError: asynchandler is not defined
  ```
- **The Fix:**  
  Ensure spelling is identical everywhere: `const asyncHandler = ...; export { asyncHandler };`

---

### 7. Unimported `app` in [`src/index.js`](../src/index.js#L12)
- **The Problem in [`src/index.js:11-15`](../src/index.js#L11-L15):**
  ```javascript
  connectDB()
  .then(() => {
      app.listen(process.env.PORT || 8000, () => { ... })
  })
  ```
  `app` is used, but nowhere in `src/index.js` is `import { app } from "./app.js";` written!
- **The Consequence:**  
  The moment MongoDB connects and `.then()` executes, the server crashes with:
  ```text
  ReferenceError: app is not defined
  ```
- **The Fix:**  
  Add to top of `src/index.js`:
  ```javascript
  import { app } from "./app.js";
  ```

---

## 📚 Category 2: Classic Backend & Express Mistakes

### 8. `Cannot set headers after they are sent to the client`
- **The Cause:** Calling `res.json()` or `res.send()` more than once in the same route execution.
- **Example:**
  ```javascript
  if (!user) {
      res.status(404).json({ error: "Not found" });
      // Missing 'return' statement here!
  }
  res.status(200).json({ user }); // ❌ Runs anyway and tries to send a second response!
  ```
- **The Fix:** Always `return` when sending early responses:
  ```javascript
  if (!user) {
      return res.status(404).json({ error: "Not found" });
  }
  ```

---

### 9. Hanging Request (Infinite Spinner)
- **The Cause:** A custom middleware neither calls `next()` nor sends a response via `res.json()`.
- **The Fix:** Every middleware branch must terminate either with `next()` or `res.status(...).json(...)`.

---

### 10. Forgetting to Whitelist IP on MongoDB Atlas
- **The Cause:** Switching from college Wi-Fi to home Wi-Fi changes your public IP address.
- **The Error Output:**
  ```text
  MongoServerSelectionError: connection timed out / could not connect to server
  ```
- **The Fix:** Open MongoDB Atlas -> **Network Access** -> Add IP address (`0.0.0.0/0` for development).
