const express = require('express');

const bodyParser = require('body-parser');
const app = express();
  var winston = require('winston');
  var jwt = require('express-jwt');

var logger = new winston.Logger({
    level: 'info',
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: './logs/error.log' })
    ]
  });
  var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

logger.log('info', 'Hello distributed log files!');
app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(jwt({ secret: 'wildvegas'}).unless({path: ['/api/auth/login','/api/maintanence/payment/webhook']}));


// app.options("*",function(req,res,next){
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header('Access-Control-Allow-Methods','GET, POST','OPTION','PUT','DELETE');
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
//    //other headers here
//     res.status(200).end();
// });
// app.use(function(req, res, next){
//     res.setHeader('Access-Control-Allow-Origin','*');
//     res.setHeader('Access-Control-Allow-Methods','GET, POST','OPTION','PUT','DELETE');
//     res.setHeader('Access-Control-Allow-Headers','X-Requested-With,content-type,Authorization');
//     next();
// });
app.use(function (err, req, res, next) {
 
 console.log(req.url);

  if (err.name === 'UnauthorizedError') {
    console.log(err);
    res.status(401).send({status:'fail',message:'invalid token'});
  }
});

require('./routes/users')(app);
require('./routes/parking')(app);
require('./routes/amenity')(app);
require('./routes/complaint')(app);
require('./routes/announcement')(app);
require('./routes/maintenance')(app);


module.exports = app;