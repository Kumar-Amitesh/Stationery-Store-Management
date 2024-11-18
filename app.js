import express from "express";
import path from "path";
import bodyParser from "body-parser";
import session from "express-session";
import router from "./router/stationary.js";
import admin from "./router/admin.js";
import pool from "./config/db.js";

// Use import.meta.url to get the directory name
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();

// Session configuration
app.use(session({
    secret: 'your_session_secret_key', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middleware to initialize session cart for guest users
app.use((req, res, next) => {
  if (!req.session.cart) req.session.cart = [];
  next();
});

// Middleware to pass user data to locals for views
app.use((req, res, next) => {
  res.locals.user = req.session.username || null;
  next();
});

// Middleware to parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Set the view engine to EJS
app.set("view engine", "ejs");

// Make the pool available in your routes for database queries
app.use((req, res, next) => {
  req.pool = pool;
  next();
});
// Use defined routes
app.use(router);
app.use(admin);
// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
