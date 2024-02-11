const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcrypt');

// Login route with input validation
router.get('', (req, res) => {
  res.render('../views/login.ejs', { error: null }); // Define 'error' as null initially
});

router.post('/', [
  body('username').notEmpty().isString(),
  body('password').notEmpty().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation Errors:', errors.array());
      return res.render('../views/login.ejs', { error: 'Invalid username or password' });
    }

    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (user) {
      // Check if the user has been soft-deleted
      if (user.deletionDate) {
        console.log('Login Failed - User has been deleted');
        return res.render('../views/login.ejs', { error: 'Invalid username or password' });
      }

      // Check password
      if (bcrypt.compareSync(password, user.password)) {
        console.log('Login Successful:', user);

        req.session.userId = user.userId;
        req.session.isAdmin = user.isAdmin;

        if (user.isAdmin) {
          console.log('Redirecting to Admin Page');
          return res.redirect('/admin');
        } else {
          console.log('Redirecting to Main Page');
          return res.redirect('/');
        }
      }
    }

    // If the user is not found or password does not match
    console.log('Login Failed');
    return res.render('../views/login.ejs', { error: 'Invalid username or password' });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).send('Internal Server Error');
  }
});

module.exports = router;