const Sequelize = require('sequelize'); // require Sequelize
const db = require('../db'); // requiring db connection

//creating a comments model
const Comments = db.define('comments',{
    comment:{
        type: Sequelize.TEXT,
        allowNull: false
    }
},{
    timestamps: false
});


module.exports = Comments; //exporting the comments model