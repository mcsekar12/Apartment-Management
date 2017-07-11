var db = require('../config/db');
var _ = require('lodash');
var jwt = require('jsonwebtoken');

module.exports = {


userAuthentication : function(req,res){

db('parking_system.login').where({
  resident_id: req.body.residentID,
  password:  req.body.password
}).column(['user_id', 'role_id']).select().then(results=>{


if(results.length > 0){
    let userID = results[0].user_id;
    let roleID = results[0].role_id;
    let token = jwt.sign({userID :userID,roleID:roleID }, 'secure_password',{ expiresIn: '60 * 60' });
res.status(200).json({

    status : "success",
    data: results[0],
    token : token
})
}
else{
    res.status(500).json({

    status : "fail",
    data: "User not present"
})
}


}).catch(err=>{
console.log(err);
res.status(500).json({
status:'fail',
message:err
});

});



}


}