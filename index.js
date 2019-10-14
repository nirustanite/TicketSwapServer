const express = require('express');  // require express

const cors = require('cors'); //require cors (Acts as a middleware for connecting server with client)

const bodyParser = require('body-parser'); //require bodyparser (parse req.body)

const app = express(); //creating an express app

const corsMiddleware = cors(); //creating a cors middleware

const parserMiddleware = bodyParser.json() //creating a parser middleware to parse req.body as json

const port = 4000; //creating a port in which the app runs

app.use(corsMiddleware); // making express app to use cors middleware in order to coonect with client

app.use(parserMiddleware) //making express app to use parse middleware

app.listen(port, () => console.log(`Listening on port ${port}`)) // making app to start on port 4000