# 00 — Backend Foundations & Project Architecture

> **Focus:** Understanding what a backend is, why the project is structured into specific folders, and how client-server communication works.

---

### A. The Simple Idea
A backend is a computer program running on a server that listens for requests over a network (like the internet), performs business logic (validating inputs, checking credentials), interacts with a persistent database, and sends back an appropriate response to the client (browser, mobile app, or API tester like Postman).

---

### B. Why It Exists
Frontend applications (React, Android, iOS) run directly on the user's device. You cannot store passwords, secret database credentials, or sensitive business algorithms on a user's phone or browser because any user can open Developer Tools and view the source code. The backend acts as a secure, trusted intermediary between the user interface and the database.

---

### C. A Practical Analogy: The Restaurant
- **The Client (Frontend):** The customer sitting at a dining table browsing the menu.
- **The API / Request:** The order written on a ticket and handed to the waiter.
- **The Server & Middleware (Backend):** The kitchen manager and chefs who check if ingredients are available, verify food allergies, and prepare the dish safely according to recipe rules.
- **The Database:** The pantry / refrigerator where raw ingredients are preserved long-term.

---

### D. The Technical Explanation
When a user visits a video streaming website:
1. The frontend initiates a TCP network connection to the server's IP address and port (e.g., `http://localhost:8000`).
2. The frontend sends an HTTP request (method, headers, body).
3. The Node.js runtime receives the raw network bytes.
4. Express parses those bytes, checks configured middlewares, and executes route logic.
5. The backend communicates with MongoDB to query or update data.
6. The backend formats the data into JSON and sends an HTTP response back to the client.

---

### E. My Repository Implementation

In your repository, you organized your backend into a clean modular structure under `src/`:

```
/Users/harshitagupta/Video Streaming backend project/
├── .env                     <-- Environment configurations (ports, URIs)
├── package.json             <-- Project manifest & dependencies
├── public/                  <-- Static public assets
│   └── temp/                <-- Temporary folder for file uploads (Multer)
└── src/
    ├── app.js               <-- Express application setup & middleware registration
    ├── constants.js         <-- Project-wide immutable constants (e.g. DB_NAME)
    ├── index.js             <-- Main entry point: loads .env, connects DB, starts server
    ├── controllers/         <-- (Prepared) Business logic handlers for incoming requests
    ├── db/
    │   └── db.js            <-- Modular MongoDB connection logic via Mongoose
    ├── middlewares/         <-- (Prepared) Custom interceptors (e.g., auth, file upload)
    ├── models/              <-- (Prepared) Mongoose database schemas & models
    ├── routes/              <-- (Prepared) URL endpoint declarations mapping to controllers
    └── utils/
        └── asynchandler.js  <-- Helper wrapper for async operations & error forwarding
```

#### Why Separate `index.js` and `app.js`?
In early tutorials, people often put `express()`, database connections, routes, and `app.listen()` all inside a single `index.js`.  
In Chai aur Code, Hitesh separates them:
1. [`src/app.js`](../src/app.js): Responsible solely for configuring Express, setting up middlewares, and binding routes.
2. [`src/index.js`](../src/index.js): Responsible solely for starting the application: loading environment variables, connecting to the database, and calling `app.listen()`.

*Benefit:* This allows you to test your Express app without actually opening network ports, and ensures the database is fully connected before any user request can hit the server.

---

### F. JavaScript Prerequisite: Directory Structure & File Paths
In JavaScript backends running on Node.js:
- `./` means **current directory** (e.g., `./db/db.js` inside `src/index.js` refers to `src/db/db.js`).
- `../` means **parent directory** (e.g., `../constants.js` inside `src/db/db.js` goes up from `src/db/` to `src/`).
- Because your `package.json` specifies `"type": "module"`, all relative imports must include the file extension (`.js`).

---

### G. Execution Flow
1. Developer runs `npm run dev` in the terminal.
2. `nodemon` executes `node src/index.js`.
3. `src/index.js` executes top to bottom:
   - Configures `dotenv`.
   - Imports `connectDB` from `src/db/db.js`.
   - Executes `connectDB()`.
4. Once MongoDB responds with a successful connection, the `.then()` block triggers.
5. `app.listen(PORT)` binds the process to port 8000.
6. The terminal logs: `Server is running at port : 8000`.

---

### H. What Happens If It Is Missing or Incorrect?
- **If `connectDB()` fails before `app.listen()`:** The `.catch()` block catches the database error, logs it, and prevents the server from taking incoming requests when the database is unavailable.
- **If `app` is not imported into `index.js`:** The code will crash at runtime with `ReferenceError: app is not defined` when trying to call `app.listen()`.

---

### I. Connection to Other Concepts
- Connects to [02-nodejs-fundamentals.md](./02-nodejs-fundamentals.md) for how Node executes the scripts.
- Connects to [04-express-fundamentals.md](./04-express-fundamentals.md) for how `app.js` is built.
- Connects to [09-databases-and-mongodb.md](./09-databases-and-mongodb.md) for how the database layer initializes.

---

### J. Quick Revision
- A backend receives HTTP requests, executes business logic, queries databases, and returns HTTP responses.
- `src/index.js` is the server launcher.
- `src/app.js` is the Express application configurator.
- Always connect to the database *before* listening on a network port.

---

### K. Test Yourself
1. Why is it dangerous to let the frontend query MongoDB directly without a backend?
2. What is the architectural purpose of keeping `app.js` separate from `index.js`?
3. What does `./` vs `../` represent in file import statements?
*(Answers can be reviewed in [revision/practice-questions.md](./revision/practice-questions.md))*
