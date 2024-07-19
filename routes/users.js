var express = require('express');
const {db} = require('../db/knex.db');
const bcrypt = require('bcryptjs');
const verifyAuth = require('./auth');
const jwt = require('jsonwebtoken');
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');

var router = express.Router();

/* GET users listing. */
router.get('/list', async function(req, res, next) {
  const parameterId = req.query.id;
  const user = req.user;
  let usersData = [];
  if(parameterId){
    usersData = await db('users').select('*').where('id',parameterId);
  }else{
    usersData = await db('users').select('*');
  }
  res.json(usersData);
 
});

/* GET users listing. */

/*---------------------------------------------------------------------- */
/* http://localhost:3001/users/signup */
router.post('/signup', async function(req, res) {
  const { username, password, name, surname, email, userType } = req.body;

  console.log("username ", username);

  // userType = user | company

  if (!email && !password ) {
    return res.status(400).send({
      message: 'email or password missing',
    });
  };

  const user = await db('users').select('*').where('email', email).first();

  console.log('USER', user)

  if (user) {
    return res.status(400).send({
      message: 'you are already have an account'
    })
  };

  const cryptedPassword = await bcrypt.hash(password, 8);

  await db('users').insert(
    { username, password: cryptedPassword, name, surname, email, userType }
  )

  return res.status(201).send({
    message: 'user has successfully created',
  })
});
/*---------------------------------------------------------------------- */
router.post('/login', async function(req, res) {
  const { email, password } = req.body;
  /*if (!email || !password) {
    return res.status(400).send({
      isLogin: false,
      message: 'email or password is missing',
      
    })
  };*/

  const user = await db('users').select('*').where('email', email).first();

  if (!user) {
    return res.status(400).send({
      isLogin: false,
      message: 'There is no account with given email'
    })
  };
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).send({
      isLogin: false,
      message: 'Password is wrong'
    })
  }

  const token = jwt.sign({ email: email, userId: user.id }, process.env.SECRET_KEY);

  localStorage.setItem('myKey', user.id);

  return res.status(200).send({
    isLogin: true,
    message: 'successfully logged in',
    token
  });
})
/* -------------------------------------------------- */
router.post('/delete',async function(req, res) {

  const parameterId = req.query.id;
  if(!parameterId){
    return res.status(400).send({
      message: 'parameter is missing'
    })
  }

  const user = await db('users').select('*').where('id', parameterId).first();
  
  if (!user) {
    return res.status(400).send({
      message: 'There is no account with given id'
    })
  };


  try{
    const user = await db('users').where('id',parameterId).del();
    if(user){
      return res.status(200).send({
        message: 'User succesfully deleted'
      })
    }

  }catch(err){
    console.log("Error -> ",err);
  }
})




/*----------------------------------------------- */
// asynchronous
// async - await
// Promise
// callback

module.exports = router;
