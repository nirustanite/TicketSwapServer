const Sequelize = require('sequelize'); // require sequelize inorder to make connection with database
const { connectionString }   = require('./config');
const dbConnectionString = connectionString // connection string to connect to database

const db = new Sequelize(dbConnectionString) // connecting to database

db.sync({force : false})                                  //sync the database
  .then(() => console.log("Database schema connected"))  // a loogging function to make sure db is connected
  .catch(console.error)                                 // catching the error


module.exports = db;  // exporting the db connection