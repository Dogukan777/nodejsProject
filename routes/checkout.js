var express = require('express');
const {db} = require('../db/knex.db');
const bcrypt = require('bcryptjs');
const verifyAuth = require('./auth');
const jwt = require('jsonwebtoken');
var router = express.Router();
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');


router.get('/', async function(req, res, next) {
    
    const userId = parseInt(localStorage.getItem('myKey'));
    if(!userId){
        return res.status(400).send({
          message: 'Log in first',
        })
    }
    var totalPrice=0;
    // postgres => 
    const result=await db('carts as c')
    .innerJoin('users as u', 'c.userid', 'u.id')
    .innerJoin('products as p', 'c.productid', 'p.id')
    .select(
      'p.id as pid',
      'p.name as productName',
      'p.price as productPrice',
      'p.date as productDate',
      'c.productCount as Count'
    )
    .where('c.userid', userId);
   
    for (let row of result) {
        totalPrice = totalPrice + row.Count*row.productPrice;
    };

    res.json({products:result, total: totalPrice+'$'});
   
});


module.exports = router;
