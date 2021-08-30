const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//! email validator --- isEmail is  a function
const {isEmail} = require("validator")

const userSchema = new mongoose.Schema({
    email: {
        type : String,
        required : [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password : {
        type : String,
        required : [true, 'Please enter a password'],
        minlength: [6, 'Minimum password length is six characters']
    }
})

//! static method to login users
userSchema.statics.login = async function(email, password){
    const user = await this.findOne({email})
    if(user){
       const auth = await bcrypt.compare(password, user.password)
       if(auth){
           return user
       }
       throw Error('incorrect password')
    }
    throw Error('incorrect email')
}


//! fire a function after a new user is saved to the db
userSchema.post("save", function(doc, next){
    console.log("new user was created and saved",  doc);
    next()
})
//! fire a function before a new user is saved to the db
userSchema.pre("save", async function(next){
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    next()
})


const User = mongoose.model('user', userSchema);
module.exports = User;