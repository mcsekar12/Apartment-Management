var db = require('../config/db');
var shortid = require('shortid');
//shortid.generate()
module.exports = {



bookVisitorPass :function(req,res){



//insert into parking_system.bookings () values (in_availabilityId,in_booking_user_id,'BOOKED') RETURNING booking_id::text INTO out_booking_id;


db.transaction(function(trx){

let insertParams={

booking_user_id:req.user.userID,
booking_status :'BOOKED',
booking_type:req.body.amenity_type,
booking_id:shortid.generate(),
booked_for_date : req.body.visit_date,
booked_for_date : new Date(),
booking_quantity: 1,
visitor_name : req.body.visitor_name,
visitor_mobile_number : req.body.visitor_mobile_number

};
 trx.insert({data:insertParams}).into('parking_system.amenities_bookings').
 returning('id').then(results=>{

trx.commit();
     res.status(200).json({
  status : 'success',
  data  : results,
  message: 'Visitor booking successfull'
 })

}).catch(err=>{
console.log(err);
  res.status(500).json({
  status : 'fail',
  message: 'Error in Visitor booking'
 })

});


});



},

getVisitorPass : function(req,res){


db.raw(`SELECT psab.data as booking_data,psu.data as user_data from 
"parking_system"."amenities_bookings" psab 
join 
"parking_system"."users" psu 
on 
psu."id" = (psab."data"->>'booking_user_id')::uuid`
)
.then(results=>{

let resultData=[];

if(results.rows.length>0){


results.rows.forEach(val=>{
let booking_data = Object.assign({}, val.booking_data, val.user_data);

resultData.push(booking_data);


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


getVisitorPassByUser : function(req,res){


db.raw("SELECT data,id from parking_system.amenities_bookings where data->>'booking_user' = ? ",
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