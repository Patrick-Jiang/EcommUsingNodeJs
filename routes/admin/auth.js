const usersRepo = require('../../repositories/users');
const express = require('express');
const router = express.Router();
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const { check, validationResult } = require('express-validator');
const {
  requireEmail,
  requirePassword,
  requirePasswordConfirmation,
  requireEmailExists,
  requireValidPasswordForUser,
} = require('./validators');

router.get('/signup', (req, res) => {
  res.send(signupTemplate({ req }));
});

router.post(
  '/signup',
  [requireEmail, requirePassword, requirePasswordConfirmation],
  async (req, res) => {
    const { email, password, passwordConfirmation } = req.body;
    const errors = validationResult(req);
    console.log(errors);
    const user = await usersRepo.create({ email, password });

    req.session.userId = user.id;

    res.send(`
  Account created !!
  `);
  }
);

router.get('/signout', (req, res) => {
  req.session = null;
  res.send(`
  You are logged out!
  `);
});

router.get('/signin', (req, res) => {
  res.send(signinTemplate({}));
});
router.post(
  '/signin',
  [requireEmailExists, requireValidPasswordForUser],
  async (req, res) => {
    const errors = validationResult(req);
    const { email, password } = req.body;

    const user = await usersRepo.getOneBy({ email: email });
    if (!user) {
      return res.send(`Email not found !`);
    }

    const validPassword = await usersRepo.comparePasswords(
      user.password,
      password
    );
    if (!validPassword) {
      return res.send(`
    Wrong password !!
    `);
    }
    // Store user cookie
    req.session.userId = user.id;

    res.send(`
  You are signed in !!
  `);
  }
);
module.exports = router;
