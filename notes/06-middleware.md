# 06 — Middleware Architecture in Express

> **Focus:** Deep breakdown of Express middleware, `app.use()`, the `next()` function, and line-by-line analysis of all middlewares configured in `src/app.js`.

---

### A. The Simple Idea
Middleware is code that executes **in the middle**—between the moment the server receives an HTTP request and the moment your route handler sends back a response. A middleware function has access to the Request object (`req`), Response object (`res`), and a special function called `next()`.

---

### B. Why It Exists
Instead of rewriting security checks, JSON parsing, and cookie extraction inside every single route controller, middleware lets you extract these cross-cutting concerns into reusable stages that run automatically for all incoming requests.

---

### C. A Practical Analogy: Toll Booth Gates
Imagine cars driving on a highway to a theme park:
- **Toll Gate 1 (CORS):** Checks license plates; turns away cars from prohibited jurisdictions.
- **Toll Gate 2 (express.json):** Measures package size and translates customs forms.
- **Toll Gate 3 (cookieParser):** Checks annual pass badges.
- **Theme Park Entrance (Route Handler):** Lets the visitor enjoy the ride.
At each toll booth, the gate arm lifts only when the officer signals `next()`. If a gate refuses entry, it turns the car around (`res.status(403).json()`) and the car never reaches the rides.

---

### D. The Technical Explanation: The Signature of Middleware
Every Express middleware has the following signature:
```javascript
function myMiddleware(req, res, next) {
    // 1. Inspect or modify req or res
    // 2. Either pass control to the next middleware:
    next();
    // 3. Or terminate the cycle and send a response:
    // res.status(400).json({ error: "Access denied" });
}
```

- If you don't call `next()` and don't call `res.json()`, the client request will **hang forever** until the browser times out.
- Calling `app.use(fn)` pushes `fn` onto the global middleware stack executed in strict registration order.

---

### E. My Repository Implementation: Line-by-Line Breakdown of [`src/app.js`](../src/app.js)

```javascript
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

//cors middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials : true
})) 

//Express can parse a JSON request body before your route handler tries to access req.body.
app.use(express.json({limit : "16kb"}))

//Express can parse a URL request body. "extended" keyword allows use to pass object inside another object(nested).
app.use(express.urlencoded({extended: true, limit: "16kb"}))

//Used to keep some file/folders/assets/img/pdfs. This "public" is a folder in our project directory.
app.use(express.static("public"))

//allows only browser to rea the cookies.
app.use(cookieParser())

export { app }
```

#### 1. CORS Configuration (Lines 8-11)
```javascript
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
```
- **What is CORS?** Cross-Origin Resource Sharing. By default, web browsers block web pages on one origin (e.g. `http://localhost:3000` for your React frontend) from requesting APIs on a different origin (e.g. `http://localhost:8000` for your backend).
- **`origin: process.env.CORS_ORIGIN`:** Specifies which frontend domains are allowed to communicate with this backend. In your `.env`, you set `CORS_ORIGIN=*` (allowing all domains in development, or a specific frontend URL in production).
- **`credentials: true`:** Allows HTTP requests to include Authorization headers, TLS client certificates, and HTTP cookies across origins.

#### 2. JSON Body Parser (Line 14)
```javascript
app.use(express.json({ limit: "16kb" }))
```
- Built-in middleware introduced in Express 4.16+.
- Parses incoming requests with `Content-Type: application/json`.
- Populates `req.body` with the parsed JavaScript object.
- **`{ limit: "16kb" }`:** Security protection! Without a size limit, an attacker could send a 1GB JSON string that exhausts server RAM and causes an Out-Of-Memory (OOM) crash (Denial of Service attack). Setting `16kb` ensures only reasonably sized JSON payloads are accepted.

#### 3. URL-Encoded Form Parser (Line 17)
```javascript
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
```
- Parses incoming requests with `Content-Type: application/x-www-form-urlencoded` (standard HTML form submissions).
- **`extended: true`:** Uses the `qs` library under the hood, allowing parsing of deeply nested objects (e.g., `user[profile][name]=Harshita` becomes `{ user: { profile: { name: "Harshita" } } }`).
- **`limit: "16kb"`:** Restricts URL-encoded payloads to 16 kilobytes.

#### 4. Static Asset Server (Line 20)
```javascript
app.use(express.static("public"))
```
- Serves static files (images, PDFs, favicons, audio) directly from the [`public/`](../public) directory.
- *Example:* If you place `logo.png` inside `public/`, any client can open `http://localhost:8000/logo.png` without writing a custom route!
- Notice you created [`public/temp/`](../public/temp) with a `.gitkeep` file. This folder will be used by **Multer** in upcoming Chai aur Code lessons to temporarily store uploaded video/image files before uploading them to Cloudinary.

#### 5. Cookie Parser (Line 23)
```javascript
app.use(cookieParser())
```
- Inspects the `Cookie` header on incoming HTTP requests.
- Parses the raw string (`"accessToken=xyz; refreshToken=abc"`) and populates `req.cookies` as an easy-to-use JavaScript object:
  ```javascript
  req.cookies.accessToken // "xyz"
  ```
- Also allows your controllers to set cookies on the client's browser securely using `res.cookie()`.

---

### F. JavaScript Prerequisite: Object Option Configurations
In lines 8, 14, and 17, notice that Express middlewares accept **configuration objects**:
```javascript
cors({ origin: "...", credentials: true })
```
- In JavaScript, functions often accept a single options object instead of multiple positional arguments (`cors(origin, credentials, methods)`).
- *Benefits:* The order of keys does not matter, options are self-documenting, and any unsupplied key simply takes its default value.

---

### G. Execution Order Matters!
Express executes middlewares **in the exact order they are registered via `app.use()`**.
- If you place `app.use(express.json())` **below** your route handlers, the route handlers will run first, see `req.body` as `undefined`, and fail.
- Always register global parsers and security middlewares at the top of `src/app.js` before routes!

---

### H. What Happens If It Is Missing or Incorrect?
- **Missing `cors()`:** Browsers will show a red console error: `Access to XMLHttpRequest at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy`.
- **Missing `cookieParser()`:** Trying to read `req.cookies.accessToken` in authentication middleware throws `TypeError: Cannot read properties of undefined (reading 'accessToken')`.

---

### I. Connection to Other Concepts
- Connects to [08-async-javascript-and-errors.md](./08-async-javascript-and-errors.md) for custom error-handling middleware with 4 arguments: `(err, req, res, next)`.
- Connects to [07-routing-and-controllers.md](./07-routing-and-controllers.md) for how routes are mounted after middlewares.

---

### J. Quick Revision
- Middleware runs between request arrival and response dispatch.
- Every middleware has `(req, res, next)` and must call `next()` or send a response.
- `cors()` manages cross-origin browser permissions.
- `express.json({ limit: "16kb" })` populates `req.body`.
- `cookieParser()` populates `req.cookies`.
- Registration order dictates execution order.

---

### K. Test Yourself
1. Why is `{ limit: "16kb" }` added to `express.json()` and `express.urlencoded()`?
2. What happens if a middleware does not call `next()` and does not send a response?
3. Where does `express.static("public")` look when a browser requests `/temp/test.png`?
*(Answers can be reviewed in [revision/practice-questions.md](./revision/practice-questions.md))*
