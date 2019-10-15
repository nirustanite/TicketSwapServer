const Sequelize = require('sequelize'); // require Sequelize
const db = require('../db'); // requiring db connection
const Tickets = require('../Tickets/model'); //require Tickets Model

//creating events model
const Events = db.define('events', {
    eventname:{
        type: Sequelize.STRING,
        allowNull: false
    },
    description:{
        type: Sequelize.TEXT,
        allowNull: false
    },
    startDate:{
        type:Sequelize.DATE,
        allowNull: false
    },
    endDate:{
        type:Sequelize.DATE,
        allowNull: false
    }
},{
    timestamps: false
});

Tickets.belongsTo(Events); // Tickets shouls have event id
Events.hasMany(Tickets); //event can have many tickets

module.exports = Events;  // exporting events model