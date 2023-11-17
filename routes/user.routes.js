const express = require("express");
const UserModel = require("../models/user.mode");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const authentication = require("../middlewares/authentication");
const userRouter = express.Router();
userRouter.get("/", authentication, async (req, res) => {
  const { q } = req.query;
  // console.log(q)
  const userId = req.userId;
  const filter = {};
  if (q) {
    filter['userName'] = { $regex: new RegExp("^" + q, "i") }
    // filter['userName'] = 'shiv'
  }
  // console.log(filter)
  try {
    const allUser = await UserModel.find(filter).limit(3);
    let index = allUser.findIndex(obj => obj._id == userId);
    // console.log(allUser)
    // console.log(index, userId)
    if (index >= 0) {
      
      allUser.splice(index, 1);
    }
    res.send({allUser});
  } catch (error) {
    console.log(error)
  }
});
userRouter.get("/single/:userId",  async (req, res) => {
  const  {userId}  = req.params;
  // console.log(userId)
  try {
    const user = await UserModel.findOne({ _id: userId },{password:0,__v:0});
    // delete user.password
    res.send({user});
  } catch (error) {}
});
userRouter.get("/login_user",authentication,  async (req, res) => {
  const  userId  = req.userId;
  // console.log(userId)
  try {
    const user = await UserModel.findOne({ _id: userId },{password:0,__v:0});
    // delete user.password
    res.send({user});
  } catch (error) {}
});

userRouter.post("/signup", async (req, res) => {
  const { userName, password } = req.body;
  try {
    const existingUser = await UserModel.findOne({ userName });
    if (existingUser) {
      res.send({ message: "User already registered" });
    } else {
      bcrypt.hash(password, 2, async function (err, hash) {
        const newUser = await UserModel.create({ userName, password: hash });
        // console.log(newUser)
        let token = jwt.sign({ userId: newUser._id }, "json_secret");
        res.send({ message: "User registered successful", token });
      });
    }
  } catch (error) {
    console.log(error);
  }
});

userRouter.post("/login", async (req, res) => {
  const { userName, password } = req.body;
 
  try {
    const existingUser = await UserModel.findOne({ userName });
    if (existingUser) {
      bcrypt.compare(password, existingUser.password, function (err, result) {
        // result == true
        if (result) {
          let token = jwt.sign({ userId: existingUser._id }, "json_secret");
          res.send({ message: "User login successful", token });
        } else {
          res.send({ message: "Entered wrong details" });
        }
      });
    } else {
      res.send({ message: "User not registered" });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = userRouter;
