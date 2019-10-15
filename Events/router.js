const {Router} = require('express'); // require router class from express
const Events = require('./model') //require event model
const auth = require('../auth/middleware'); //require auth middleware
const router = new Router();  //Instantiate a router
const Sequelize = require('sequelize'); //require sequelize
const mkdir = require('make-dir') //require make-dir for creating a directory
const fs = require('fs'); //require fs to search if the file exists
const Op = Sequelize.Op; //to compare dates
const event = require('./middleware'); // require an event middleware
const basePath = "/home/nirupamaa/Desktop/codaisseur/week-8/ticketswapproject/images"; //basepath for storing images


//get all the events along with pagination
router.get('/event', (req,res,next) => {
    const limit = req.query.limit || 9;
    const offset = req.query.offset || 0;

    Events.findAll({
        limit,offset,
        where: {
            startDate:{
                [Op.gt]:new Date()
            }
        }
    })
    .then(events => {
        if(events){
            return res.send(events);
        }
    })
    .catch(err => next(err))
});

//get a event by eventid
router.get('/event/:id', event, (req,res) => {
    const eventobject = req.event
    console.log(eventobject);
    res.status(200).send(eventobject);
});

//create an event 
router.post('/event',auth, async(req,res,next) => {
    const loggedInuser = req.data.userId;
    if(loggedInuser){
       const {eventname, description,startDate, endDate} = req.body
       if(eventname && description && startDate && endDate && req.files){
            Events.create({
                eventname,
                description,
                startDate,
                endDate,
                userId: loggedInuser
            })
            .then(async(event) => {
                const path = await mkdir(`${basePath}/${event.id}`)
                const avatar = req.files.avatar
                avatar.name = 'logo.png'
                avatar.mv(`/${path}/` + avatar.name)
                res.status(200).send({
                   message:"Success"
                })
            })
            .catch(err => next(err))
        }
        else{
            res.status(400).send({
                message:"Not all data provided"
            })
        }
    }
});


//updating an event
router.put('/event/:id',auth, (req,res,next) => {
    const loggedInuser = req.data.userId

    if(loggedInuser){
        const {eventname,description,startDate,endDate} = req.body;
        Events.findByPk(req.params.id)
             .then(event => {
                 if(event){
                     event.update({
                         eventname,
                         description,
                         startDate,
                         endDate
                     })
                     .then(
                         res.status(200).send({
                             message: "Event updated successfully"
                         })
                    )
                 }
             })
             .catch(err => next(err))
    }
});



//getting an image as a response
router.get('/images/event/:id', async(req,res,next) => {
    const id = req.params.id
    const path = `${basePath}/${id}`
    const filePath = `/${path}/logo.png`
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

module.exports = router; // exporting the router