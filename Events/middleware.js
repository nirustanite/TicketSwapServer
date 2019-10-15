const Event = require('../Events/model');

function event(req,res,next) {
   Event.findByPk(req.params.id)
        .then(event => {
            if(!event) return next("Event doed not exist")

            req.event = event
            next();
        })
        .catch(next)
}


module.exports = event