import pool from "../config/db.js";
import bcrypt from 'bcryptjs';

// Payment processing
export const payment = async (req, res, next) => {
    const { user_id } = req.user;
    const { name, email, address, phone, password } = req.body; // Password added to the request body
    console.log(req.body);

    try {
        // Fetch the stored password for the user from the database
        const user = await pool.query(
            `SELECT pass FROM login WHERE id = $1`,
            [user_id]
        );

        if (user.rows.length === 0) {
            return res.status(404).send("User not found.");
        }

        // Compare the entered password with the stored hashed password
        const paymentSuccess = await bcrypt.compare(password, user.rows[0].pass);

        // Proceed only if paymentSuccess is true
        if (paymentSuccess) {
            // Fetch items from the user's cart
            const cartItems = await pool.query(
                `SELECT product_name, quantity FROM cart WHERE user_id = $1`,
                [user_id]
            );

            // Insert order into `orders` table
            await pool.query(
                `INSERT INTO orders (user_id, name, email, address, phone, items) VALUES ($1, $2, $3, $4, $5, $6)`,
                [user_id, name, email, address, phone, JSON.stringify(cartItems.rows)]
            );

            // Clear the cart after successful order placement
            await pool.query(
                `DELETE FROM cart WHERE user_id = $1`, 
                [user_id]
            );

            res.redirect('success');
        } else {
            // Redirect to failure page if password is incorrect
            res.redirect('failure');
        }
    } catch (err) {
        console.error("Error during payment processing:", err);
        next(err);
    }
};

// Payment success route
export const success = async (req, res, next) => {
    // You can retrieve user purchase history and updated inventory here
    // const userId = req.user.id;
    // const purchases = await db.query(`SELECT * FROM Purchases WHERE user_id = ?`, [userId]);
    res.render('success', { user: res.locals.user });
};

// Payment failure route
export const failure = async (req, res, next) => {
    res.render('failure', { title: 'Payment Failure', user: res.locals.user });
};

// Order history route
export const orderhistory = async (req, res) => {
    const { user_id } = req.user;
    console.log(req.body);

    try {
        const orders = await pool.query(`SELECT * FROM orders WHERE user_id = $1`, [user_id]);

        // Parse the items field from JSON strings to JavaScript objects
        const parsedOrders = orders.rows.map(order => ({
            ...order,
            items: JSON.parse(order.items)
        }));

        console.log("Parsed Orders:", parsedOrders);

        res.render('orderhistory', { orders: parsedOrders, user: res.locals.user, title: "Orders" });
    } catch (error) {
        console.error("Error fetching order history:", error);
        res.status(500).send("Server Error");
    }
};
