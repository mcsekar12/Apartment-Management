"use strict"

var config=require('./dbConfig');
var knex;
if(process.env.NODE_ENV === 'production'){
knex=require('knex')(config.production);}
else{
knex=require('knex')(config.development);
}
module.exports = knex;