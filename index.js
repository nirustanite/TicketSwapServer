const express = require('express');  // require express

const cors = require('cors'); //require cors (Acts as a middleware for connecting server with client)

const bodyParser = require('body-parser'); //require bodyparser (parse req.body)

const fileUpload = require('express-fileupload'); //express file upload middleware

const userRouter = require('./User/router'); // require userRouter
const authRouter = require('./auth/router'); // require authRouter
const eventsRouter = require('./Events/router'); // require eventrouter
const ticketsRouter = require('./Tickets/router'); //require ticketrouter
const commentsRouter = require('./Comments/router'); //require commentsRouter

const app = express(); //creating an express app

const corsMiddleware = cors(); //creating a cors middleware

const parserMiddleware = bodyParser.json() //creating a parser middleware to parse req.body as json

const port = 4000; //creating a port in which the app runs

app.use(corsMiddleware); // making express app to use cors middleware in order to coonect with client

app.use(parserMiddleware) //making express app to use parse middleware
app.use(bodyParser.urlencoded({extended:true})); //body parser for multipart/form data

//middelware for fileupload
app.use(fileUpload({
    createParentPath: true
}))

app.use(userRouter); //router for user model
app.use(authRouter); //router for login
app.use(eventsRouter); //router for events
app.use(ticketsRouter); //router for tickets
app.use(commentsRouter); //router for comments


app.listen(port, () => console.log(`Listening on port ${port}`)) // making app to start on port 4000