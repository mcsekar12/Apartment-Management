
const uuidV4 = require('uuid/v4');
var db = require('../config/db');
var _ = require('lodash');
var generatePassword = require('password-generator');

module.exports = {
 createUser: function(req, res) {
   
 db.transaction(function(trx){

var userModel = {
   "name":null,
	"phoneNumber":null,
	"blockNo":null,
	"flatNo":null,
	"residentID":null
};



var userBody = _.pick(req.body, _.keys(userModel));


 trx.insert({id:uuidV4(),data:userBody}).into('parking_system.users').
 returning('id').then(results=>{



let parkingSlots=[];
var userID=results[0];
    
   for(let i=0;i<req.body.parkingSlots.length;i++){
     let parkingSlot={};
     req.body.parkingSlots[i].ownerID=userID;
     parkingSlot.data=req.body.parkingSlots[i];
     parkingSlot.id=uuidV4();
     parkingSlots.push(parkingSlot);
   }

   trx.insert(parkingSlots).into('parking_system.parking_slot').returning('id').then(results=>{

   let randomPassword=generatePassword(12, false);
  
   
   let parkingSlotIds = _.isArray(results)?results:[];
   var loginParams = {
     user_id : userID,
     password : randomPassword,
     user_status : 'INACTIVE',
     resident_id : userBody.residentID
   }
  
    trx.insert(loginParams).into('parking_system.login').returning('user_id').then(results=>{


    res.status(200).json({
  status:'success',
  data : {
    userID : userID, 
  parkingSlots:parkingSlotIds,
  message : "User Added Successfully"
  }
})
    }).then(trx.commit).catch(trx.rollback);
     
 
   }).catch(function(err) {
  console.log(err);
  let message=err.detail;
  if(err.code==='23505' && err.detail.includes('parkingSlotNo')){
    message= 'Parking Slot already exists'
  }

  res.status(500).json({
  status:'fail',
  message: message
});
});
  


})
.catch(trx.rollback) 

})
.catch(function(err) {
  
  let message=err.detail;
  if(err.code==='23505' && err.detail.includes('residentID') ){
  message='Resident ID already exists';
  }
  else if(err.code==='23505' && err.detail.includes('parkingSlotNo')){
    message= 'Parking Slot already exists'
  }
 
  res.status(500).json({
  status:'fail',
  message: message
});
});


},
getUsers : function(req,res){


db.raw("SELECT psu.data as userData,pss.data as parkingSlots,psu.id as userID FROM parking_system.users as psu JOIN parking_system.parking_slot pss ON psu.id= (pss.data->>'ownerID')::UUID ").then(results=>{
  let outputArr=[];
  let output=_.values(_.groupBy(results.rows,'userid'));

   _.forEach(output, function(value) {
   
    var tempUser={};
    let tempParkingSlots=[]


    _.forEach(value,function(pslot){
       tempParkingSlots.push(pslot.parkingslots);
    }); 

tempUser=value[0].userdata;
tempUser.parkingSlots=tempParkingSlots;
tempUser.userID=value[0].userid;
outputArr.push(tempUser);

});
  res.status(200).json({
    status:'success',
    data: outputArr
  })
}).catch(err=>{
console.log(err);
res.status(500).json({
    status:'fail',
    data: 'Error in retreiving data'
  });
})


},

getUserByID : function(req,res){

// console.log(req.params)

db.raw("SELECT psu.data as userData,pss.id as parkingSlotID,pss.data as parkingSlot,psu.id as userID FROM parking_system.users as psu JOIN parking_system.parking_slot pss ON psu.id= (pss.data->>'ownerID')::UUID where psu.id = ?",req.params.id)
.then(results=>{
  
  let userData=results.rows;
   //console.log('-->',userData);
   if(userData.length>0){
    let tempParkingSlots=[]
   _.forEach(userData, function(value) {
     value.parkingslot.parkingSlotID=value.parkingslotid;
     console.log(value.parkingslotid)
     tempParkingSlots.push(value.parkingslot);
    
   });

let outputUser=userData[0].userdata;
outputUser.parkingSlots=tempParkingSlots;
outputUser.userID=userData[0].userid;
  res.status(200).json({
    status:'success',
    data: outputUser
  });
   }
   else{
     res.status(200).json({
    status:'success',
    data: []
  });
   }
}).catch(err=>{
console.log(err);
res.status(500).json({
    status:'fail',
    data: 'Error in retreiving user data'
  });
})


},

updateUser:function(req,res){

var userModel = {
   "name":null,
	"phoneNumber":null,
	"blockNo":null,
	"flatNo":null,
	"residentID":null
};



var userBody = _.pick(req.body, _.keys(userModel));
var parkingSlots = req.body.parkingSlots;

let queryParams = [req.body.userID,userBody,JSON.stringify(parkingSlots)];
console.log(queryParams);
db.transaction(function(trx){
trx.raw('SELECT parking_system."userUpdate"(?,?,?)',queryParams)
.then(results=>{
  
  if(results.rowCount > 0){
 console.log(results);
 trx.commit();
  res.status(200).json({
    status:'success',
    message:'User updated successfully'
  });
}
else{
  res.status(500).json({
    status:'fail',
    data: 'Error in updating user data'
  });
}
   
})
.catch(err=>{
  trx.rollback();
 
console.log(err);
res.status(500).json({
    status:'fail',
    data: 'Error in updating user data'
  });
})

})

},
deleteUser:function(req,res){





db.transaction(function(trx){
trx.raw('select parking_system."deleteUser"(?);',req.params.id)
.then(results=>{
  
  if(results.rowCount > 0){

 trx.commit();
  res.status(200).json({
    status:'success',
    message : 'User Deleted Successfully'
  });
}
else{
  res.status(500).json({
    status:'fail',
    data: 'Error in deleting user'
  });
}
   
})
.catch(err=>{
  trx.rollback();
 
console.log(err);
res.status(500).json({
    status:'fail',
    data: 'Error in deleting user'
  });
})

})

} 


};