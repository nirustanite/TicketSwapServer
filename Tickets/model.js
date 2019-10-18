const Sequelize = require('sequelize'); // require sequelize
const db = require('../db'); // requiring db connection
const Comments = require('../Comments/model'); // require Comments model

//creating Tickets model
const Tickets = db.define('tickets',{
    price:{
        type: Sequelize.FLOAT,
        allowNull: false
    },
    description:{
        type:Sequelize.STRING,
        allowNull: false
    },
    risk:{
        type:Sequelize.FLOAT,
        allowNull: false
    },
    status:{
        type:Sequelize.STRING,
        allowNull: false
    },
    quantity:{
        type:Sequelize.INTEGER,
        allowNull: false
    }
});

Comments.belongsTo(Tickets);


module.exports = Tickets;  // exporting tickets model