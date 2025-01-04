//const asyncHandler = () => {}


export {asyncHandler}

// ye hamara higher order function hota h means jo dusre functions ko accept krta h and then unko aage pass krta h


const asyncHandler = (fn) => async (req, res, next) => {
    try{
        await fn(req, res,next)
    }catch (error){
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}


/*The provided code implements a higher-order function called asyncHandler, which is commonly used in Node.js applications to handle asynchronous errors gracefully. Here's a detailed breakdown:

1. What is a Higher-Order Function?
A higher-order function is a function that either:

Accepts other functions as arguments, or
Returns a function.
In this case, asyncHandler accepts an fn function (typically an asynchronous function) as its argument.

2. The Purpose of asyncHandler
The asyncHandler function is used to simplify error handling in asynchronous operations, especially in Express.js or similar frameworks. Without it, you would need to write repetitive try-catch blocks around every asynchronous route handler to catch errors.

3. How It Works
Declaration:
javascript
Copy code
const asyncHandler = (fn) => async (req, res, next) => { ... }
fn: An asynchronous function (usually a route handler).
Returns another function that takes the usual req, res, and next parameters of an Express route handler.
Execution:
javascript
Copy code
try {
    await fn(req, res, next);
} catch (error) {
    res.status(error.code || 500).json({
        success: false,
        message: error.message,
    });
}
try block: It executes the asynchronous function fn with the provided req, res, and next.
catch block: If fn throws an error or rejects, the catch block handles it by:
Setting the response status to the error code (error.code) if available or defaulting to 500.
Returning a JSON response with:
success: false
The error message (error.message).
This ensures that errors are handled centrally, avoiding the need to repeat error-handling logic in every route.

4. Why This is Needed
In a Node.js application using asynchronous route handlers (e.g., with async/await), unhandled errors can crash the server. Consider this example without asyncHandler:

javascript
Copy code
app.get('/example', async (req, res) => {
    const data = await someAsyncFunction(); // If this throws, it won't be caught.
    res.json({ success: true, data });
});
If someAsyncFunction() throws an error, the error won't be caught, and the request will hang or crash the server. With asyncHandler, this is handled gracefully:

javascript
Copy code
app.get('/example', asyncHandler(async (req, res) => {
    const data = await someAsyncFunction();
    res.json({ success: true, data });
}));
5. Benefits
Clean Code: Removes repetitive try-catch blocks in route handlers.
Centralized Error Handling: Provides a consistent way to handle errors across all routes.
Error Propagation: Allows passing the error to the next() middleware if needed for further processing.
6. Usage Example
Here’s how asyncHandler might be used in an Express.js app:

javascript
Copy code
const express = require('express');
const app = express();

const someAsyncFunction = async () => {
    throw new Error('Something went wrong!');
};

// Route without asyncHandler (would hang or crash on error):
app.get('/no-handler', async (req, res) => {
    const data = await someAsyncFunction(); // Unhandled error
    res.json({ success: true, data });
});

// Route with asyncHandler (error handled gracefully):
app.get(
    '/with-handler',
    asyncHandler(async (req, res) => {
        const data = await someAsyncFunction(); // Handled error
        res.json({ success: true, data });
    })
);

// Error handling middleware for unhandled errors
app.use((err, req, res, next) => {
    res.status(500).json({ success: false, message: err.message });
});

app.listen(3000, () => console.log('Server running on port 3000'));
7. Conclusion
The asyncHandler function is a utility for cleaner and more reliable error handling in asynchronous operations. It ensures errors don't crash your application and simplifies route handler code by avoiding repetitive try-catch blocks. */