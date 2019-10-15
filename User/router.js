const {Router} = require('express'); // require router from express
const bcrypt = require('bcrypt'); // require bcrypt for hashing
const User = require('./model'); //require User model

const router = new Router(); //Instantiate a router

// creating a user endpoint (post request)
router.post('/user', async (req,res,next) => {
    console.log('What is request.body',req.body);
    const {firstname,lastname,email,password} = req.body;

    //if every data is present password is hashed
    if(firstname && lastname && email && password){
        const user = {
            firstname,
            lastname,
            email,
            password: bcrypt.hashSync(password,10)
        };

        console.log("User after password hashing", user);

        // check if email is already used
        const emailInUse = await User.findOne({
            where: { email },
            attributes: ['email']
        })
        .catch(next)

        console.log(emailInUse)
        //send response
        if(emailInUse){
            res.status(400).send({message: "Email already in use"});
        }
        else{
            User.create(user)
                .then(user =>{
                    if(user){
                        res.status(201).send({message: 'User Created Successfully! Please Login. You will be redirected to Login Page'});
                    }
                    else{
                        res.status(400).send({message: 'Failed to create user !!'});
                    }
                })
                .catch(next);
        }

    }
    else{
       res.status(400).send({message: "Not all data provided"});
    }
});


module.exports = router;