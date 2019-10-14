const {Router} = require('express'); // require router class from express
const {toData} = require('../auth/jwt'); //require todata from jwt
const Events = require('./model') //require event model
const auth = require('../auth/middleware'); //require auth middleware
const router = new Router();  //Instantiate a router

//get all the events along with pagination
router.get('/event', (req,res,next) => {
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0

    Events.findAll({
        limit,offset
    })
    .then(events => {
        if(events){
            return res.send(events);
        }
    })
    .catch(err => next(err))
});

//get a event by eventid
router.get('/event/:id', (req,res,next) => {
    Events.findByPk(req.params.id)
          .then(event => {
              if(event){
                  res.send(event)
              }
          })
          .catch(err => next(err))
});


//create an event 
router.post('/event', auth, (req,res,next) => {
    const auth = req.headers.authorization && req.headers.authorization.split(' ');
    const loggedInuser = toData(auth[1]).userId;
    if(loggedInuser){
        const {eventname, description, picture, startDate, endDate} = req.body
        Events.create({
            eventname,
            description,
            picture,
            startDate,
            endDate,
            userId: loggedInuser
        })
        .then(event => {
            if(event){
                res.status(201).send({
                    message: "Success"
                })
            }
            else{
                res.status(400).send({
                    message:"Event not created"
                })
            }
        })
        .catch(err => next(err))
    }
});


//updating an event
router.put('/event/:id',auth, (req,res,next) => {
    const auth = req.headers.authorization && req.headers.authorization.split(' ');
    const loggedInuser = toData(auth[1]).userId;

    if(loggedInuser){
        const {eventname,description,picture,startDate,endDate} = req.body;
        Events.findByPk(req.params.id)
             .then(event => {
                 if(event){
                     event.update({
                         eventname,
                         description,
                         picture,
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

module.exports = router; // exporting the router