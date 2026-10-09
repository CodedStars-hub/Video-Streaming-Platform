# 01 — JavaScript Prerequisites for Backend Development

> **Focus:** The essential modern JavaScript features (ES6+) powering your backend code, including Closures, Higher-Order Functions, Promises, `async/await`, and ES Modules.

---

## 1. Arrow Functions: Standard, Implicit Return & Chained Arrows

### Definition
An arrow function (`=>`) is a concise syntax for writing JavaScript function expressions introduced in ES6.

### Syntax Variations
```javascript
// 1. Classic explicit return with curly braces:
const add = (a, b) => {
    return a + b;
};

// 2. Implicit return (no curly braces needed for a single expression):
const addShort = (a, b) => a + b;

// 3. Higher-Order Arrow (a function returning another function):
const multiplier = (factor) => (number) => factor * number;
```

### Where It Appears in Your Code
Look at [`src/utils/asynchandler.js`](../src/utils/asynchandler.js#L17-L21):
```javascript
// Line 17-19:
// const asynchandler = () => {}
// const asynchandler = (func) => () => {}
// const asynchandler = (func) => async() => {}
```
And look at lines 3-7:
```javascript
const asynhandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error))
    }
}
```

### ⚠️ Critical Beginner Mistake in Your Code!
When you use curly braces `{}` in an arrow function, **you MUST explicitly write the `return` keyword**, or else the function returns `undefined`.
- In `asynchandler.js`, `asynhandler` has curly braces `{ ... }`, but the inner arrow function `(req, res, next) => { ... }` does not have a `return` before it!
- **Fix:**
```javascript
// Option A: Explicit return
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error));
    };
};

// Option B: Implicit return (no outer curly braces)
const asyncHandler = (requestHandler) => (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error));
};
```

---

## 2. Higher-Order Functions (HOFs) & Closures

### Definition
- **Higher-Order Function:** A function that either accepts another function as an argument, returns a function, or both.
- **Closure:** The mechanism in JavaScript where an inner function retains access to variables from its outer (parent) function's scope, even after the parent function has finished executing.

### Practical Standalone Example
```javascript
function createGreeting(greetingWord) {
    // The outer function returns an inner function
    return function(name) {
        // The inner function remembers greetingWord thanks to Closure!
        console.log(`${greetingWord}, ${name}!`);
    };
}

const sayHello = createGreeting("Hello");
sayHello("Harshita"); // Output: "Hello, Harshita!"
```

### Where It Appears in Your Code
In [`src/utils/asynchandler.js`](../src/utils/asynchandler.js):
- `asyncHandler` takes `requestHandler` (your future route controller function) as an input parameter.
- It returns a new Express middleware function: `(req, res, next) => { ... }`.
- When Express receives an HTTP request, it calls this inner function. Because of **closures**, this inner function still has access to `requestHandler` and executes it!

---

## 3. Synchronous vs. Asynchronous Execution

### The Core Difference
JavaScript is **single-threaded** (one call stack, one operation at a time).
- **Synchronous operations** run immediately and freeze the thread until finished (e.g., mathematical calculations: `const sum = 2 + 3`).
- **Asynchronous operations** take time to finish (e.g., asking MongoDB on a remote cloud server for user data, or reading a 50MB video file from disk). Node delegates these operations to the operating system / libuv background threads so the server doesn't freeze.

### Comparison
```javascript
// Synchronous (Instantaneous)
const greeting = "Hello";
console.log(greeting);

// Asynchronous (Takes time, returns a Promise)
const data = await mongoose.connect(URL);
```

---

## 4. Promises: The Foundation of Async Backend

### Definition
A **Promise** is a special JavaScript object representing the eventual completion (fulfillment) or failure (rejection) of an asynchronous operation.

A Promise has three states:
1. `pending`: The initial state; operation is still in progress.
2. `fulfilled`: Operation succeeded; resolved with a value.
3. `rejected`: Operation failed; rejected with an error.

### How to Consume a Promise: `.then()` and `.catch()`
- `.then(callback)`: Executes when the Promise resolves successfully.
- `.catch(callback)`: Executes if the Promise fails (rejects).

### Where It Appears in Your Code
Look at [`src/index.js`](../src/index.js#L9-L18):
```javascript
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.error("MONGODB connection failed !!", err);
})
```
- Because `connectDB()` is an `async` function, it automatically returns a Promise!
- `.then()` guarantees that `app.listen()` will only run **after** the database connection has successfully established.
- `.catch()` catches any network or authentication error thrown by MongoDB.

---

## 5. `async` and `await`: Making Async Look Synchronous

### Definition
- Adding `async` before a function declaration ensures that the function **always returns a Promise**.
- Inside an `async` function, the `await` keyword pauses the execution of *that specific function* until the Promise resolves, then yields the result.

> ⚠️ **Crucial Truth:** `await` does **NOT** block the entire Node.js server! It only pauses the execution inside that single function while the Node event loop continues handling requests for other users.

### Where It Appears in Your Code
Look at [`src/db/db.js`](../src/db/db.js#L4-L7):
```javascript
const connectDB = async function(){
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`/n MONGODB connected !! DB HOST: ${connectionInstance.connection.host}`)
    }
    catch(error){
        console.error("MONGODB connection Failed", error);
        process.exit(1)
        throw error;
    }
}
```
- Line 4: `async function()` marks this function as asynchronous.
- Line 6: `await mongoose.connect(...)` tells JavaScript: "Wait here until MongoDB completes the network handshake and returns the connection object, then assign it to `connectionInstance`."
- Lines 9-14: `try...catch` captures any rejection.

---

## 6. ES Modules (`import`/`export`) vs. CommonJS (`require`)

### The Distinction
Historically, Node.js used **CommonJS**:
```javascript
// CommonJS syntax
const express = require("express");
module.exports = app;
```
Modern JavaScript uses official **ES Modules (ESM)**:
```javascript
// ES Module syntax
import express from "express";
export { app };
export default connectDB;
```

### Project Configuration
In [`package.json`](../package.json#L11), you have:
```json
"type": "module"
```
This flag instructs the Node.js runtime to treat all `.js` files as ES Modules.

### ⚠️ The Rule of ESM in Node.js
Unlike frontend bundlers (like Vite or Webpack) or CommonJS, **Node.js ESM requires the full file extension for local relative imports**:
```javascript
// ❌ FAILS in Node.js ESM: Cannot find module
import connectDB from "./db/db";

// ✅ WORKS: Explicit .js extension
import connectDB from "./db/db.js";
```
*(Package imports from `node_modules` like `import express from "express"` do NOT require extensions).*

---

## 7. Named Exports vs. Default Exports

| Feature | Default Export | Named Export |
|:---|:---|:---|
| **Export Syntax** | `export default connectDB;` | `export { app };` or `export const DB_NAME = "videotube";` |
| **Import Syntax** | `import connectDB from "./db/db.js";` | `import { DB_NAME } from "./constants.js";` |
| **Renaming on Import**| Can name anything: `import myDB from "./db/db.js"` | Must use `as`: `import { DB_NAME as name }` |
| **Number per file** | At most **one** default export per file | Can have **multiple** named exports per file |

In your codebase:
- [`src/db/db.js`](../src/db/db.js#L17) uses default export: `export default connectDB`.
- [`src/constants.js`](../src/constants.js#L1) uses named export: `export const DB_NAME = "videotube"`.
- [`src/app.js`](../src/app.js#L27) uses named export: `export { app }`.

---

## 8. Template Literals & String Interpolation

### Syntax
Backticks (`` ` ``) allow embedding variables and expressions directly inside strings using `${expression}`.

### Where It Appears in Your Code
In [`src/db/db.js`](../src/db/db.js#L6):
```javascript
await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
```
- In CommonJS or old JS, you had to concatenate: `process.env.MONGODB_URI + "/" + DB_NAME`.
- With template literals, the variables are cleanly resolved inside the string.

---

## 9. Error Handling: `throw` and Error Objects

### Syntax
```javascript
try {
    // code that might fail
    throw new Error("Something went wrong!");
} catch (error) {
    console.error(error.message); // prints error description
}
```

### Where It Appears in Your Code
In [`src/db/db.js`](../src/db/db.js#L9-L13):
```javascript
catch(error){
    console.error("MONGODB connection Failed", error);
    process.exit(1)
    throw error;
}
```
- `catch(error)`: The caught error object contains `.message` and `.stack`.
- `throw error`: Re-throws the error up to the calling function (in this case, reaching `.catch()` in `src/index.js`).

---

## 10. Summary Cheat Sheet for JavaScript in Your Backend

| Syntax | What It Does | Example in Your Repo |
|:---|:---|:---|
| `import ... from "..."` | Imports an ES module | `import express from "express"` ([`src/app.js:1`](../src/app.js)) |
| `export default ...` | Exports single default value | `export default connectDB` ([`src/db/db.js:17`](../src/db/db.js)) |
| `export { ... }` | Exports named variables | `export { app }` ([`src/app.js:27`](../src/app.js)) |
| `async () => {}` | Declares asynchronous function | `const connectDB = async function()` ([`src/db/db.js:4`](../src/db/db.js)) |
| `await promise` | Waits for async result | `await mongoose.connect(...)` ([`src/db/db.js:6`](../src/db/db.js)) |
| `.then().catch()` | Handles Promise success/error | `connectDB().then().catch()` ([`src/index.js:9-18`](../src/index.js)) |
| `(fn) => (req,res,next) => {}`| Higher-Order function closure | `asynchandler` wrapper ([`src/utils/asynchandler.js`](../src/utils/asynchandler.js)) |
