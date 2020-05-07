# TicketSwapServer

## Description
1. This project is similar to TicketSwap Application which shows the list of events and tickets for the events.
2. Users can login and post Events and Tickets.

## Database 
Postgress database is used.

## Create a docker Image 
  `docker run -p 5432:5432 --name events -e POSTGRES_PASSWORD=<password> -d postgres`
  
1. Provide your password for postgrs database in the docker image.
2. Provide the postgres password  for the connection string in the congig file.

### Authentication 
1. JWT Token is used for Authentication.

## Modals
1. User Modal
2. Events Modal
3. Tickets Modal
4. Comments Model.

## Front End UI link
(https://github.com/nirustanite/TicketSwapClient)

## Running the application
1. Go to the project folder and type the command
      `npm start`
