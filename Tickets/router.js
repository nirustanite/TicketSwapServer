let {Router} = require('express'); // require router class from express
let Tickets = require('./model') //require event model
let auth = require('../auth/middleware'); //require auth middleware
let router = new Router();  //Instantiate a router
let fs = require('fs'); //require fs to search if the file exists
let event = require('../Events/middleware'); // require an event middleware
let basePath = "/home/nirupamaa/Desktop/codaisseur/week-8/ticketswapproject/images"; //basepath for storing images
let Comments = require('../Comments/model');// require comments model
let Sse = require('json-sse');

let stream = new Sse();
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


//calculation of risk
router.get('/event/:id/ticket/:ticketId/risk', event, async(req,res) => {
    let eventId = req.event.id;

    /* 
     Calculation of Risk

     Initial risk value : 0.05
    
     First Step :
     1. Find the author of ticket id
     2. Get the number of Ticket from the author
     3. if tickets array length is 1 add 10% to risk
    */

   await Tickets.findByPk(req.params.ticketId)
           .then(ticket => {
               Tickets.findAll({
                   where:{
                     userId:ticket.userId
                   }
               })
               .then(tickets => {
                   let countOfTickets = tickets.length;
                   if(countOfTickets === 1){
                       tickets.map(ticket => {
                           if(ticket.risk < 0.95){
                              ticket.update({
                                 risk: ticket.risk + 0.1
                               })
                               .then(ticket =>{
                                 console.log(parseFloat(ticket.risk.toFixed(2)))
                               })
                           }
                           else{
                            ticket.update({
                                risk: 0.95
                              })
                              .then(ticket => {
                                console.log(parseFloat(ticket.risk.toFixed(2)))
                              }) 
                           }
                       })
                   }
               })
           });

    
    /* 
    
    Second Step:
     1. Find all the tickets for the event id 
     2. Calculate average price of the tickets
     3. Find the ticket using ticket id
     4. Check if the price is less than average price
          - calculate the difference percentage
          - add the percentage to risk
        else
          -calculte the difference percentage
          -deduct the percentage from risk
    */

    Tickets.findAll({
        where:{
            eventId
        }
    })
    .then(tickets => {
        let totaltickets = tickets.length;
        console.log(totaltickets)
        let averagePrice = tickets.reduce((count,currentticket) => {
           return count + currentticket.price
        },0)/totaltickets
        let avg = parseFloat(averagePrice.toFixed(2));
        console.log("Average Price",avg)
        Tickets.findByPk(req.params.ticketId)
               .then(ticket => {
                   if(ticket.price <= avg){
                      let difference = avg - ticket.price;
                      let differencePercentage = (difference * 100)/avg;
                      let diffvalue = differencePercentage/100;
                      let riskyupdatedvalue = ticket.risk + diffvalue;
                      console.log("less than",riskyupdatedvalue)
                      if(riskyupdatedvalue > 0.05 && riskyupdatedvalue < 0.95){
                          ticket.update({
                              risk: parseFloat(riskyupdatedvalue.toFixed(2))
                          })
                          .then(ticket => {
                            console.log("risk updated",ticket.risk)
                          })
                      }
                      else{
                          if(riskyupdatedvalue > 0.95){
                            ticket.update({
                               risk: 0.95
                            })
                            .then(ticket =>{
                                console.log("ticket risk",ticket.risk)
                            })
                          }
                      }
                   }
                   else if(ticket.price > avg){
                    console.log("ticket price",ticket.price)
                    let difference = ticket.price - avg;
                    console.log("difference",difference);
                    let differencePercentage = (difference * 100)/avg;
                    console.log("percentage",differencePercentage)
                    let diffvalue = differencePercentage/100;
                    let riskyupdatedvalue = ticket.risk - diffvalue;
                    console.log("greater than",riskyupdatedvalue)
                    if(riskyupdatedvalue <= 0.10){
                        if(riskyupdatedvalue > 0.05 && riskyupdatedvalue < 0.95){
                            ticket.update({
                                risk:parseFloat(riskyupdatedvalue.toFixed(2))
                            })
                            .then(ticket => {
                                console.log("risk updated", ticket.risk)
                            })
                        }
                        else{
                            if(riskyupdatedvalue > 0.95){
                                ticket.update({
                                    risk: 0.95
                                })
                                .then(ticket => {
                                    console.log("risk updated", ticket.risk)
                                })
                            }
                        }
                    }
                   }
               })
    })


    /*
    
    Third Step:
    1. Check created time of ticket
       - if time >= 09 and time <= 17
           risk = risk - 10
         else
           risk = risk + 10
    
    */


    Tickets.findByPk(req.params.ticketId)
           .then(ticket => {
               let hours = ticket.createdAt.getHours();
               let updatedrisk = 0
               if(hours >= 9 && hours<=17){
                   updatedrisk = ticket.risk - 0.1
               }
               else{
                  updatedrisk = ticket.risk + 0.1
               }

               if(updatedrisk > 0.05 && updatedrisk < 0.95){
                   ticket.update({
                       risk: parseFloat(updatedrisk.toFixed(2))
                   })
                   .then(ticket => {
                     console.log("risk updated", ticket.risk)
                   })
               }
           })


      /* 
      Fourth step :
        1. Get count of comments for each ticket
            - if more than 3 comments 
                 risk = risk + 0.05
      */

       Comments.findAll({
           where:{
               ticketId:req.params.ticketId
           }
       })
       .then(comments => {
           let commentlength = comments.length
           Tickets.findByPk(req.params.id)
                  .then(ticket => {
                      if(commentlength > 3){
                          let updatedrisk = ticket.risk + 0.05;
                          if(ticket.risk > 0.05 && ticket.risk < 0.95){
                              ticket.update({
                                  risk: parseFloat(updatedrisk.toFixed(2))
                              })
                              .then(ticket => {
                                console.log("updated risk", ticket.risk)
                              })
                          }
                      }
                  })
       })


       let room = await Tickets.findAll();
       let data = JSON.stringify(room)
       stream.send(data)

       res.status(200).send({
           message:"updated"
       })
})

router.get('/stream', async (request, response) => {
    console.log('got a request on stream')
    let room = await Tickets.findAll();
    let data = JSON.stringify(room);

    stream.updateInit(data)
    stream.init(request,response)
})


module.exports = router; //exporting the router