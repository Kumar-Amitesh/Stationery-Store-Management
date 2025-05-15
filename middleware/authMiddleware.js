import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;

export default (req, res, next) => {
  const token = req.session.token;

  if (!token) {
    return res.redirect('/login');  // No token, redirect to login
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification failed:", err);
      return res.redirect('/login');  // Invalid token, redirect to login
    }

    const { passwordHash } = decoded;

    // Skip bcrypt.compare if `req.body.pass` is not present (e.g., accessing cart)
    if (!req.body.pass) {
      req.user = decoded;  // Set the decoded JWT data as req.user
      return next();  // Proceed to the next middleware or route handler
    }

    // Compare passwords if `req.body.pass` exists
    bcrypt.compare(req.body.pass, passwordHash, (err, isMatch) => {
      if (err || !isMatch) {
        console.error("Password comparison failed:", err || "Password mismatch");
        return res.redirect('/login');  // Password mismatch, redirect to login
      }
      req.user = decoded;  // Set the decoded JWT data as req.user
      next();  // Proceed to the next middleware or route handler
    });
  });
};


