const {Router} = require('express'); // require router class from express
const Tickets = require('./model') //require event model
const auth = require('../auth/middleware'); //require auth middleware
const router = new Router();  //Instantiate a router
const fs = require('fs'); //require fs to search if the file exists
const event = require('../Events/middleware'); // require an event middleware
const basePath = "/home/nirupamaa/Desktop/codaisseur/week-8/ticketswapproject/images"; //basepath for storing images
const Comments = require('../Comments/model');// require comments model
const Sse = require('json-sse');

//creating a ticket
router.post('/event/:id/ticket', auth, event, async(req,res) => {
    const eventId = req.event.id;
    const loggedInUser = req.data.userId;

    if(loggedInUser){
        const {price, description,quantity} = req.body 
        if(price && description && quantity && req.files){
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
                const avatar = req.files.avatar
                avatar.name = `${ticket.id}.png`
                avatar.mv(`/${basePath}/${eventId}/` + avatar.name)
                res.status(200).send({
                   message:"Success"
                })
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
    const eventId = req.event.id;

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
    const eventname = req.event.event
    Tickets.findOne({
        where:{
            id: req.params.ticketId
        }
    })
    .then(ticket => {
        if(ticket){
            res.status(200).send({
                ticket,
                eventname
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
    const loggedInUser = req.data.userId;

    if(loggedInUser){
        const {price, description, status} = req.body;
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
                .then(
                    res.status(200).send({
                        message:"Ticket updated successfully"
                    })
                )
            }
        })
        .catch(err => next(err))
    }
});

//get the image of the ticket
router.get('/images/event/:id/ticket/:ticketId', event, async(req,res) => {
    const eventId = req.event.id
    const id = req.params.ticketId
    const path = `${basePath}/${eventId}`
    const filePath = `/${path}/${id}.png`
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
    const eventId = req.event.id;

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
                                 res.send({
                                     message: "updated"
                                 })
                               })
                           }
                           else{
                            ticket.update({
                                risk: 0.95
                              })
                              .then(ticket => {
                                console.log(parseFloat(ticket.risk.toFixed(2)))
                                res.send({
                                    message: "updated"
                                })
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
        const totaltickets = tickets.length;
        console.log(totaltickets)
        const averagePrice = tickets.reduce((count,currentticket) => {
           return count + currentticket.price
        },0)/totaltickets
        const avg = parseFloat(averagePrice.toFixed(2));
        console.log("Average Price",avg)
        Tickets.findByPk(req.params.ticketId)
               .then(ticket => {
                   if(ticket.price <= avg){
                      const difference = avg - ticket.price;
                      const differencePercentage = (difference * 100)/avg;
                      const diffvalue = differencePercentage/100;
                      const riskyupdatedvalue = ticket.risk + diffvalue;
                      console.log("less than",riskyupdatedvalue)
                      if(riskyupdatedvalue > 0.05 && riskyupdatedvalue < 0.95){
                          ticket.update({
                              risk: ParseFloat(riskyupdatedvalue.toFixed(2))
                          })
                          .then(ticket => {
                            console.log("risk updated",ticket.risk)
                            res.send({
                                message: "updated"
                            })
                          })
                      }
                      else{
                          if(riskyupdatedvalue > 0.95){
                            ticket.update({
                               risk: 0.95
                            })
                            .then(ticket =>{
                                console.log("ticket risk",ticket.risk)
                                res.send({
                                    message: "updated"
                                })
                            })
                          }
                      }
                   }
                   else if(ticket.price > avg){
                    console.log("ticket price",ticket.price)
                    const difference = ticket.price - avg;
                    console.log("difference",difference);
                    const differencePercentage = (difference * 100)/avg;
                    console.log("percentage",differencePercentage)
                    const diffvalue = differencePercentage/100;
                    const riskyupdatedvalue = ticket.risk - diffvalue;
                    console.log("greater than",riskyupdatedvalue)
                    if(riskyupdatedvalue <= 0.10){
                        if(riskyupdatedvalue > 0.05 && riskyupdatedvalue < 0.95){
                            ticket.update({
                                risk:ParseFloat(riskyupdatedvalue.toFixed(2))
                            })
                            .then(ticket => {
                                console.log("risk updated", ticket.risk)
                                res.send({
                                    message: "updated"
                                })
                            })
                        }
                        else{
                            if(riskyupdatedvalue > 0.95){
                                ticket.update({
                                    risk: 0.95
                                })
                                .then(ticket => {
                                    console.log("risk updated", ticket.risk)
                                    res.send({
                                        message:"updated"
                                    })
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
               const hours = ticket.createdAt.getHours();
               const updatedrisk = 0
               if(hours >= 9 && hours<=17){
                   updatedrisk = ticket.risk - 0.1
               }
               else{
                  updatedrisk = ticket.risk + 0.1
               }

               if(updatedrisk > 0.05 && updatedrisk < 0.95){
                   ticket.update({
                       risk:updatedrisk
                   })
                   .then(ticket => {
                     console.log("risk updated", ticket.risk)
                     res.send({
                         message:"updated"
                     })
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
           const commentlength = comments.length
           Tickets.findByPk(req.params.id)
                  .then(ticket => {
                      if(commentlength > 3){
                          const updatedrisk = ticket.risk + 0.05;
                          if(ticket.risk > 0.05 && ticket.risk < 0.95){
                              ticket.update({
                                  risk:updatedrisk
                              })
                              .then(ticket => {
                                console.log("updated risk", ticket.risk)
                                res.send({
                                    message:"updated"
                                })
                              })
                          }
                      }
                  })
       })


       const room = await Tickets.findAll();
       const data = JSON.stringify(room)
       stream.send(data)
})

app.get('/stream', async (request, response) => {
    console.log('got a request on stream')
    const room = await Tickets.findAll();
    const data = JSON.stringify(room);

    stream.updateInit(data)
    stream.init(request,response)
})


module.exports = router; //exporting the router