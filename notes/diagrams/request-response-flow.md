# 🔄 Request-Response Lifecycle Flow Diagram

> **Focus:** Detailed sequence diagram showing how an incoming HTTP request travels through the middleware stack, enters an asynchronous controller wrapped in `asyncHandler`, interacts with the database, and returns as an HTTP response.

---

## ⚡ Sequence Diagram: Full HTTP Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Client as 💻 Client (Browser / Postman)
    participant Node as 🟢 Node.js HTTP Server (Port 8000)
    participant CORS as 🛡️ cors()
    participant JSON as 📦 express.json({limit: "16kb"})
    participant URL as 📝 express.urlencoded()
    participant Static as 📂 express.static("public")
    participant Cookie as 🍪 cookieParser()
    participant Route as 🗺️ Express Router
    participant Wrapper as 🪂 asyncHandler Wrapper
    participant Controller as ⚙️ Controller (Business Logic)
    participant DB as 🗄️ MongoDB Atlas (via Mongoose)

    Client->>Node: HTTP POST /api/v1/users/register (with JSON body)
    Node->>CORS: Pass (req, res, next)
    CORS->>CORS: Validate Origin Header against CORS_ORIGIN
    CORS->>JSON: next()
    
    JSON->>JSON: Buffer raw stream chunks (verify <= 16kb)
    JSON->>JSON: Parse JSON and populate req.body
    JSON->>URL: next()
    
    URL->>URL: Check if URL-encoded (skip if JSON)
    URL->>Static: next()
    
    Static->>Static: Check if file matches public/ path
    Static->>Cookie: next() (no static match)
    
    Cookie->>Cookie: Parse Cookie headers into req.cookies
    Cookie->>Route: next()
    
    Route->>Wrapper: Match POST /api/v1/users/register
    Wrapper->>Controller: Execute registerUser(req, res, next)
    
    activate Controller
    Controller->>DB: await User.create(req.body)
    activate DB
    DB-->>Controller: Return saved user document
    deactivate DB
    
    Controller->>Client: res.status(201).json({ success: true, data: user })
    deactivate Controller
```

---

## 🛑 What Happens When an Error Occurs?

```mermaid
sequenceDiagram
    autonumber
    participant Controller as ⚙️ Async Controller
    participant DB as 🗄️ MongoDB Atlas
    participant Wrapper as 🪂 asyncHandler
    participant ErrorMW as 🚨 Express Global Error Handler
    actor Client as 💻 Client

    Controller->>DB: await User.create(...) (e.g. Duplicate Key Error)
    DB-->>Controller: Reject Promise (MongoServerError: E11000)
    Controller-->>Wrapper: Exception uncaught inside controller
    Wrapper->>Wrapper: .catch(error => next(error))
    Wrapper->>ErrorMW: Forward to next(error)
    ErrorMW->>Client: res.status(error.statusCode || 500).json({ error: error.message })
```

---

## 📖 Key Takeaways from the Diagrams

1. **Ordering is Absolute:** Notice how middlewares execute in steps 2 through 7. If `express.json()` were placed after step 8 (the router), the controller in step 10 would receive `req.body === undefined`.
2. **`next()` is the Baton:** Like runners in a relay race, each middleware must hand off the baton by calling `next()`. If one runner stops and doesn't pass the baton, the request hangs forever.
3. **`asyncHandler` Intercepts Failures:** If MongoDB throws an error (e.g. invalid password, duplicate email, timeout), `asyncHandler` captures the rejection in `.catch()` and invokes `next(error)`, directing the flow to Express's error handling.
