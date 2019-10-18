const {Router} = require('express'); // require router class from express
const Comments = require('../Comments/model'); //require Comments model
const auth = require('../auth/middleware'); //require auth middleware

const router = new Router() //Instantiate a router

//creating a comment
router.post('/ticket/:id/comment',auth,async(req,res) => {
    const loggedInUser = req.data.userId
    const id = req.params.id
    console.log(id)
    if(loggedInUser){
        const {comment} = req.body
        if(comment){
            Comments.create({
                comment,
                ticketId: id,
                userId: loggedInUser,
                
            })
            .then(comment => {
                res.status(200).send({
                    message:"Success"
                })
            })
        }
        else{
            res.status(400).send({
                message: "No data"
            })
        }
    }
});


//get all the comments
router.get('/ticket/:id/comment',(req,res,next) => {
    const id=req.params.id
    Comments.findAll({
        where:{
            ticketId:id
        }
    })
    .then(comments => {
        if(comments){
            res.status(200).send(comments)
        }
    })
    .catch(err => next(err))
})

module.exports = router; //exporting the router
