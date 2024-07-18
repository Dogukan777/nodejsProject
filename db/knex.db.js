const knex = require('knex');
const config = require('../config/knex-config');

console.log(config.development);

const db = knex(config.development);

module.exports = {db}