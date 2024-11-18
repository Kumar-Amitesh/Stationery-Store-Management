import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Ensure bcryptjs is installed
import pool from '../config/db.js';

const JWT_SECRET = 'your_jwt_secret_key'; // Store this securely in an environment variable

export const login = (req, res) => {
  res.render("login", { title: "Login/Signup", error: '', success: '', user: '' });
};

export const logout = (req, res) => {
  // Clear user session or authentication token
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send({ message: 'Failed to log out' });
    }
    res.redirect('/');
  });
};

export const signin = async (req, res) => {
  const { Uname, Pass } = req.body;
  
  // Check for admin login
  if (Uname === "NodeJs" && Pass === "MongoDb") {
    // Generate JWT for admin
    const token = jwt.sign({ username: Uname, role: "admin" }, JWT_SECRET, { expiresIn: '1h' });
    req.session.token = token;  // Store the token in session
    return res.render("addpro", { title: "AdminPage", success: "", user: '' });
  }

  try {
      // Fetch user from the database
      const result = await pool.query("SELECT * FROM login WHERE uname = $1", [Uname]);

      if (result.rows.length > 0) {
          const user = result.rows[0];

          // Compare the password
          const isPasswordValid = await bcrypt.compare(Pass, user.pass);
          if (isPasswordValid) {
              console.log("Password matched");

              // Generate JWT for regular user
              const token = jwt.sign(
                  { username: user.uname, passwordHash: user.pass, user_id: user.id },
                  JWT_SECRET,
                  { expiresIn: '1h' }
              );

              // Set session values
              req.session.token = token;
              req.session.username = user.uname;

              res.redirect("/"); // Redirect to home or desired page
          } else {
              console.log("Invalid password");
              res.render("login", {
                  title: "Login",
                  error: { login: { msg: "Invalid password" } },
                  success: '',
                  user: ''
              });
          }
      } else {
          console.log("User not found");
          res.render("login", {
              title: "Login",
              error: { login: { msg: "User not found" } },
              success: '',
              user: ''
          });
      }
  } catch (err) {
      console.error("Error during login:", err);
      res.render("login", {
          title: "Login",
          error: { login: { msg: "Something went wrong. Please try again." } },
          success: '',
          user: ''
      });
  }
};

