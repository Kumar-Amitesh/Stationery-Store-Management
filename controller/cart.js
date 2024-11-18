import pool from "../config/db.js";

export const addToCart = async (req, res, next) => {
    const { productName, quantity } = req.body;
    console.log(req.user);
    try {
        if (req.user) {
            // For logged-in users, add item to the database
            await pool.query(
                `INSERT INTO Cart (user_id, product_name, quantity)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (user_id, product_name) DO UPDATE 
                 SET quantity = Cart.quantity + $3`,
                [req.user.user_id, productName, quantity]
            );
            res.json({ message: 'Item added to database cart' });
        } else {
            // For guest users, store in session
            if (!req.session.cart) req.session.cart = [];
            const existingItem = req.session.cart.find(item => item.productName === productName);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                req.session.cart.push({ productName, quantity });
            }
            res.json({ message: 'Item added to session cart' });
        }
    } catch (err) {
        console.error("Error adding item to cart:", err);
        next(err);
    }
};

export const displayCart = async (req, res, next) => {
    try {
        let cartItems = [];

        if (req.user) {
            const result = await pool.query(
                `SELECT Cart.product_name, Cart.quantity, store.title, store.price, store.image 
                 FROM Cart JOIN store ON Cart.product_name = store.name WHERE Cart.user_id = $1`,
                [req.user.user_id]
            );
            cartItems = result.rows;
        } else if (req.session.cart) {
            const productNames = req.session.cart.map(item => item.productName);
            const result = await pool.query(
                `SELECT title AS product_name, price FROM store WHERE title = ANY($1)`,
                [productNames]
            );
            cartItems = req.session.cart.map(sessionItem => {
                const product = result.rows.find(row => row.product_name === sessionItem.productName);
                return product ? { ...product, quantity: sessionItem.quantity } : null;
            }).filter(item => item !== null);
        }

        res.render('cart', { cartItems, user: res.locals.user, title: "Items in your Cart" });
    } catch (err) {
        console.error("Error displaying cart:", err);
        next(err);
    }
};

export const checkout = async (req, res, next) => {
    try {
        let cartItems = [];
        
        if (req.user) {
            const result = await pool.query(
                `SELECT Cart.product_name, Cart.quantity, store.name, store.price 
                 FROM Cart JOIN store ON Cart.product_name = store.name WHERE Cart.user_id = $1`,
                [req.user.user_id]
            );
            cartItems = result.rows;
        } else if (req.session.cart) {
            const productNames = req.session.cart.map(item => item.productName);
            const result = await pool.query(
                `SELECT title AS product_name, price FROM store WHERE title = ANY($1)`,
                [productNames]
            );
            cartItems = req.session.cart.map(sessionItem => {
                const product = result.rows.find(row => row.product_name === sessionItem.productName);
                return product ? { ...product, quantity: sessionItem.quantity } : null;
            }).filter(item => item !== null);
        }

        if (cartItems.length > 0) {
            res.render('checkout', { cartItems, user: res.locals.user, title: "Payment Gateway" });
        } else {
            res.redirect('/cart'); // Redirect to cart if empty
        }
    } catch (err) {
        console.error("Error during checkout:", err);
        next(err);
    }
};

export const remove = async (req, res, next) => {
    const { user_id } = req.user; // Extract user_id from the authenticated user
    const { product_name } = req.body; // Get product_name from the request body

    try {
        // Check the quantity of the product in the user's cart
        const { rows } = await pool.query(
            `SELECT quantity FROM cart WHERE user_id = $1 AND product_name = $2`,
            [user_id, product_name]
        );

        if (rows.length > 0 && rows[0].quantity > 1) {
            // If quantity is greater than 1, decrease it by 1
            await pool.query(
                `UPDATE cart SET quantity = quantity - 1 WHERE user_id = $1 AND product_name = $2`,
                [user_id, product_name]
            );
        } else if (rows.length > 0) {
            // If quantity is 1 or less, delete the product from the cart
            await pool.query(
                `DELETE FROM cart WHERE user_id = $1 AND product_name = $2`,
                [user_id, product_name]
            );
        }

        // Redirect the user to the cart page after the update
        res.redirect("/cart");
    } catch (err) {
        next(err); // Forward any errors to the error handler
    }
};

