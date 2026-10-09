# 05 — The Complete Request-Response Lifecycle

> **Focus:** Step-by-step end-to-end tracing of an HTTP request through your backend architecture—from the moment a user clicks a button to the final JSON response.

---

### A. The Simple Idea
The Request-Response Lifecycle is the complete journey an HTTP message takes through your server. A client sends a **Request (`req`)**, your server passes it through security gates and parsers (**Middlewares**), executes your business logic (**Routes & Controllers**), interacts with the database (**Mongoose & MongoDB**), and finally returns a formatted **Response (`res`)** back to the client.

---

### B. Why It Exists
Web servers are stateless. Each request from a client is an independent transaction. To handle thousands of users concurrently without chaos, the backend must follow a predictable, sequential pipeline for every incoming message.

---

### C. A Practical Analogy: An International Airport Security Terminal
1. **The Passenger arrives:** Client makes an HTTP request.
2. **Passport Control (CORS Middleware):** Checks if the passenger comes from an authorized country/origin (`origin: process.env.CORS_ORIGIN`).
3. **Baggage Scanner (JSON / URL Parser):** Inspects luggage, checks that weight is under 16kb (`limit: "16kb"`), and organizes items into compartments (`req.body`).
4. **Duty-Free Stamp (Cookie Parser):** Checks passenger ID cards and wristbands (`req.cookies`).
5. **Gate Assignment (Router):** Matches ticket destination (URL) to the exact flight departure gate.
6. **Flight Captain (Controller):** Executes the flight plan, fetches supplies from central storage (**MongoDB**), and lands safely.
7. **Baggage Claim (HTTP Response):** Delivers items safely back into the passenger's hands.

---

### D. The Technical Breakdown of the 10 Stages

```
[1. Client Request] ──> [2. TCP Socket on Port 8000]
                                  │
                                  ▼
[3. CORS Middleware] ─── Verifies Origin & Credentials
                                  │
                                  ▼
[4. express.json()] ──── Buffers raw payload -> Attaches to req.body
                                  │
                                  ▼
[5. express.urlencoded()] Parses form data
                                  │
                                  ▼
[6. express.static()] ── Checks if file exists in public/
                                  │
                                  ▼
[7. cookieParser()] ──── Extracts cookies -> Attaches to req.cookies
                                  │
                                  ▼
[8. Router & Route Handler] Matches HTTP Method + Path
                                  │
                                  ▼
[9. Controller wrapped in asyncHandler]
    ├── Awaits Mongoose query to MongoDB Atlas
    └── Formulates JSON payload
                                  │
                                  ▼
[10. res.status(200).json()] Response sent -> Socket closed
```

| Stage | Responsible File | Synchronous or Asynchronous? | What can go wrong? |
|:---|:---|:---:|:---|
| **1. Server Start & DB Connect** | [`src/index.js`](../src/index.js), [`src/db/db.js`](../src/db/db.js) | **Asynchronous** | MongoDB auth fails, wrong URI, port already in use |
| **2. CORS Check** | [`src/app.js:8`](../src/app.js#L8) | Synchronous | Origin not allowed; browser blocks request with CORS error |
| **3. Body Parsing** | [`src/app.js:14-17`](../src/app.js#L14-L17) | **Asynchronous stream** | Payload > 16kb throws `PayloadTooLargeError: request entity too large` |
| **4. Static File Check** | [`src/app.js:20`](../src/app.js#L20) | Asynchronous I/O | If file found in `public/`, sends file directly and skips routes |
| **5. Cookie Parsing** | [`src/app.js:23`](../src/app.js#L23) | Synchronous | Malformed cookie headers |
| **6. Route Matching** | `src/routes/` *(Future)* | Synchronous | No route matches; falls through to 404 handler |
| **7. Controller Execution** | `src/controllers/` *(Future)* | **Asynchronous** | Missing validation, syntax errors, uncaught exceptions |
| **8. Database Query** | `src/models/` & MongoDB | **Asynchronous** | Network timeout, duplicate key error (e.g. username exists) |
| **9. Response Dispatch** | `res.status().json()` | Synchronous | Calling `res.json()` twice throws `Cannot set headers after they are sent` |

---

### E. Concrete Walkthrough with Code

Let's trace an illustrative user registration request:

1. **Client Action:** Postman sends:
   - Method: `POST`
   - URL: `http://localhost:8000/api/v1/users/register`
   - Header: `Content-Type: application/json`
   - Body: `{"username": "harshita", "email": "test@example.com"}`

2. **Step in `src/app.js` (Lines 8-11):**
   ```javascript
   app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))
   ```
   *Action:* Express inspects the request origin header. If allowed, adds `Access-Control-Allow-Origin` response header and calls `next()`.

3. **Step in `src/app.js` (Line 14):**
   ```javascript
   app.use(express.json({ limit: "16kb" }))
   ```
   *Action:* Express collects incoming network chunks. Since body size is < 16kb, it parses the JSON and sets:
   `req.body = { username: "harshita", email: "test@example.com" }`. Calls `next()`.

4. **Step in Route & Controller Layer (Target Implementation):**
   ```javascript
   // Handled via asyncHandler (src/utils/asynchandler.js)
   const registerUser = asyncHandler(async (req, res) => {
       const { username, email } = req.body;
       const user = await User.create({ username, email });
       return res.status(201).json({
           statusCode: 201,
           data: user,
           message: "User registered successfully"
       });
   });
   ```
   *Action:* Controller extracts `username` and `email` from `req.body`, awaits creation in MongoDB Atlas, and returns a 201 Created status.

5. **Client Reception:** Client receives:
   - Status: `201 Created`
   - Content-Type: `application/json`
   - Body: `{ "statusCode": 201, "data": { "_id": "...", "username": "harshita" }, "message": "User registered successfully" }`

---

### F. JavaScript Prerequisite: Stream Buffering
HTTP request bodies do not arrive on the server in one single instant. Large payloads are transmitted over TCP in chunks called **Streams**.
- Express's `express.json()` listens for `'data'` events as chunks arrive, buffers them into memory, verifies the buffer doesn't exceed `16kb`, and calls `JSON.parse()`.

---

### G. Execution Flow Diagram
See the dedicated interactive sequence diagram in [diagrams/request-response-flow.md](./diagrams/request-response-flow.md).

---

### H. What Happens If It Is Missing or Incorrect?
- **Sending headers twice:** If your code has:
  ```javascript
  res.status(200).json({ message: "First" });
  res.status(200).json({ message: "Second" }); // ❌ CRASH!
  ```
  Express throws: `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client`. You can only send **one** HTTP response per request!

---

### I. Connection to Other Concepts
- Connects to [06-middleware.md](./06-middleware.md) for how the middleware pipeline passes data forward via `next()`.
- Connects to [08-async-javascript-and-errors.md](./08-async-javascript-and-errors.md) for what happens when an async controller throws an error during the lifecycle.

---

### J. Quick Revision
- A request enters through `app.listen()` -> travels through `app.use()` middlewares in order -> enters matching route handler -> executes database operations -> sends response via `res.json()`.
- Never call `res.json()` or `res.send()` more than once for a single request.
- Middleware functions must either call `next()` or send a response (`res.json()`), otherwise the request will hang indefinitely.

---

### K. Test Yourself
1. What error occurs if your controller calls `res.json()` twice for the same request?
2. Why does the server hang (loading spinner forever) if a middleware forgets to call `next()` and doesn't send a response?
3. In what order does Express execute middlewares registered with `app.use()`?
*(Answers can be reviewed in [revision/practice-questions.md](./revision/practice-questions.md))*
