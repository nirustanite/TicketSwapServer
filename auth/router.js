const {Router} = require('express') // require router class from express
const {toJWT} = require('./jwt'); //require toJwt inorder to generate jwt token
const User = require('../User/model'); // require User model
const bcrypt = require('bcrypt'); //require bcrypt

const router = new Router(); //Instantiate a router

//create a login endpoint

router.post('/login', (req,res) => {
    const email = req.body.email;
    const password = req.body.password;

    //if there is no email or password send a message
    if(!email || !password){
        res.status(400).send({
            message: 'Please supply a valid email and passsword'
        })
    }
    else{
      // find a user based on email
      User.findOne({
          where:{ email}
      })
      .then(user =>{
          if(!user){
              res.status(400).send({
                  message: 'User with that email doesnot exist'
              })
          }
          //use bcrypt to compare password
          else if(bcrypt.compareSync(password,user.password)){
              const data = {
                  jwt: toJWT({userId: user.id}),
                  firstname:user.firstname,
                  userId:user.id,
                  message:"Success"
              }
              res.send(data)
          }
          else{
              res.status(400).send({
                  message: "Password was incorrect"
              })
          }
      })
      .catch(err => {
          console.error(err)
          res.status(500).send({
              message: 'Something went wrong'
          })
      })
    }
})

module.exports = router;