let {Router} = require('express'); // require router class from express
let Tickets = require('./model') //require event model
let auth = require('../auth/middleware'); //require auth middleware
let router = new Router();  //Instantiate a router
let fs = require('fs'); //require fs to search if the file exists
let event = require('../Events/middleware'); // require an event middleware
const path = require('path');
const dirpath = require('../config');
let basePath = path.join(__dirname, dirpath );; //basepath for storing images

//creating a ticket
router.post('/event/:id/ticket', auth, event, async(req,res) => {
    let eventId = req.event.id;
    let loggedInUser = req.data.userId;

    if(loggedInUser){
        let {price, description,quantity} = req.body 
        if(price && description && quantity){
            Tickets.create({
                price,
                description,
                risk: 0.05,
                eventId,
                userId:loggedInUser,
                status:"Available",
                quantity
            })
            .then(ticket => {
                if(ticket){
                    let avatar = req.files.avatar
                    avatar.name = `${ticket.id}.png`
                    avatar.mv(`/${basePath}/${eventId}/` + avatar.name)
                    res.status(200).send({
                        ticket
                     })
                }
            })
            .catch(err => next(err))
        }
        else{
            res.status(400).send("Not all data provided")
        }
    }   
});

//get all the tickets based on event
router.get('/event/:id/ticket',event,(req,res) => {
    let eventId = req.event.id;

    Tickets.findAll({
        where: {
            eventId
        }
    })
    .then(tickets => {
        if(tickets){
            res.send(tickets)
        }
    })
})

//get ticket details of a ticket
router.get('/event/:id/ticket/:ticketId', event, (req,res,next) => {
    //let eventname = req.event.event
    Tickets.findOne({
        where:{
            id: req.params.ticketId
        }
    })
    .then(ticket => {
        if(ticket){
            res.status(200).send({
                ticket
            })
        }
        else{
            res.status(400).send({
                message:"Ticket not found"
            })
        }
    })
    .catch(err => next(err))
});

//update a ticket
router.put('/event/:id/ticket/:ticketId', event,auth,(req,res,next) => {
    let loggedInUser = req.data.userId;

    if(loggedInUser){
        let {price, description, status} = req.body;
        Event.findOne({
            where:{
                id:req.params.ticketId
            }
        })
        .then(ticket => {
            if(ticket){
                ticket.update({
                    price,
                    description,
                    status
                })
                .then(ticket => {
                    res.status(200).send({
                        message:"Ticket updated successfully"
                    })
                })
            }
        })
        .catch(err => next(err))
    }
});

//get the image of the ticket
router.get('/images/event/:id/ticket/:ticketId', event, async(req,res) => {
    let eventId = req.event.id
    let id = req.params.ticketId
    let path = `${basePath}/${eventId}`
    let filePath = `/${path}/${id}.png`
    console.log(filePath)
    try{
        if(fs.existsSync(filePath)){
            res.status(200).sendFile(filePath)
        }
        else{
            res.status(400).send({
                message:"file dosen't exist"
            })
        }
    }
    catch(err){
       res.status(500).end()
    }
})




module.exports = router; //exporting the router