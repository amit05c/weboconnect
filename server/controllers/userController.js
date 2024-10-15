const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const userRegister = async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
      // Check if the user already exists
      const checkUserQuery = "SELECT * FROM users WHERE email = ?";
      db.query(checkUserQuery, [email], async (err, result) => {
        if (err) {
          return res.status(500).json({ msg: "Server error while checking user" });
        }
        if (result.length > 0) {
          return res.status(400).json({ msg: "User already registered" });
        }
  
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
  
        // Insert new user
        const insertUserQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        db.query(insertUserQuery, [username, email, hashedPassword], (err, result) => {
          if (err) {
            return res.status(500).json({ msg: "Server error while registering user" });
          }
          res.status(201).json({ msg: "User registered successfully" });
        });
      });
    } catch (err) {
      res.status(500).json({ msg: "Server Error", error: err.message });
    }
  }

const userLogin =  async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const query = "SELECT * FROM users WHERE email = ?";
      db.query(query, [email], async (err, result) => {
        if (err) {
          return res.status(500).json({ msg: "Server error while logging in" });
        }
        if (result.length === 0) {
          return res.status(400).json({ msg: "Invalid credentials" });
        }
  
        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ msg: "Invalid credentials" });
        }
  
        // Create and return the JWT token
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
          if (err) {
            return res.status(500).json({ msg: "Server error while signing token" });
          }
          res.json({ token,user });
        });
      });
    } catch (err) {
      res.status(500).json({ msg: "Server Error", error: err.message });
    }
  }

  module.exports = {
    userRegister,
    userLogin
  }

