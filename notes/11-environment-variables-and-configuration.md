# 11 — Environment Variables & Configuration Hygiene

> **Focus:** Understanding `dotenv`, `.env` files, `process.env`, `.gitignore`, `.prettierrc`, and configuration security in your backend.

---

### A. The Simple Idea
Environment variables are dynamic configuration values that live outside your application's source code. They allow the same codebase to run safely in different environments (development on your laptop, staging, or production cloud servers) with different database credentials, ports, and API keys.

---

### B. Why It Exists: The Security Disaster of Hardcoded Secrets
If you hardcode database passwords, JWT secrets, or payment API keys directly into your JavaScript files:
```javascript
// ❌ DANGEROUS! Never do this!
const uri = "mongodb+srv://admin:MySecretPassword123@cluster.mongodb.net";
```
As soon as you run `git push origin main`, your credentials become public on GitHub. Automated bots scan GitHub repositories every millisecond to harvest exposed database credentials and cloud keys.  
Environment variables solve this by keeping secret values in a local, uncommitted file (`.env`).

---

### C. A Practical Analogy: Hotel Room Keys vs Permanent Locks
Hardcoding secrets is like welding a physical brass padlock and key into the front door of every hotel room. If someone loses the key, you have to demolish and rebuild the door.  
Environment variables are like digital keycards: the door mechanism (code) stays identical, but the key code (credentials) can be programmed differently for each guest and revoked instantly without touching the door.

---

### D. The Technical Explanation: How `dotenv` Works
By default, Node.js reads environment variables from the host operating system via `process.env`.  
However, during local development, setting operating system variables manually is cumbersome.
The `dotenv` npm package:
1. Reads a plain text `.env` file from disk.
2. Parses its key-value pairs (`KEY=VALUE`).
3. Attaches them directly to Node's `process.env` global object in RAM.

---

### E. My Repository Implementation

#### 1. Configuring `dotenv`: [`src/index.js`](../src/index.js#L2-L7)
```javascript
//require('dotenv').config({path: './env'}) - commonjs syntax
import dotenv from "dotenv"
import connectDB from "./db/db.js";

dotenv.config({
    path: "./.env"
})
```

- **Line 2: `import dotenv from "dotenv"`:** Imports the module using modern ES Module syntax.
- **Lines 5-7: `dotenv.config({ path: "./.env" })`:**
  - Reads the `.env` file located in the root directory.
  - Attaches `PORT`, `MONGODB_URI`, and `CORS_ORIGIN` to `process.env`.
  - **⚠️ Note on the Dot in `./.env`:**  
    In an earlier session, you wrote `path: "./env"` (missing the dot). Because your file on disk is literally named `.env` (a hidden Unix file starting with a dot), `dotenv` could not find it. Writing `path: "./.env"` (or simply `dotenv.config()` without arguments when in the root folder) fixes this!

#### 2. Project Variables in `.env` (Structure Only — No Secrets)
```env
PORT = 8000
MONGODB_URI = mongodb+srv://<username>:<password>@<cluster-url>.mongodb.net
CORS_ORIGIN = *
```

#### 3. Configuration Security: `.gitignore` and `.prettierignore`
In your [`.prettierignore`](../.prettierignore), you protected your environment files:
```
*.env
.env
.env*

/node_modules
./dist
```
And in your `.gitignore`, `.env` is omitted from version control.  
*Rule:* **Never remove `.env` from `.gitignore`!**

#### 4. Code Formatting: [`.prettierrc`](../.prettierrc)
```json
{
    "singleQuote": false,
    "bracketSpacing": true,
    "tabWidth": 2,
    "semi": true,
    "trailingComma": "es5"
}
```
- `"singleQuote": false`: Standardizes code to use double quotes (`"express"`).
- `"semi": true`: Ensures all statements end with semicolons.
- `"tabWidth": 2`: Enforces 2-space indentation across all team members.

---

### F. JavaScript Prerequisite: String Coercion of `process.env`
Every value in `process.env` is **always stored as a string**:
- In `.env`, if you set `PORT = 8000`, `process.env.PORT` will be the string `"8000"`, not the number `8000`.
- If you check a boolean like `ENABLE_LOGS = false`, `process.env.ENABLE_LOGS` is the string `"false"`. In JavaScript, the non-empty string `"false"` is **truthy** (`Boolean("false") === true`)!
- If you need a number, convert it with `Number(process.env.PORT)` or `parseInt()`.

---

### G. Execution Flow
```mermaid
flowchart LR
    A[".env file on disk"] --> B["dotenv.config({ path: './.env' }) in src/index.js"]
    B --> C["process.env populated in Node memory"]
    C --> D["src/index.js reads process.env.PORT"]
    C --> E["src/db/db.js reads process.env.MONGODB_URI"]
    C --> F["src/app.js reads process.env.CORS_ORIGIN"]
```

---

### H. What Happens If It Is Missing or Incorrect?
- **Importing `connectDB` before calling `dotenv.config()`:**  
  If a file immediately accesses `process.env.MONGODB_URI` at the top level before `dotenv.config()` has executed, `process.env.MONGODB_URI` will be `undefined`, causing connection failures.
- **Accidentally pushing `.env` to GitHub:**  
  You must immediately revoke and delete the database user credentials in MongoDB Atlas and generate new ones, because Git history preserves committed files even if you delete them in a later commit!

---

### I. Connection to Other Concepts
- Connects to [02-nodejs-fundamentals.md](./02-nodejs-fundamentals.md) for how the `process` global works.
- Connects to [09-databases-and-mongodb.md](./09-databases-and-mongodb.md) for how the database URI is supplied.

---

### J. Quick Revision
- `.env` stores secret, environment-specific configuration values.
- `dotenv.config()` loads these values into `process.env`.
- All `process.env` values are strings.
- Always include `.env` in `.gitignore` to prevent secret leaks.
- Ensure the filename has a leading dot (`./.env`).

---

### K. Test Yourself
1. Why must `.env` always be listed in `.gitignore`?
2. If your `.env` contains `PORT = 8000`, what is the JavaScript `typeof process.env.PORT`?
3. What is the difference between setting `path: "./env"` vs `path: "./.env"`?
*(Answers can be reviewed in [revision/practice-questions.md](./revision/practice-questions.md))*
