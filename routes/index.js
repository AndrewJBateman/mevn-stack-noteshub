const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');

const Publication = require('../models/Publication');

// descr: login/landing page
// route: GET /
router.get('/', ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login',
  });
});

// descr: dashboard
// route: GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const publications = await Publication.find({ user: req.user.id }).lean();
    res.render('dashboard', {
      name: req.user.firstName,
      publications,
    });
  } catch (err) {
    console.log(err);
    res.render('error/500')
  }
});

module.exports = router;
