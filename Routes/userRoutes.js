const express = require("express")
const router = express.Router();
const User = require("../models/User")
const auth = require("../middleware/auth");

//Create a User
router.post("/register", async(req,res) => {
  const user = new User(req.body);
  try{
    await user.save();
    res.status(201).send(user);
  }
  catch(err){
    res.status(400).send(err);
  }
})

module.exports = router;