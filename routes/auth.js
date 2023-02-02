const express = require('express');
const router  = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'vaibhavisgoodb$oy'

// Route 1: Create a User using : POST "/api/auth/createuser". No login required
router.post('/createuser',[
    body('name','Enter a valid name').isLength({ min: 3 }),
    body('email','Enter a valid email').isEmail(),
    body('password','Password must be atleast 5 characters').isLength({ min: 5 })
] , async(req,res)=>{
    let success = false;

    // If there are errors, return Bad request and the errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array()});
    }
    
    try {
        // Check whether the user with this email exists already

        // await is use here because it is promises means user take some time to find a user email
        // is present or not in model.
        let user = await User.findOne({email:req.body.email});
        console.log(user)
        if(user){
            return res.status(400).json({success, error : "Sorry a user with this email already exist"})
        } 

        // we are using bcrypt to secure password
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password,salt);

        // Create a new User
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        });
        
        const data = {
            user:{
                id : user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);

        // res.json(user)
        success=true;
        res.json({success, authtoken})

    // catch error occured when some written mistake or anything else
    }catch (error) {
        console.log(error.message);
        res.status(500).send({error:"Some error occured"});
    }
})


// Route 2: Authenticate a User using : POST "/api/auth/login". No login required
router.post('/login',
[
    body('email','Enter a valid email').isEmail(),
    body('password','Password cannot be blank').exists()
] 
, async(req,res)=>{
    success=false;
    // If there are errors, return Bad request and the errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array()});
    }

    // use destructuring
    const {email, password} = req.body;

    // now we will authenticate email and password i.e they are matching or not
    try {
        let user = await User.findOne({email}); // email is exist in User database or not
        // if user doesn't exist 
        if(!user){
            return res.status(400).json({success, error:"Please try to login with correct Credentials"});
        }

        // compare password
        const passwordCompare = await bcrypt.compare(password,user.password)
        // if password not match
        if(!passwordCompare){
            return res.status(400).json({success,error:"Please try to login with correct Credentials"});
        }

        const data = {
            user:{
                id : user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success=true;
        res.json({success,authtoken})

    } catch (error) {
        console.log(error.message);
        res.status(500).send({error:"Internal Server Error"});
    }
})

// Route 3: Get loggedin User details using : POST "/api/auth/getuser". Login required
router.post('/getuser', fetchuser , async(req,res)=>{
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).send({error:"Internal Server Error"});
    }
})
module.exports = router