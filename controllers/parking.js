var db = require('../config/db');
var _ = require('lodash');
const uuidV4 = require('uuid/v4');
var request= require('request');

var parkingSlotType  = {
    first:{
 slotType:'first',
 availabilityStartTime: "00:00:00",
 availabilityEndTime : "06:00:00",
 name : "First Slot (12.00AM - 6.00AM)"   
},
second:
{
 slotType:'second',
 availabilityStartTime: "06:00:00",
 availabilityEndTime : "12:00:00",
 name: "Second Slot (6.00AM - 12.00PM)"   
},
third:{
 slotType:'third',
 availabilityStartTime: "12:00:00",
 availabilityEndTime : "18:00:00",  
 name:"Third Slot (12.00PM - 6.00PM)" 
},
fourth:
{
 slotType:'fourth',
 availabilityStartTime: "18:00:00",
 availabilityEndTime : "00:00:00", 
 name :"Fourth Slot (6.00PM - 12.00AM)"  
}
};



module.exports ={

getParking :function(req,res){


db.raw("SELECT data,id from parking_system.parking_slot where (data->>'ownerID')::UUID = ?",req.user.userID
)
.then(results=>{

let resultData=[];

if(results.rows.length>0){


results.rows.forEach(val=>{
val.data.parkingSlotID = val.id;
resultData.push(val.data);


})

}


console.log(resultData);
res.status(200).json({
    status :'success',
    data: resultData
})

}).catch(err=>{
    console.log(err);
res.status(500).json({
    status :'fail',
    data: 'Error in fetching parking details'
})

});


},

getParkingStatus : function(req,res){






},

publishParkingAvailability : function(req,res){


let parkingDetails = req.body;
let slotTimings = req.body.slotTimings;
console.log(parkingDetails);
db.raw('select * from parking_system.parking_availability where "parkingSlotID" = ? and "availabilityDate" = ?', [parkingDetails.parkingSlotID,parkingDetails.availabilityDate]).then(results=>{



if(results.rows.length==0){

    let publishParams = [];
slotTimings.forEach(function(element) {
    element.availabilityID  = uuidV4();
    element.parkingSlotID = parkingDetails.parkingSlotID;
    element.availabilityDate=parkingDetails.availabilityDate;
    element.availabilityStartTime = parkingSlotType[element.slotType].availabilityStartTime;
    element.availabilityEndTime = parkingSlotType[element.slotType].availabilityEndTime;
    element.availabilityStatus=element.availabilityStatus;
    delete element.name;
    publishParams.push(element);
}); 

db.transaction(function(trx) {
db('parking_system.parking_availability').transacting(trx).insert(publishParams,'availabilityID').then(results=>{
trx.commit();
 
 res.status(200).json({
  status : 'success',
  data  : results,
  message: 'Parking availability published successfully'
 })



}).catch(err=>{
    console.error('err',err);
trx.rollback();
 res.status(500).json({
  status : 'fail',
  message: 'Error in publishing parking availability'
 })

})
})
.then(function(resp) {
  console.log('Transaction complete.');
})
.catch(function(err) {
  console.error(err);
});

}
else{



       let updatePromise=[];
slotTimings.forEach(function(element) {
    
    element.availabilityID  = element.availabilityID;
    element.parkingSlotID = parkingDetails.parkingSlotID;
    element.availabilityDate=parkingDetails.availabilityDate;
    element.availabilityStartTime = parkingSlotType[element.slotType].availabilityStartTime;
    element.availabilityEndTime = parkingSlotType[element.slotType].availabilityEndTime;
    element.availabilityStatus=element.availabilityStatus;
    updatePromise.push(element);

});



db.transaction(function(trx) {


Promise.all(updatePromise.map(item => {
    return db('parking_system.parking_availability')
.where("availabilityID", '=', item.availabilityID)
.update({
  availabilityStartTime: item.availabilityStartTime,
  availabilityEndTime: item.availabilityEndTime,
  availabilityDate:item.availabilityDate,
  slotType: item.slotType,
  availabilityStatus:item.availabilityStatus
});
})).then(results => {

    
      trx.commit();
  res.status(200).json({
  status : 'success',
  message: 'Parking availability published successfully'
 })
})
 .catch(err=>{
trx.rollback();
    console.log(err);
    res.status(500).json({
  status : 'fail',
  message: 'Error in publishing parking availability'
 })
});









})
.then(function(resp) {
  console.log('Transaction complete.');
})
.catch(function(err) {
  console.error(err);
});


}

}).catch(err=>{
    console.log(err);
    res.status(500).json({
  status : 'fail',
  message: 'Error in publishing parking availability'
 })
});






 },

 getParkingAvailabilityByID : function(req,res){

   let parkingSlotID = req.params.id;


   db.raw(`select ps."data"->>'slotNumber' as slotNumber,ps."data"->>'parkingType' as parkingType,pa."availabilityID",pa."availabilityStatus",pa."availabilityDate",pa."availabilityStartTime",pa."availabilityEndTime",pa."slotType",ps."id"  as parkingSlotID
from parking_system.parking_slot ps join parking_system.parking_availability pa on ps."id" = pa."parkingSlotID" where ps."id"= ? ::uuid;`,req.params.id)
.then(results=>{

console.log(results);
    if(results.rows.length >0){

let slotTimings=[];


results.rows.forEach(val=>{

slotTimings.push({
availabilityID:val.availabilityID,
availabilityStatus:val.availabilityStatus,
availabilityStartTime:val.availabilityStartTime,
availabilityEndTime:val.availabilityEndTime,
slotType:val.slotType,
name:parkingSlotType[val.slotType].name
})



});

let opData={
    slotTimings:slotTimings,
    parkingSlotID : results.rows[0].parkingslotid,
    availabilityDate : results.rows[0].availabilityDate,
    slotNumber : results.rows[0].slotnumber,
    parkingType:results.rows[0].parkingtype
}

res.status(200).json({

    status:'success',
    data:opData,
    message:'Data Fetch Successful'
})

    }
    else{

res.status(200).json({

    status:'success',
    data:{slotTimings:[]},
    message:'No bookings found'
})

    }

}).catch(err=>{
    console.log(err);
    res.status(200).json({

    status:'fail',
    data:err,
    message:'Error in data fetch'
})
});




 },

 getParkingAvailabilityByIDDate : function(req,res){

   let parkingSlotID = req.body.parkingSlotID;
   let availabilityDate = req.body.availabilityDate;

console.log(parkingSlotID)
   db.raw(`select ps."data"->>'slotNumber' as slotNumber,ps."data"->>'parkingType' as parkingType,pa."availabilityID",pa."availabilityStatus",pa."availabilityDate",pa."availabilityStartTime",pa."availabilityEndTime",pa."slotType",ps."id"  as parkingSlotID
from parking_system.parking_slot ps join parking_system.parking_availability pa on ps."id" = pa."parkingSlotID" where ps."id"= ? ::uuid and pa."availabilityDate"=?;`,[parkingSlotID,availabilityDate])
.then(results=>{

console.log(results);
    if(results.rows.length >0){

let slotTimings=[];


results.rows.forEach(val=>{

slotTimings.push({
availabilityID:val.availabilityID,
availabilityStatus:val.availabilityStatus,
availabilityStartTime:val.availabilityStartTime,
availabilityEndTime:val.availabilityEndTime,
slotType:val.slotType,
name:parkingSlotType[val.slotType].name
})



});

let opData={
    slotTimings:slotTimings,
    parkingSlotID : results.rows[0].parkingslotid,
    availabilityDate : results.rows[0].availabilityDate,
    slotNumber : results.rows[0].slotnumber,
    parkingType:results.rows[0].parkingtype
}

res.status(200).json({

    status:'success',
    data:opData,
    message:'Data Fetch Successful'
})

    }
    else{

res.status(200).json({

    status:'success',
    data:{slotTimings:[]},
    message:'No bookings found'
})

    }

}).catch(err=>{
    console.log(err);
    res.status(404).json({

    status:'fail',
    data:err,
    message:'Error in data fetch'
})
});




 },



 getParkingAll : function(req,res){
     console.log('all');

   let availabilityDate = req.body.availabilityDate;

   db.raw(`select ps."data"->>'slotNumber' as slotNumber,ps."data"->>'parkingType' as parkingType,pa."availabilityID",pa."availabilityStatus",pa."availabilityDate",pa."availabilityStartTime",pa."availabilityEndTime",pa."slotType",ps."id"  as parkingSlotID
from parking_system.parking_slot ps join parking_system.parking_availability pa on ps."id" = pa."parkingSlotID" where  pa."availabilityDate"=?;`,[availabilityDate])
.then(results=>{

console.log(results.rows);


let resultsData=groupBy(results.rows,'slotnumber','slotNumber','slotTimings');
  
    res.status(200).json({

    status:'success',
    data:resultsData,
    message:'Data Fetch Successful'
})

}).catch(err=>{
    console.log(err);
    res.status(404).json({

    status:'fail',
    data:err,
    message:'Error in data fetch'
})
});




 },

 bookParking:function(req,res){


db.transaction(function(trx){

let parallelBookings=[];
req.body.availabilityID.forEach(val=>{
let queryParams = [val,req.user.userID];
parallelBookings.push(trx.raw('SELECT parking_system."bookParking"(?,?)',queryParams))

    });


    Promise.all(parallelBookings).then(results=>{

    trx.commit();
let opData=[];
    results.forEach(val=>{
        console.log(val);
opData.push(val.rows[0].bookParking);
    })
     res.status(200).json({

         status:'success',
         data:opData,
         message:'Booking Successfull'
     })


    }).catch(err=>{
        console.log(err);
     res.status(500).json({

         status:'fail',
         message:'Booking failed.Try again'
     })
    
}) ;












})




 },


getUserBooking: function(req,res){

    db.raw(`select pb."booking_id" , pb."slot_availability_id",pb."booking_user_id",pb."booking_time",pb."booking_status",pa."availabilityDate",
ps."data"->>'slotNumber' as "slotNumber" , ps."data"->>'parkingType' as "parkingType" from parking_system."bookings"  pb
 join 
parking_system."parking_availability" pa  on  pb.slot_availability_id = pa."availabilityID"
 JOIN 
 parking_system.parking_slot ps ON pa."parkingSlotID" = ps."id"  where pb.booking_user_id = ?`,req.user.userID).then(results=>{

     res.status(200).json({

         status:'success',
         data:results.rows,
         message:'Data Fetch Succesfull'
     })

    }).catch(err=>{

  res.status(404).json({

         status:'fail',
         message:'Error in data fetch'
     })

    });

    


},

instamojoPayment : function(req,res){



    var headers = { 'X-Api-Key': '7915af215db9a3dd21e8daabe064431c', 'X-Auth-Token': '03922e25e7dc367ae52974fc9e67b8a2'}
var payload = {
  purpose: req.body.type+'#'+req.body.reference_id,
  amount: req.body.amount,
  phone: req.body.phone,
  buyer_name: req.body.name,
  //redirect_url: 'http://www.example.com/redirect/',
  send_email: true,
 // webhook: 'http://www.example.com/webhook/',
  send_sms: true,
  email: req.body.email,
  allow_repeated_payments: false}

request.post('https://test.instamojo.com ', {form: payload,  headers: headers}, function(error, response, body){
  if(!error && response.statusCode == 201){
    console.log(body);
      res.status(500).json({
          status:'fail',
          data:response.payment_request
      })
  }
  else{
      res.status(200).json({
          status:'success',
          data:response.payment_request
      })
  }
})



}



}

/**private methods */

function groupBy(dataToGroupOn, fieldNameToGroupOn, fieldNameForGroupName, fieldNameForChildren) {
            var result = _.chain(dataToGroupOn)
             .groupBy(fieldNameToGroupOn)
             .toPairs()
             .map(function (currentItem) {
                 
                 currentItem.push(currentItem[1][0].parkingtype)
                 currentItem.push(currentItem[1][0].parkingslotid)


                let availabilityStatus= 'NOT_AVAILABLE';
                 currentItem[1].forEach(val=>{
                    val.name=parkingSlotType[val.slotType].name;
                    if(val.availabilityStatus==='AVAILABLE')
                    availabilityStatus='AVAILABLE';
                   
                 });
                 currentItem.push(availabilityStatus);
                 
                 return _.zipObject([fieldNameForGroupName, fieldNameForChildren,'parkingType','parkingSlotID','availabilityStatus'], currentItem);
                
             })
             .value();
            return result;
        }


