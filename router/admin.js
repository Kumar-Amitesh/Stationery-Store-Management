import express from "express";
import multer from "multer";
import path from "path";
import pool from "../config/db.js"; // PostgreSQL pool setup
import auth from "../middleware/authMiddleware.js";

const admin = express.Router();
admin.use(express.static(path.join("public")));

// Multer storage configuration for file upload
const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage }).single('file');

// Add Product Page
admin.get("/addpro", auth, (req, res) => {
    res.render("addpro", { success: '' });
});

// Add Product
admin.post("/post", upload, async (req, res) => {
    const { name, title, price, des } = req.body;
    if (!req.file) {
        return res.render("addpro", { success: "No file uploaded. Please upload an image." });
    }
    const image = req.file.filename;

    try {
        const result = await pool.query(
            "INSERT INTO store (name, title, price, des, image) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [name, title, price, des, image]
        );
        res.render("addpro", { store: result.rows[0], success: 'Product added successfully' });
    } catch (err) {
        res.json({
            status: "failed",
            message: "Not added",
            data: err
        });
    }
});

// Show All Products
admin.get('/showpro', auth, async (req, res, next) => {
    try {
        const result = await pool.query("SELECT * FROM store");
        res.render("showpro", { store: result.rows, success: '' });
    } catch (err) {
        next(err);
    }
});

// Delete Product by ID
admin.get('/delete/:storeid', auth, async (req, res, next) => {
    const storeId = req.params.storeid;
    try {
        const deleteResult = await pool.query("DELETE FROM store WHERE id = $1", [storeId]);
        console.log("Delete result:", deleteResult.rowCount);
        const result = await pool.query("SELECT * FROM store");
        res.redirect('/showpro');
    } catch (err) {
        console.error("Error deleting record:", err);
        next(err);
    }
});

// Edit Product by ID
admin.get("/edit/:storeid", async (req, res, next) => {
    const storeId = req.params.storeid;
    try {
        const result = await pool.query("SELECT * FROM store WHERE id = $1", [storeId]);
        res.render("update", { store: result.rows[0], success: '' });
    } catch (err) {
        next(err);
    }
});

// Update Product
admin.post("/update", upload, async (req, res, next) => {
    const { name, title, price, des } = req.body;
    const image = req.file.filename;

    try {
        await pool.query(
            "UPDATE store SET title = $1, price = $2, des = $3, image = $4 WHERE name = $5",
            [title, price, des, image, name]
        );
        res.render("addpro", { success: "Update successful" });
    } catch (err) {
        next(err);
    }
});

export default admin;
