const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/user');

const isAdmin = (req, res, next) => {
  if (req.session.userId && req.session.isAdmin) {
    next();
  } else {
    res.redirect('/login');
  }
};

router.get('/', (req, res) => {
  // Find all users (not deleted)
  User.find({ deletionDate: null })
    .then((users) => {
      res.render('admin', { users });
    })
    .catch((error) => {
      console.error('Error fetching users:', error);
      res.status(500).send('Internal Server Error');
    });
});

router.post('/update/:userId', (req, res) => {
  const { newUsername, newUserId, newIsAdmin } = req.body;

  const updateFields = {
    userId: newUserId,
    isAdmin: newIsAdmin === 'on',
    updateDate: new Date(),
  };

  if (newUsername) {
    updateFields.username = newUsername;
  }

  User.findByIdAndUpdate(req.params.userId, updateFields, { new: true })
    .then((updatedUser) => {
      console.log('User successfully updated:', updatedUser);
      res.redirect('/admin');
    })
    .catch((error) => {
      console.error('Error updating user:', error);
      res.status(500).send('Internal Server Error');
    });
});

router.post('/delete/:userId', (req, res) => {
  User.findByIdAndUpdate(req.params.userId, { deletionDate: new Date() })
    .then((deletedUser) => {
      console.log('User successfully deleted:', deletedUser);
      res.redirect('/admin');
    })
    .catch((error) => {
      console.error('Error deleting user:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Add other routes for updating, deleting, and displaying user data as needed

module.exports = router;
