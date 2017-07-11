var db = require('../config/db');
var shortid = require('shortid');
var request = require('request');
module.exports = {



getMaintenanceAll : function(req,res){


db.raw(`SELECT psm.maintenance_id,psm.created_date,psm.owner_id,psm.payment_status,psm.maintenance_amount,psm.amount_due,psu.data->>'flatNo' as flat_number,"data"->>'blockNumber' as block_number,"data"->>'residentID'  as resident_id,psu.data->>'phoneNumber' phone_number,psu.data->>'name' owner_name, psm.attribute2 payment_id from  parking_system.maintenance psm join parking_system.users psu on  psm."owner_id" = psu."id"`
)
.then(results=>{



res.status(200).json({
    status :'success',
    data: results.rows,
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

getMaintenanceByUser : function(req,res){


db.raw(`SELECT psm.maintenance_id,psm.created_date,psm.owner_id,psm.payment_status,psm.maintenance_amount,psm.amount_due,psu.data->>'flatNo' as flat_number,"data"->>'blockNumber' as block_number,"data"->>'residentID'  as resident_id,psu.data->>'phoneNumber' phone_number,psu.data->>'name' owner_name ,psm.attribute2 payment_id from  parking_system.maintenance psm join parking_system.users psu on  psm."owner_id" = psu."id" where psm.owner_id = ?`,[req.user.userID]
)
.then(results=>{



res.status(200).json({
    status :'success',
    data: results.rows,
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

maintenancePayment : function(req,res){



    var headers = { 'X-Api-Key': '7915af215db9a3dd21e8daabe064431c', 'X-Auth-Token': '03922e25e7dc367ae52974fc9e67b8a2'}
var payload = {
  purpose: 'Maintenance',
  amount: 1234,
  phone: '9206594427',
  buyer_name: 'chandru',
  redirect_url: 'http://www.societyconnect.tk/success',
  send_email: true,
  webhook: 'https://calm-basin-73408.herokuapp.com/api/maintanence/payment/webhook',
  send_sms: true,
  email: 'mcsekargct@gmail.com',
  allow_repeated_payments: false}

request.post('https://test.instamojo.com/api/1.1/payment-requests/', {form: payload,  headers: headers}, function(error, response, body){
  if(!error && response.statusCode == 201){


      db.raw(`update parking_system.maintenance set  attribute1=? where  maintenance_id= ? `,[JSON.parse(response.body).payment_request.id,req.body.maintenance_id]
)
.then(results=>{
 res.status(200).json({
          status:'success',
          data:JSON.parse(response.body)
      })

})
.catch(err=>{
          console.log(err);
           res.status(500).json({
          status:'fail'
      })
      });
   
    
      
  }
  else{
       console.log(err);
      res.status(500).json({
          status:'fail'
      })
     
  }
})



},
maintenancePaymentWebhook:function(req,res){


 db.raw(`update parking_system.maintenance set payment_status = 'PAID',attribute2=? where attribute1 = ?  `,[req.body.payment_id,req.body.payment_request_id]
)
.then(results=>{
 res.status(200).json({
          status:'success'
      })

})
.catch(err=>{
     console.log(err);
          res.status(500).json({
          status:'fail'
      })
      });

},

paymentInfo: function(req,res){

var headers = { 'X-Api-Key': '7915af215db9a3dd21e8daabe064431c', 'X-Auth-Token': '03922e25e7dc367ae52974fc9e67b8a2'}
request.get(
  'https://www.instamojo.com/api/1.1/payments/'+req.body.payment_id,
  {form: payload,  headers: headers}, function(error, response, body){
      if(!error && response.statusCode == 200)
          {

              res.status(200).json({
          status:'success',
          data:JSON.parse(response.body)
      })
          
        }
})


},


}