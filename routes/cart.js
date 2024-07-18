var express = require('express');
const {db} = require('../db/knex.db');
const bcrypt = require('bcryptjs');
const verifyAuth = require('./auth');
const jwt = require('jsonwebtoken');
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');
var router = express.Router();

// redis in memory DB; 


  router.post('/add',async function(req,res){
    const productId = parseInt(req.query.productid); 
  
   if(!productId){
      return res.status(400).send({
        message: 'parameter is missing'
      })
    }
    const product = await db('products').select('*').where('id',productId).first();
    console.log("product info ",product);
    if(!product){
      return res.status(400).send({
        message: 'No product with id '+productId+' found ',
        message2: `No product with id ${productId} found`
      })
    }
    const userId = parseInt(localStorage.getItem('myKey'));
    console.log('userid:'+userId); 
    console.log('productid:'+productId); 
  
    if(!userId){
      return res.status(400).send({
        message: 'Log in first',
      })
    }
  
  
    try{
      var count = 1;
      const cart = await db('carts').select('*').where('userid',userId).andWhere('productid',productId);
      if(cart.length==0){
        const result= await db('carts').insert({ userid: userId, productid: productId, productCount: count });
      }else{
        const newCount = cart[0].productCount+1;
        result = await db('carts')
        .where('userid', userId)
        .andWhere('productid', productId)
        .update({ productCount: newCount });
        console.log("res ",result);
      }
      
      
    }catch(err){
      console.log("Err" + err);
    }
    
    return res.status(201).send({
      message: 'cart added successfully',
      userid : userId,
      productid : productId
    })
  
  });


  router.post('/delete', verifyAuth, async function(req, res) {
    const productid = req.query.productid;
    const userId = parseInt(localStorage.getItem('myKey'));
    if(!userId){
        return res.status(400).send({
          message: 'Log in first',
        })
      }
    if (!productid) {
      return res.status(400).send({
        message: 'Parameter is missing'
      });
    }
  
    const cart = await db('carts').select('*').where('userid', userId).andWhere('productid', productid).first();
  
    if (!cart) {
      return res.status(400).send({
        message: 'There is no cart with given productid'
      });
    }
    
    try {
        const deletedCart = await db('carts').where('userid', userId).andWhere('productid', productid).del();
      if (deletedCart) {
        return res.status(200).send({
          message: 'Product successfully deleted'
        });
      }
    } catch (err) {
      console.log("Error -> ", err);
      return res.status(500).send({
        message: 'Error deleting product'
      });
    }
    
  });


  router.get('/list', async function(req, res, next) {
    const productid=req.query.productid;
    const userid=req.query.userid;
    if (!userid&&!productid) {
      return res.status(400).send({
        message: 'parameter is missing'
      })


    } else if (userid) {
      const result=await db('carts as c')
      .innerJoin('users as u', 'c.userid', 'u.id')
      .innerJoin('products as p', 'c.productid', 'p.id')
      .select(
        'u.id as uid',
        'p.id as pid',
        'u.name as uName',
        'u.email as uEmail',
        'u.username as uUserName',
        'u.surname as uSurName',
        'u.userType as uUserType',
        'p.name as productName',
        'p.price as productPrice',
        'p.date as productDate',
        'c.productCount as Count'
      )
      .where('c.userid', userid) // userid = 2 olan kayıtları filtreler
       
        console.log(result);
        res.json(result);
      
      
    }
   if (!productid) {
    return res.status(400).send({
      message: 'parameter is missing',
      result:'deneme'
    })

   }
    else {
const result=await db('carts as c')
.innerJoin('users as u', 'c.userid', 'u.id')
.innerJoin('products as p', 'c.productid', 'p.id')
.select(
  'u.id as uid',
  'p.id as pid',
  'u.name as uName',
  'u.email as uEmail',
  'u.username as uUserName',
  'u.surname as uSurName',
  'u.userType as uUserType',
  'p.name as productName',
  'p.price as productPrice',
  'p.date as productDate',
  'c.productCount as Count'
)
.where('c.productid', productid);

res.json(result);


    }
   
  });


  module.exports = router;
