var express = require('express');
const {db} = require('../db/knex.db');
const bcrypt = require('bcryptjs');
const verifyAuth = require('./auth');
const jwt = require('jsonwebtoken');
var router = express.Router();

router.get('/list', verifyAuth, async function(req, res, next) {
    const parameterId = req.query.id;
    const parameterName = req.query.name;
    const searchName = parameterName +'%';
    let productsData=[];
    if(parameterId){
      productsData = await db('products').select('*').where('id',parameterId);
    }else if(parameterName){
      productsData = await db('products').select('*').where('name','like',searchName);
    }else{
      productsData = await db('products').select('*');
    }
    res.json(productsData);
   
});


router.post('/add', verifyAuth, async function (req,res){
  /* http://localhost:3001/users/productAdd */
  const { name,price } = req.body;

  if (!name && !price ) {}

  //const date = new Date().toISOString();

  // default => now()

  await db('products').insert(
    { name,price }
  )

  return res.status(201).send({
    message: 'product added successfully',
  })
})


router.post('/update', async function(req,res){
  /* http://localhost:3001/users/productUpdate?id=3 */
  const parameterId = req.query.id; // parametreli
  const { name,price,date } = req.body;
  console.log('parameter', parameterId);
  if(!parameterId){
    return res.status(400).send({
      message: 'parameter is missing'
    })
  }

  try{
    const product = await db('products')
      .where('id',parameterId) // veya başka bir koşul, örneğin 'where({ name })'
      .update({ name, price, date });
    if(product){
      return res.status(200).send({
        message: 'The product succesfully update'
      })
    }else{
      return res.status(400).send({
        message: 'There is no this product'
      })
    }
  }catch(err){
    console.log("Err ",err);
  }
});


router.post('/delete', async function(req, res) {
    const parameterId = req.query.id;
  
    if (!parameterId) {
      return res.status(400).send({
        message: 'Parameter is missing'
      });
    }
  
    const product = await db('products').select('*').where('id', parameterId).first();
  
    if (!product) {
      return res.status(400).send({
        message: 'There is no product with given id'
      });
    }
  
    try {
      const deletedProduct = await db('products').where('id', parameterId).del();
      if (deletedProduct) {
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
/*----------------------------------------------- */
// asynchronous
// async - await
// Promise
// callback

module.exports = router;
