const Sequelize = require('sequelize'); // require Sequelize
const db = require('../db'); // requiring db connection
const Events = require('../Events/model'); //require Events Model
const Tickets = require('../Tickets/model'); //require Tickets Model

//creating an User model
const User = db.define('user',{
    firstname:{
        type:Sequelize.STRING,
        allowNull: false
    },
    lastname:{
        type:Sequelize.STRING,
        allowNull:false
    },
    email:{
        type:Sequelize.STRING,
        allowNull:false
    },
    password:{
        type:Sequelize.STRING,
        allowNull:false
    }
},{
    timestamps: false
});

Events.belongsTo(User); // events should have user id
Tickets.belongsTo(User); // tickets should have user id
User.hasMany(Events); // user can create many events
User.hasMany(Tickets); //  user can have many tickets

module.exports = User;  //exporting an User model

