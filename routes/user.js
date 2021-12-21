const express = require('express');
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const auth = require('../middleware/auth');
const User = require('../models/user');
const res = require('express/lib/response');
const { token } = require('morgan');
// const { status } = require('express/lib/response');
// const { response } = require('../app');


/** 
* @method - POST
* @param - /signup
* @description - User SignUp 
*/

router.post(
  "/signup", [
    check("username", "Please Enter a Valid Username")
    .not()
    .isEmpty(),
    check("email", "Please Enter a Valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({min: 4})
  ],
  async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const {
      username, email, password
    } = req.body;
    try{
      let user = await User.findOne({
        email
      });
      if(user){
        return res.status(400).json({
          msg: "User Already Exists"
        });
      }

      user = new User({
        username,
        email,
        password
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

    jwt.sign(
      payload,
      "randomString", {
        expiresIn: 10000
      },
      (err, token) => {
        if(err) throw err;
        res.status(200).json({
          token
        });
      }
    );
  }catch (err){
    console.log(err.message);
    res.status(500).send("Error in Saving")
  }
}
);

/** 
* @method - POST
* @param - /login
* @description - User SignIn 
*/

router.post('/login', [
  check("email", "Please enter a valid email").isEmail(),
  check("password", "Please enter a valid password").isLength({
    min: 4
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const {email, password} = req.body;
    try{
      let user = await User.findOne({
        email
      });
      if(!user)
        return res.status(400).json({
          message: "User Does Not Exist!!"
        });
      
      const isMatch = await bcrypt.compare(password, user.password);
      if(!isMatch)
        return res.status(400).json({
          message: "Incorrent Password!"
        });
      
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 3600
        },
        (err, token) => {
          if(err) throw err;
           res.status(200)
           .json({
             token
           });
           //res.redirect('/me',)
           
        }
      );
    } catch(e){
      console.error(e);
      res.status(500).json({
        message: "Server Error"
      })
    }
  }
  )


/** 
* @method - GET
* @param - /user/me
* @description - Get LoggenIn User 
*/

router.get('/me', auth, async(req, res, next) =>{
  console.log("req header set: "+token);
  //req.setHeader("token", token);
  //req.redirect('/user/me');
  try{
    //request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    //res.render('dashboard',{pageTitle: "Dashboard", user:user});
    res.json(user);
  } catch (e) {
    res.send({message: "Error in Fetching user"});
  }
});

router.get('/login', function(req, res, next){
  res.render('login');
})

module.exports = router;
