var db = require('../config/db');
var shortid = require('shortid');
//shortid.generate()
module.exports = {



raiseComplaint :function(req,res){



//insert into parking_system.bookings () values (in_availabilityId,in_booking_user_id,'BOOKED') RETURNING booking_id::text INTO out_booking_id;


db.transaction(function(trx){

let insertParams={

complaint_user_id:req.user.userID,
complaint_status :'RAISED',
complaint_id:shortid.generate(),
complaint_date : new Date(),
complaint_text: req.body.complaint_text,
complaint_title: req.body.complaint_title

};
 trx.insert({data:insertParams}).into('parking_system.complaints').
 returning('id').then(results=>{

trx.commit();
  res.status(200).json({
  status : 'success',
  data  : results,
  message: 'Complain Raised successfull'
 })

}).catch(err=>{
console.log(err);
  res.status(500).json({
  status : 'fail',
  message: 'Error in Raising complain'
 })

});


});



},

getComplaints : function(req,res){


db.raw(`SELECT psc.data as complaint_data,psu.data as user_data from 
"parking_system"."complaints" psc 
join 
"parking_system"."users" psu 
on 
psu."id" = (psc."data"->>'complaint_user_id')::uuid`
)
.then(results=>{

let resultData=[];

if(results.rows.length>0){


results.rows.forEach(val=>{

let complaint_data = Object.assign({}, val.complaint_data, val.user_data);

resultData.push(complaint_data);


})

}

res.status(200).json({
    status :'success',
    data: resultData,
    message:"Data fetch Successfull"
})

}).catch(err=>{
    console.log(err);
res.status(500).json({
    status :'fail',
    data: 'Error in fetching parking details'
})

});

},


getComplaintsByUser : function(req,res){


db.raw("SELECT data,id from parking_system.complaints where data->>'complaint_user_id' = ? ",
req.user.userID)
.then(results=>{

let resultData=[];

if(results.rows.length>0){


results.rows.forEach(val=>{
resultData.push(val.data);


})

}

res.status(200).json({
    status :'success',
    data: resultData,
    message:"Data fetch Successfull"
})

}).catch(err=>{
    console.log(err);
res.status(500).json({
    status :'fail',
    data: 'Error in fetching parking details'
})

});

}



}