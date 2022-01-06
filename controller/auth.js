const {check, body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

const User = require("../models/user");

// signup get controller
exports.get_signup = (req, res, next) => {
  res.render("user/signup");
};

//Signup post controller
exports.post_signup = [
  check("email", "Invalid email").trim().isEmail().escape(),
  check("password", "Invalid Password").isLength({ min: 4 }).escape(),
  check("confirmPassword", "Invalid Password").isLength({ min: 4 }).escape(),

  (req, res, next) => {
    //extract validation errors from req
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("user/signup", {
        title: "signup",
        data: req.body,
        errors: errors.array(),
      });
    } else {
      const email = req.body.email;
      const password = req.body.password;
      const confirmPassword = req.body.confirmPassword;

      User.findOne({ email: email })
        .then((userDoc) => {
          if (userDoc) {
            req.flash(
              "error",
              "E-Mail already in use, Please use a different email or login"
            );
            return res.redirect("/signup");
          }
          if (password !== confirmPassword) {
            req.flash("error", "Passwords do not match");
            return res.redirect("/signup");
          }

          return bcrypt
            .hash(password, 12)
            .then((hashedPassword) => {
              const user = new User({
                email: email,
                password: hashedPassword,
                createdAt: Date.now(),
              });
              return user.save();
            })
            .then((result) => {
              res.redirect("/login");
            });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  },
];

// login get controller
exports.get_login = (req, res, next) => {
  res.render("user/login");
};

//login post controller
exports.post_login = [
  body("email", "Invalid email").trim().isEmail().escape(),
  body("password", "Invalid Password").isLength({ min: 4 }).escape(),

  (req, res, next) => {
    //extract validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("user/login", {
        title: "Login",
        data: req.body,
        errors: errors.array(),
      });
    } else {
      const email = req.body.email;
      const password = req.body.password;

      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            req.flash("error", "Invalid email or password.");
            res.render("user/login");
          }
          bcrypt.compare(password, user.password).then((doMatch) => {
            if (doMatch) {
              req.session.isLoggedIn = true;
              req.session.user = user;
              return req.session.save((err) => {
                console.log(err);
                res.redirect("/");
              });
            }
            req.flash("error", "Invalid email or password.");
            res.redirect("/login");
          });
        })
        .catch((err) => console.log(err));
    }
  },
];

// logout post controller
exports.post_logout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
