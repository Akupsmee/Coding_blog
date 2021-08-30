const User = require("../models/User")
const jwt = require("jsonwebtoken")

//! handle errors
const handleErrors = (error) => {
    console.log(error.message, error.code)
    let errors = { email: '', password: '' }

//! incorrect login email
if(error.message === 'incorrect email'){
    errors.email = 'Email not found please register and try again'
}
if(error.message === 'incorrect password'){
    errors.email = 'Password not correct, Please enter correct password'
}


//! duplicate error code
    if(error.code === 11000){
        errors.email = 'email already in use'
    }

    // ! validation errors 
    if (error.message.includes('user validation failed')) {        
        Object.values(error.errors).forEach(({properties}) =>
        errors[properties.path] = properties.message
        )
    }
        return errors
}

//! seconds
const maxAge = 3 * 24 * 3600;

const createToken = (id)=>{
    return jwt.sign({id}, 'net ninja secret', {
        expiresIn: maxAge
    })
}

module.exports.signup_get = (req, res) => {
    res.render('signup', {title: "Signup"});
}

module.exports.login_get = (req, res) => {
    res.render('login', {title : "login"});
}

module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body
    try {
        const newUser = await User.create({ email, password })
       const token = createToken(newUser._id)
       res.cookie('jwt', token, {httpOnly: true, maxAge: 1000 * maxAge})
       
       res.status(201).json({newUser: newUser._id});

    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({errors})
    }
}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body
    try {
        const newUser = await User.login(email, password)
        const token = createToken(newUser._id)
        res.cookie('jwt', token, {httpOnly: true, maxAge: 1000 * maxAge})
        res.status(200).json({newUser: newUser._id})
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({errors})
    }

}

module.exports.logout_get = async (req, res) => {
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect("/")
}
