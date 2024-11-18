import express from "express";
import authenticateUser from "../middleware/authMiddleware.js";
import pool from "../config/db.js";

const user = express.Router();

// Route to fetch 'pen' items
export const pen = async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT * FROM store WHERE LOWER(title) = ANY($1)",
            [["pen", "Pen"]]
        );
        if (result.rows.length === 0) {
            console.log("No items found for 'pen'");
            return res.render("pen", { title: "Pen", store: [], user: res.locals.user || '', success: 'No products found.' });
        }
        console.log("Fetched items:", result.rows);
        res.render("pen", { title: "Pen", store: result.rows, user: res.locals.user || '' });
    } catch (err) {
        console.error("Database Query Error:", err);
        next(err);
    }
};
user.use('/pen', authenticateUser);

// Route to fetch 'paper' items
export const paper = async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT * FROM store WHERE LOWER(title) = ANY($1)",
            [["pin", "Pin"]]
        );
        res.render("paper", { title: "PaperPins", store: result.rows, user: res.locals.user || '' });
    } catch (err) {
        next(err);
    }
};
user.use('/paper', authenticateUser);

// Route to fetch 'greeting' items
export const greeting = async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT * FROM store WHERE LOWER(title) = ANY($1)",
            [["greeting", "Greeting"]]
        );
        res.render("greeting", { title: "Greetings", store: result.rows, user: res.locals.user || '' });
    } catch (err) {
        next(err);
    }
};
user.use('/greeting', authenticateUser);

// Route to fetch 'books' items
export const books = async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT * FROM store WHERE LOWER(title) = ANY($1)",
            [["book", "Book"]]
        );
        console.log("Fetched items:", result.rows);
        res.render("Books", { title: "Books", store: result.rows, user: res.locals.user || '' });
    } catch (err) {
        next(err);
    }
};
user.use('/books', authenticateUser);

// Route to fetch product details
export const details = async (req, res, next) => {
    const { storeid } = req.params;
    try {
        const result = await pool.query("SELECT * FROM store WHERE id = $1", [storeid]);
        res.render("details", { title: "Product Details", store: result.rows[0], user: res.locals.user || '' });
    } catch (err) {
        next(err);
    }
};
user.use('/details/:storeid', authenticateUser);

export default user;
