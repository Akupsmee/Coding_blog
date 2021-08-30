const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
require('dotenv').config();
const {checkUser } = require("./middleware/authentication");

// express app
const app = express();

// connect to mongodb & listen for requests
const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => app.listen(3000, ()=>{console.log('app is up and running on port 3000');}))
  .catch(err => console.log(err));

// register view engine
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.json())
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(morgan('dev'));
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

// routes
app.get("*", checkUser);
app.get('/', (req, res) => {
  res.redirect('/blogs');
});
app.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});


app.use(require("./routes/authRoutes"))
app.use(require("./routes/blogRoutes"))


// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});