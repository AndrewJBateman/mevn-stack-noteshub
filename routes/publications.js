const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');

const Publication = require('../models/Publication');

// desc    Show add page
// route   GET /publications/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('publications/add');
});

// desc    Process the add form
// route   POST /publications
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Publication.create(req.body);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// desc    Show all publications
// route   GET /publications
router.get('/', ensureAuth, async (req, res) => {
  try {
    const publications = await Publication.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean();

    res.render('publications/index', {
      publications,
    });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// desc    Show single publication
// route   GET /publication/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let publication = await Publication.findById(req.params.id)
      .populate('user')
      .lean();

    if (!publication) {
      return res.render('error/404');
    }

    res.render('publications/show', {
      publication,
    });
  } catch (err) {
    console.error(err);
    res.render('error/404');
  }
});

// desc    Show edit page
// route   GET /publications/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const publication = await Publication.findOne({
      _id: req.params.id,
    }).lean();

    if (!publication) {
      return res.render('error/404');
    }

    if (publication.user != req.user.id) {
      res.redirect('/publications');
    } else {
      res.render('publications/edit', {
        publication,
      });
    }
  } catch (err) {
    console.error(err);
    return res.render('error/500');
  }
});

// desc    Update publication
// route   PUT /publications/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let publication = await Publication.findById(req.params.id).lean();

    if (!publication) {
      return res.render('error/404');
    }

    if (publication.user != req.user.id) {
      res.redirect('/publications');
    } else {
      publication = await Publication.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      res.redirect('/dashboard');
    }
  } catch (err) {
    console.error(err);
    return res.render('error/500');
  }
});

// desc    Delete publication
// route   DELETE /publications/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let publication = await Publication.findById(req.params.id).lean();

    if (!publication) {
      return res.render('error/404');
    }

    if (publication.user != req.user.id) {
      res.redirect('/publications');
    } else {
      await Publication.remove({ _id: req.params.id });
      res.redirect('/dashboard');
    }
  } catch (err) {
    console.error(err);
    return res.render('error/500');
  }
});

// desc    User publications
// route   GET /publications/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const publications = await Publication.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean();

    res.render('publications/index', {
      publications,
    });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

module.exports = router;
