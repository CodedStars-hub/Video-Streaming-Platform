# 🧠 Practice Questions & Interview Viva

> **Focus:** Active recall, code prediction, JavaScript syntax tests, and backend architectural questions.  
> 💡 *Attempt to answer all questions on paper or in your head before scrolling down to the Answer Key at the bottom!*

---

## 📝 Part 1: JavaScript & Syntax Tests

### Q1. Code Output Prediction: Arrow Function Returns
Look at this snippet:
```javascript
const makeHandler = (handler) => {
    (req, res, next) => {
        handler(req, res, next);
    };
};

const myRoute = makeHandler(() => console.log("Ran"));
console.log(typeof myRoute);
```
**Question:** What will `console.log(typeof myRoute)` print? Why?

---

### Q2. Asynchronous Execution Order
Consider this script:
```javascript
console.log("1. Starting");

async function testDB() {
    console.log("2. Inside async function");
    await Promise.resolve();
    console.log("3. After await");
}

testDB();
console.log("4. Finished script");
```
**Question:** In what exact numerical order will the messages print to the console?

---

### Q3. ES Module Import Resolution
A project has `"type": "module"` in `package.json`. In `src/index.js`, the developer writes:
```javascript
import connectDB from "./db/db";
```
**Question:** What happens when this code is executed with Node.js? How do you fix it?

---

## ⚙️ Part 2: Backend Architecture & Lifecycle

### Q4. Middleware Execution & The Hanging Server
A developer writes this custom middleware:
```javascript
app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    // No other lines
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});
```
**Question:** When a client sends a GET request to `/api/health`, what happens on the client's screen? Why?

---

### Q5. Separation of Concerns in Startup
**Question:** Why do we call `connectDB()` and wait for its Promise to resolve *before* calling `app.listen(8000)`? What could go wrong if we called `app.listen(8000)` on line 1 before calling `connectDB()`?

---

### Q6. Request Payload Breakdown
A client sends an HTTP request:
`POST /api/v1/videos/64a1b2c?sort=views&limit=5`  
with a JSON body: `{"comment": "Great video!"}`.
**Question:** Inside your Express controller, how do you extract:
1. `"64a1b2c"`?
2. `"views"`?
3. `"Great video!"`?

---

## 🛠️ Part 3: Debugging Scenarios

### Q7. The `ERR_HTTP_HEADERS_SENT` Crash
A junior engineer writes this controller:
```javascript
const findUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User found", user });
};
```
**Question:** If the user is NOT found, what error will Node.js throw? Why did this error occur?

---

### Q8. The `limit: "16kb"` Middleware Protection
In `src/app.js`, you configured `app.use(express.json({ limit: "16kb" }))`.
**Question:** If an attacker sends a 50MB JSON file in a POST request, what happens? Which HTTP status code does Express return?

---

### Q9. Higher-Order Wrapper (`asyncHandler`) Mechanism
**Question:** Explain in plain English how `Promise.resolve(fn(req, res, next)).catch(error => next(error))` handles errors when `fn` is an `async` function.

---

---

# 🔑 Answer Key & Deep Explanations

### Answer 1:
It prints: **`"undefined"`**.  
*Explanation:* `makeHandler` uses curly braces `{ ... }` for its function body, but has no `return` keyword before `(req, res, next) => { ... }`. Therefore, `makeHandler(...)` evaluates the expression and returns `undefined`. To fix it, you must write `return (req, res, next) => ...` or remove the outer curly braces.

### Answer 2:
Order: **`1 -> 2 -> 4 -> 3`**.  
*Explanation:*
1. `"1. Starting"` prints synchronously.
2. `testDB()` is called synchronously. `"2. Inside async function"` prints.
3. It hits `await Promise.resolve()`. `await` pauses execution of `testDB` and yields the call stack back to the main thread.
4. `"4. Finished script"` executes immediately on the main thread.
5. In the next microtask turn, execution resumes inside `testDB` and prints `"3. After await"`.

### Answer 3:
Node.js throws: **`Error [ERR_MODULE_NOT_FOUND]: Cannot find module ...`**.  
*Explanation:* In Node.js ES Modules, relative local file imports do not support automatic file extension inference. You must append `.js`: `import connectDB from "./db/db.js";`.

### Answer 4:
The client sees a **perpetual loading spinner** and eventually times out with a 504 Gateway Timeout or browser network error.  
*Explanation:* The middleware logs the message, but neither calls `next()` to hand off control to the `/api/health` route handler, nor calls `res.json()` or `res.send()` to complete the response.

### Answer 5:
If `app.listen()` runs before `connectDB()` resolves, the server will start accepting requests immediately. If users send login or registration requests while MongoDB is still connecting, their requests will either crash with database timeout errors or fail unpredictably. Connecting first guarantees the database is ready to handle queries the millisecond the port opens.

### Answer 6:
1. `"64a1b2c"` is extracted from **`req.params.id`** (assuming the route path is defined as `/:id`).
2. `"views"` is extracted from **`req.query.sort`**.
3. `"Great video!"` is extracted from **`req.body.comment`**.

### Answer 7:
Node.js throws: **`Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client`**.  
*Explanation:* If `!user` is true, line 4 sends a 404 response. But because there is no `return` statement, execution continues down to line 6, attempting to send a 200 response for the exact same request. An HTTP transaction can only have one response. Fix it by writing `return res.status(404).json(...)`.

### Answer 8:
Express aborts parsing, rejects the request immediately, and returns **`413 Payload Too Large`** (`PayloadTooLargeError`). The server is protected from memory exhaustion.

### Answer 9:
1. `fn(req, res, next)` executes the controller function.
2. Since `fn` is an `async` function, it returns a Promise.
3. `Promise.resolve(...)` wraps it to ensure consistent Promise behavior.
4. If an exception is thrown inside the controller (e.g. invalid query), the Promise rejects.
5. The `.catch()` callback intercepts that rejection and passes the error to `next(error)`.
6. Express sees that `next()` was called with an argument, skips all normal routes, and triggers its centralized error handler.
