import express from "express";
import { pen, greeting, paper, books, details } from "../controller/product.js"; // Import all necessary functions from product.js
import { login, logout, signin } from "../controller/auth.js"; // Named imports for auth.js
import { payment, success, failure, orderhistory } from "../controller/orders.js"; // Named imports for orders.js
import { addToCart, displayCart, checkout, remove } from "../controller/cart.js"; // Named imports for cart.js
import pool from "../config/db.js"; // PostgreSQL pool setup
import { check, validationResult } from "express-validator";
import authMiddleware from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";
const app = express.Router();

// Define the routes
app.use("/pen", pen);
app.use("/greeting", greeting);
app.use("/paper", paper);
app.use("/books", books);
app.use("/cart/add",authMiddleware, addToCart);
app.use("/cart", authMiddleware, displayCart);
app.use("/checkout", authMiddleware, checkout);
app.use("/process", authMiddleware, payment);
app.use("/success", authMiddleware, success);
app.use("/failure", authMiddleware, failure);
app.use("/order-history", authMiddleware, orderhistory);
app.use("/remove", authMiddleware, remove);

// Render the home page
app.get("/", (req, res) => {
    res.render("home", { title: "Welcome to the Stationary Store", user: res.locals.user });
});

// Sign-in route
app.post("/signin", signin);

// Login route
app.use("/login", login);

app.use("/logout", logout);

// Sign-up route with validation
app.post("/signup", [
    check("uname", "Only Alphabets Allowed").isAlpha(),
    check("pass", "Minimum 5 characters required").isLength({ min: 5 }).trim(),
    check("cpass").custom((value, { req }) => {
        if (value !== req.body.pass) {
            throw new Error("Password confirmation does not match password");
        }
        return true;
    })
], async (req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        const { uname, pass } = req.body;

        try {
            // Hash the password
            const hashedPassword = await bcrypt.hash(pass, 10);

            // Insert into PostgreSQL
            const result = await pool.query(
                "INSERT INTO login (uname, pass) VALUES ($1, $2) RETURNING *",
                [uname, hashedPassword]
            );

            if (result.rows.length > 0) {
                console.log("Successfully inserted");
                res.render("login", {
                    title: "Login/Signup",
                    error: '',
                    success: "Signup Successfully",
                    user: ''
                });
            }
        } catch (err) {
            console.error("Error inserting user:", err);
            res.render("login", {
                title: "Login/Signup",
                error: { signup: { msg: "Failed to sign up, please try again." } },
                success: '',
                user: ''
            });
        }
    } else {
        // Render the login page with validation errors
        res.render("login", {
            title: "Incorrect Details",
            error: errors.mapped(),
            success: "Signup Unsuccessful",
            user: ''
        });
    }
});

// Product details route
app.get("/details/:storeid", details);

export default app;
