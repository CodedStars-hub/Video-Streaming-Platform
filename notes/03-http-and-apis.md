# 03 — HTTP Protocol & API Fundamentals

> **Focus:** How clients and servers speak to each other using HTTP, request headers, status codes, and the critical differences between `req.body`, `req.params`, and `req.query`.

---

### A. The Simple Idea
HTTP (Hypertext Transfer Protocol) is the standardized language of the World Wide Web. When a client wants to communicate with your backend, it sends an **HTTP Request** formatted as plain text containing a method, a URL, headers, and an optional body. Your backend processes this request and returns an **HTTP Response** with a status code, headers, and data (usually formatted as JSON).

---

### B. Why It Exists
Computers across the globe run different operating systems (Windows, macOS, Linux, Android, iOS) and use different programming languages (JavaScript, Swift, Kotlin, Python). HTTP provides an operating-system-neutral, universal protocol so any client device can communicate with any server without needing to understand each other's internal architecture.

---

### C. A Practical Analogy: Sending a Postal Package
- **The URL / Endpoint:** The recipient address written on the front of the envelope (`/api/v1/users/register`).
- **The HTTP Method:** The instruction stamped on the package:
  - `GET`: "Please show me this document."
  - `POST`: "Please accept this new package and store it."
  - `DELETE`: "Please destroy the record at this address."
- **Headers:** Metadata stamped by the post office (return address, timestamp, language, payload size, authentication stamp).
- **Body:** The actual contents inside the package (e.g., username, email, password encoded in JSON).
- **Status Code:** The delivery confirmation slip:
  - `200 OK`: Package delivered successfully.
  - `404 Not Found`: No building exists at this address.
  - `500 Server Error`: The postal warehouse caught fire while sorting your package.

---

### D. The Technical Explanation

#### 1. Common HTTP Methods (RESTful Verbs)
| Method | Purpose | Has Request Body? | Example Use Case |
|:---|:---|:---:|:---|
| **GET** | Retrieve data from server | No | Fetch video details, list videos |
| **POST** | Create new resource or submit data | Yes | Register user, upload video, login |
| **PUT** | Completely replace an existing resource | Yes | Replace full user profile |
| **PATCH** | Partially update an existing resource | Yes | Update only user avatar or change password |
| **DELETE** | Remove an existing resource | No | Delete a video, remove a comment |

#### 2. HTTP Status Code Categories
- **`2xx` (Success):** Everything worked as expected.
  - `200 OK`: Standard successful request.
  - `201 Created`: Resource was successfully created on the server (e.g. new user registered).
- **`3xx` (Redirection):** Further action needs to be taken by the client.
  - `301 Moved Permanently`: The URL has permanently changed.
- **`4xx` (Client Errors):** The client sent something invalid.
  - `400 Bad Request`: Validation failure (e.g. missing required email).
  - `401 Unauthorized`: Client is not authenticated (missing or invalid token).
  - `403 Forbidden`: Authenticated, but lacks permission (e.g. non-admin accessing admin portal).
  - `404 Not Found`: Requested endpoint or resource does not exist.
  - `409 Conflict`: Resource already exists (e.g. email or username already taken).
- **`5xx` (Server Errors):** The backend crashed or failed internally.
  - `500 Internal Server Error`: An uncaught exception occurred in route logic.
  - `502 Bad Gateway` / `503 Service Unavailable`: Server is overloaded or database is down.

---

### E. My Repository Implementation: Extracting Request Data

When a request enters your Express application, data can arrive in three distinct places. Express exposes these on the `req` object:

```
                          Incoming Request
                                │
        ┌───────────────────────┼────────────────────────┐
        ▼                       ▼                        ▼
    req.body               req.params                req.query
(Parsed by middleware)  (Route URL parameters)   (URL query string after ?)
```

#### 1. `req.body`
Data sent in the payload (usually as JSON or form data).
- In [`src/app.js:14`](../src/app.js#L14), you configured:
  ```javascript
  app.use(express.json({ limit: "16kb" }));
  ```
- Before this middleware runs, `req.body` is `undefined` because raw network data arrives as a stream of bytes.
- This middleware parses that JSON stream and attaches the resulting JavaScript object to `req.body`.
- *Example:* When registering, frontend sends `{"username": "harshita", "email": "test@test.com"}`. You access `req.body.username`.

#### 2. `req.params`
Variable segments embedded directly inside the URL route path.
- *Route definition:* `/api/v1/videos/:videoId`
- *Client URL:* `/api/v1/videos/64b59f3a123`
- *Access in code:* `const { videoId } = req.params;` (`req.params.videoId === "64b59f3a123"`).

#### 3. `req.query`
Key-value pairs appended after the `?` mark in the URL, separated by `&`.
- *Client URL:* `/api/v1/videos?page=1&limit=10&sortBy=views`
- *Access in code:* `req.query.page` (`"1"`), `req.query.limit` (`"10"`).

---

### F. JavaScript Prerequisite: Object vs JSON
- **JavaScript Object:** A living in-memory data structure in JavaScript (e.g. `{ name: "Harshita", age: 22 }`). Functions, circular references, and undefined properties are permitted.
- **JSON (JavaScript Object Notation):** A standardized text string format (e.g. `'{"name":"Harshita","age":22}'`).
  - Keys must be wrapped in double quotes (`"key"`).
  - Can be sent over the internet as a UTF-8 string.
  - `JSON.stringify(obj)` converts a JS object into a JSON string.
  - `JSON.parse(str)` converts a JSON string back into a JS object.

---

### G. Execution Flow
1. Client sends HTTP request: `POST /api/v1/users/register` with Header `Content-Type: application/json` and Body `{"username": "harshita"}`.
2. Express passes the raw bytes through `express.json()`.
3. `express.json()` reads the body, parses it, and populates `req.body = { username: "harshita" }`.
4. Your controller receives `(req, res)` via `asyncHandler`.
5. Your controller creates the user and calls `res.status(201).json({ message: "User registered" })`.
6. Express serializes the object to JSON, sets Header `Content-Type: application/json; charset=utf-8`, sets Status Code `201`, and sends the response.

---

### H. What Happens If It Is Missing or Incorrect?
- **Forgetting `app.use(express.json())`:** If you try to access `req.body.username`, JavaScript throws a `TypeError: Cannot read properties of undefined (reading 'username')` because `req.body` is `undefined`.
- **Sending Wrong Status Codes (e.g., returning 200 for a server crash):** The client's frontend code checks `res.ok` (status 200-299) and mistakenly assumes the operation succeeded, leading to broken UI states.

---

### I. Connection to Other Concepts
- Connects to [06-middleware.md](./06-middleware.md) for how `express.json()` and `express.urlencoded()` parse request streams.
- Connects to [08-async-javascript-and-errors.md](./08-async-javascript-and-errors.md) for how status codes are returned on errors.

---

### J. Quick Revision
- HTTP is a request-response protocol between client and server.
- **GET** retrieves, **POST** creates, **PUT/PATCH** updates, **DELETE** removes.
- Status codes: **2xx** = OK, **4xx** = Client mistake, **5xx** = Server mistake.
- **`req.body`** = Payload data, **`req.params`** = URL route variables (`:id`), **`req.query`** = Search filters (`?key=value`).

---

### K. Test Yourself
1. If a client sends a request to `/users?search=john`, where in Express do you read `"john"`?
2. Why is `req.body` undefined if you do not register `express.json()` middleware?
3. Which status code should you return when a user is successfully registered in the database?
*(Answers can be reviewed in [revision/practice-questions.md](./revision/practice-questions.md))*
