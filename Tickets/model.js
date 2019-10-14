const Sequelize = require('sequelize'); // require sequelize
const db = require('../db'); // requiring db connection
const Comments = require('../Comments/model'); // require Comments model

//creating Tickets model
const Tickets = db.define('tickets',{
    picture:{
        type: Sequelize.STRING,
        allowNull: false
    },
    price:{
        type: Sequelize.FLOAT,
        allowNull: false
    },
    description:{
        type:Sequelize.TEXT,
        allowNull: false
    },
    risk:{
        type:Sequelize.FLOAT,
        allowNull: false
    },
});

Comments.belongsTo(Tickets);
Tickets.hasMany(Comments);

module.exports = Tickets;  // exporting tickets model